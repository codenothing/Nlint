var fs = require( 'fs' ),
	async = require( 'async' ),
	JSON5 = require( 'json5' ),
	child_process = require( 'child_process' ),
	rstartslash = /^\//,
	rendslash = /\/$/,
	rpathseparator = /\//g,
	rjson = /\.json5?$/,
	rfilename = /\/[^\/]+$/,
	NlintFiles = [
		'.nlint',
		'.nlint.json',
		'.nlint.json5',
		'.nlint.js',
	];


function Nlint( files, options, callback ) {
	var self = this;

	// Force Nlint instance
	if ( ! ( self instanceof Nlint ) ) {
		return new Nlint( files, options, callback );
	}
	// Force a file/dir to be defined
	else if ( ! Nlint.isArray( files ) && ! Nlint.isString( files ) ) {
		throw new Error( "No Files Argument" );
	}

	// Handle variable args
	if ( callback === undefined && Nlint.isFunction( options ) ) {
		callback = options || Nlint.noop;
		options = null;
	}

	// For array of files
	if ( ! Nlint.isArray( files ) ) {
		files = [ files ];
	}

	// Generate events on this object
	Nlint.Event( self );

	// Setup
	self.files = files;
	self.options = Nlint.extend( true, {}, options || {} );
	self.settings = new Nlint.Settings( Nlint.Defaults.Settings, self );
	self.settings.update( self.options );
	self.results = [];
	self.ignored = [];
	self.nodelints = [];
	self._nodelints = {};
	self._forks = [];
	self._queue = [];
	self._jobs = {};
	self.fileCount = 0;
	self.fileComplete = 0;

	// Start processing
	self.run( callback || Nlint.noop );
}

Nlint.prototype = {

	// Starter for linting
	run: function( callback ) {
		var self = this;

		// Start processing each file
		async.each(
			self.files,
			function( path, callback ) {
				path = Nlint.normalizePath( path );

				fs.stat( path, function( e, stat ) {
					if ( e ) {
						callback( e );
					}
					else if ( stat.isDirectory() ) {
						path = path[ path.length - 1 ] == '/' ? path : path + '/';

						if ( self.files.length === 1 ) {
							self.nodelint( path, function( e, settings ) {
								if ( e ) {
									return callback( e );
								}

								self.settings = settings;
								self.forks();
								self.dir( path, callback );
							});
						}
						else {
							self.forks();
							self.dir( path, callback );
						}
					}
					else {
						self.forks();
						self.single( path, callback );
					}
				});
			},
			function( e ) {
				if ( e ) {
					return callback( e, self );
				}

				self.close(function( e ) {
					callback( e, self );
				});
			}
		);
	},

	// Creates list of forks that will be used in the process
	forks: function(){
		var self = this;

		if ( self._forks.length ) {
			return;
		}

		Nlint.each( self.settings.fork, function(){
			var child = child_process.fork( Nlint.FORK_FILE );

			// Fail out when something goes wrong
			child.on( 'error', function( e ) {
				throw e;
			});

			// Lint job complete
			child.on( 'message', function( message ) {
				var job = self._jobs[ message.id ];

				if ( job ) {
					delete self._jobs[ job.id ];
					self._forks.push( child );
					job.callback.apply( self, message.args );
				}

				self._checkQueue();
			});

			// Closing of child
			[ 'exit', 'close' ].forEach(function( name ) {
				child.on( name, function(){
					var index = self._forks.indexOf( child );

					if ( index > -1 ) {
						self._forks.splice( index, 1 );
					}

					if ( ! self._forks.length ) {
						throw new Error( "All forks have failed" );
					}
				});
			});

			self._forks.push( child );
		});
	},

	// Close off any any forks created for linters
	close: function( callback ) {
		var self = this;

		async.each(
			self._forks,
			function( child, callback ) {
				child.removeAllListeners();

				[ 'exit', 'close' ].forEach(function( name ) {
					child.on( name, function(){
						if ( callback ) {
							callback();
							callback = null;
						}
					});
				});

				child.kill();
			},
			callback
		);
	},

	// Renders a path based on options
	render: function( path, settings, callback ) {
		var self = this,
			result = new Nlint.FileResult( path );

		// Block paths that should be ignored
		if ( settings.ignore( path ) ) {
			self.ignored.push( path );
			return callback();
		}

		// Add to results
		self.results.push( result );

		// Filter through list of linters to find one that will render the path
		async.each(
			Nlint.Linters,
			function( linter, callback ) {
				if ( linter.isMatch( path, settings, self ) && settings.use( linter.lname ) ) {
					self._runLint( result, settings, linter, callback );
				}
				else {
					callback();
				}
			},
			callback
		);
	},

	// Runs the actual linter on the path
	_runLint: function( result, settings, linter, callback ){
		var self = this,

			// We have to create a copy of the options used for each linter in case
			// the linter itself alters the options
			// (First culprit being JSHint 2.1.4)
			options = Nlint.extend( true, {}, settings.linters( linter.lname ) ),

			// Callback for when rendering is finished
			complete = function( e, errors, warnings, times ) {
				if ( e ) {
					return callback( e );
				}

				// Progress
				self.fileComplete++;
				self.emit( 'progress', result.path );

				// Add results to the file object
				try {
					result.addResults( errors, warnings, times, linter.name );
				}
				catch ( formatError ) {
					e = formatError;
				}

				callback( e );
			};

		// progress
		self.fileCount++;
		self.emit( 'progress' );

		// Use a forked process to run the lint job
		if ( self.settings.fork > 0 ) {
			self._queue.push({
				id: self.fileCount,
				callback: complete,
				send: {
					id: self.fileCount,
					path: result.path,
					linter: linter.path,
					settings: options
				}
			});

			self._checkQueue();
		}
		// Run linter in the main process (potentially blocks)
		else {
			linter.render( result.path, options, complete );
		}
	},

	// Checks fork queues to see if another path can be processed
	_checkQueue: function(){
		var self = this, job;

		if ( self._queue.length && self._forks.length ) {
			job = self._queue.shift();
			self._jobs[ job.id ] = job;
			self._forks.shift().send( job.send );
		}
	},

	// Handles single file linting
	single: function( path, callback ) {
		var self = this;

		self.nodelint( path.replace( rfilename, '/' ), function( e, settings ) {
			if ( e ) {
				return callback( e );
			}

			self.render( path, settings, callback );
		});
	},

	// Handles directory of linting
	dir: function( path, callback ) {
		var self = this;

		async.parallel([
			function( callback ) {
				fs.readdir( path, callback );
			},
			function( callback ) {
				self.nodelint( path, callback );
			},
		],
		function( e, results ) {
			if ( e ) {
				callback( e );
			}
			else {
				self._dir( path, results[ 0 ], results[ 1 ], callback );
			}
		});
	},

	// Renders files or traverses subdirectories
	_dir: function( path, files, settings, callback ) {
		var self = this;

		async.each(
			files,
			function( file, callback ) {
				var filepath = path + file, full;

				fs.stat( filepath, function( e, stat ) {
					// There shouldn't be any errors, unless the file isn't accessible
					if ( e ) {
						callback( e );
					}
					// Follow the rabbit hole
					else if ( stat.isDirectory() ) {
						full = filepath[ filepath.length - 1 ] == '/' ? filepath : filepath + '/';

						if ( settings.ignore( full ) ) {
							self.ignored.push( full );
							return callback();
						}

						self.dir( full, callback );
					}
					// Render each file (will handle ignores internally)
					else {
						self.render( filepath, settings, callback );
					}
				});
			},
			callback
		);
	},

	// Pulls nodelint files together, and generates options object based on the current directory
	nodelint: function( path, callback ) {
		var self = this,
			parts = path.replace( rendslash, '' ).split( rpathseparator ),
			prefix = '';

		async.map(
			parts,
			function( dir, callback ) {
				self._nodelint( prefix += dir + '/', callback );
			},
			function( e ) {
				callback( e, e ? undefined : self._renderSettings( path ) );
			}
		);
	},

	// Renders all possible Nlint config files in a directory
	_nodelint: function( prefix, callback ) {
		var self = this;

		async.each(
			NlintFiles,
			function( ignore, callback ) {
				var path = prefix + ignore;

				// Use pre-read options if possible
				if ( self._nodelints[ path ] === undefined ) {
					self._renderNodelint( path, callback );
				}
				else {
					callback();
				}
			},
			callback
		);
	},

	// Parses nodelint files and stores them
	_renderNodelint: function( path, callback ) {
		var self = this;

		// Read contents and store them
		fs.stat( path, function( e, stat ) {
			var result = null;

			// File isn't accessible
			if ( e ) {
				self._nodelints[ path ] = null;
				return callback();
			}

			// Logger
			self.nodelints.push( path );

			// JSON/JSON5 nodelint files
			if ( rjson.exec( path ) ) {
				fs.readFile( path, 'utf8', function( e, contents ) {
					if ( e ) {
						return callback( e );
					}

					try {
						self._nodelints[ path ] = JSON5.parse( contents );
					}
					catch ( jsonError ) {
						self._nodelints[ path ] = null;
						e = jsonError;
					}

					callback( e );
				});
			}
			// Nlint js files have options assigned to module.exports
			else {
				result = Nlint.require( path );

				// Mark as read(null) if require didn't work
				self._nodelints[ path ] = result.result || null;

				// Pass along any possible error
				callback( result.error );
			}
		});
	},

	// Generates a settings object for the directory
	_renderSettings: function( path ) {
		var self = this,
			parts = path.split( rpathseparator ),
			settings = new Nlint.Settings( Nlint.Defaults.Settings, self ),
			prefix = '';

		// Cycle through each parent directory for nodelint updates
		parts.forEach(function( dir ) {
			prefix += dir + '/';

			NlintFiles.forEach(function( ignore ) {
				var key = prefix + ignore;

				if ( self._nodelints[ key ] ) {
					settings.update( self._nodelints[ key ], prefix );
				}
			});
		});

		// Options passed into root instance override all others
		settings.update( self.options );

		return settings;
	}

};


// Expose Nlint
module.exports = Nlint;
