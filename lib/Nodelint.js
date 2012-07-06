var fs = require( 'fs' ),
	rstartslash = /^\//,
	rendslash = /\/$/,
	rpathseparator = /\//g,
	rjs = /\.js$/,
	rfilename = /\/[^\/]+$/,
	LintIgnoreFiles = [
		'.lintignore',
		'.lintignore.json',
		'.lintignore.json5',
		'.lintignore.js'
	];


function Nodelint( files, options, callback ) {
	var self = this;

	// Force nodelint
	if ( ! ( self instanceof Nodelint ) ) {
		return new Nodelint( files, options, callback );
	}

	// Handle variable args
	if ( callback === undefined && Nodelint.isFunction( options ) ) {
		callback = options || Nodelint.noop;
		options = null;
	}

	// For array of files
	if ( ! Nodelint.isArray( files ) ) {
		files = [ files ];
	}

	// Generate events on this object
	Nodelint.Event( self );

	// Setup
	self.files = files;
	self.options = Nodelint.extend( {}, options || {} );
	self.settings = new Nodelint.Settings( self.options, self );
	self.callback = callback || Nodelint.noop;
	self.warnings = [];
	self.errors = [];
	self.passed = [];
	self._ignore = {};
	self.fileCount = 0;

	// Start processing
	self.run();
}

Nodelint.prototype = {

	// Just a logging proxy
	log: function( msg ) {
		var self = this;

		self.emit( 'output', msg );
	},

	// Wraps info messages in blue output
	info: function( msg ) {
		var self = this;

		self.emit( 'output', Nodelint.Color.get.blue( msg ) );
	},

	// Wraps warning messages in yellow output
	warn: function( msg ) {
		var self = this;

		self.emit( 'output', Nodelint.Color.get.yellow( msg ) );
	},

	// Starter for linting
	run: function(){
		var self = this, track = new Nodelint.Tracking( 'Root-Nodelint', function( e, results ) {
			self.callback( e, self );
		});

		self.files.forEach(function( path ) {
			track.mark( path = Nodelint.normalizePath( path ) );

			fs.stat( path, function( e, stat ) {
				if ( e ) {
					track.mark( path, true );
				}
				else if ( stat.isDirectory() ) {
					self.dir( ( path[ path.length - 1 ] == '/' ? path : path + '/' ), function( e ) {
						if ( e ) {
							track.error( e );
						}
						else {
							track.mark( path, true );
						}
					});
				}
				else {
					self.single( path, function( e ) {
						if ( e ) {
							track.error( e );
						}
						else {
							track.mark( path, true );
						}
					});
				}
			});
		});

		track.start();
	},

	// Checks arrays returned by the linter
	_lintCheck: function( path, linter, type, array ) {
		var self = this;

		// If an array isn't returned, block it
		if ( ! Nodelint.isArray( array ) ) {
			throw new Error( linter + " didn't return an array for " + type );
		}

		// Check each entry to ensure all expected values exist
		array.forEach(function( value ) {
			if ( ! value.message ) {
				throw new Error( linter + " didn't return a message for a '" + type + "', bad formatting" );
			}
			else if ( ! value.line ) {
				throw new Error( linter + " didn't return a line number for a '" + type + "', bad formatting" );
			}
			else if ( ! value.character ) {
				throw new Error( linter + " didn't return a character number for a '" + type + "', bad formatting" );
			}

			// Force path addition
			if ( ! value.path ) {
				value.path = path;
			}
		});
	},

	// Renders a path based on options
	render: function( path, settings, callback ) {
		var self = this,
			lint = settings.linter( path ),
			hasMatch = false,
			special;

		// Block paths that should be ignored
		if ( ! lint && settings.ignore( path ) ) {
			self.warn( 'Ignoring ' + path );
			return callback();
		}

		// Filter through list of linters to find one that will render the path
		Nodelint.each( Nodelint.Linters, function( linter ) {
			if ( linter.isMatch( path ) && settings.use( linter.lname ) ) {
				hasMatch = true;
				special = Nodelint.extend( true, {},
					Nodelint.Defaults.linters[ linter.lname ] || {},
					settings.linters( path ),
					settings.special( path )
				);

				self.fileCount++;
				self.info( "Running " + linter.realname + " on " + path );
				linter.render( path, special, function( e, errors, warnings ) {
					if ( e ) {
						return callback( e );
					}

					// Attach any errors/warnings
					if ( ( errors && errors.length ) || ( warnings && warnings.length ) ) {
						if ( errors ) {
							try {
								self._lintCheck( path, linter.realname, 'error', errors );
							}
							catch ( lintError ) {
								return callback( lintError );
							}

							self.errors.push.apply( self.errors, errors );
						}

						if ( warnings ) {
							try {
								self._lintCheck( path, linter.realname, 'warning', warnings );
							}
							catch ( lintWarning ) {
								return callback( lintWarning );
							}

							self.warnings.push.apply( self.warnings, warnings );
						}
					}
					// Green light
					else {
						self.passed.push( path );
					}

					callback();
				});

				return false;
			}
		});

		// No linter found, ignore it
		if ( ! hasMatch ) {
			callback();
		}
	},

	// Handles single file linting
	single: function( path, callback ) {
		var self = this;

		self.lintignore( path.replace( rfilename, '/' ), function( e, settings ) {
			if ( e ) {
				return callback( e );
			}

			self.render( path, settings, callback );
		});
	},

	// Sets up options and files for rendering
	dir: function( path, callback ) {
		var self = this, track = new Nodelint.Tracking( 'Directory Normalizer - ' + path, function( e, results ) {
			if ( e ) {
				callback( e );
			}
			else {
				self._dir( path, results.files, results.settings, callback );
			}
		});

		// Option generator
		track.mark( 'settings' );
		self.lintignore( path, function( e, settings ) {
			if ( e ) {
				track.error( e );
			}
			else {
				track.mark( 'settings', settings );
			}
		});

		// Directory reader
		track.mark( 'files' );
		fs.readdir( path, function( e, files ) {
			if ( e ) {
				track.error( e );
			}
			else {
				track.mark( 'files', files );
			}
		});

		track.start();
	},

	// Renders files or traverses subdirectories
	_dir: function( path, files, options, callback ) {
		var self = this, track = new Nodelint.Tracking( 'Directory - ' + path, callback );

		files.forEach(function( file ) {
			var key = path + file;

			track.mark( key );
			fs.stat( key, function( e, stat ) {
				// There shouldn't be any errors, unless the file isn't accessible
				if ( e ) {
					track.error( e );
				}
				// Follow the rabbit hole
				else if ( stat.isDirectory() ) {
					if ( options.ignore( key ) ) {
						self.warn( 'Ignoring ' + key );
						return track.mark( key, true );
					}

					self.dir( key + '/', function( e ) {
						if ( e ) {
							track.error( e );
						}
						else {
							track.mark( key, true );
						}
					});
				}
				// Render each file (will handle ignores internally)
				else {
					self.render( key, options, function( e ) {
						if ( e ) {
							track.error( e );
						}
						else {
							track.mark( key, true );
						}
					});
				}
			});
		});

		track.start();
	},

	// Pulls lintignore files together, and generates options object based on the current directory
	lintignore: function( path, callback ) {
		var self = this,
			parts = path.replace( rendslash, '' ).split( rpathseparator ),
			prefix = '',
			track = new Nodelint.Tracking( 'Lint-Ignore', function( e, results ) {
				if ( e ) {
					callback( e );
				}
				else {
					callback( null, self._renderIgnores( path ) );
				}
			});

		parts.forEach(function( dir ) {
			var innerPrefix = ( prefix += dir + '/' );

			// Check JSON files
			LintIgnoreFiles.forEach(function( ignore ) {
				var key = innerPrefix + ignore;

				// Continue if options already read
				if ( self._ignore[ key ] !== undefined ) {
					return;
				}

				// Read contents and store them
				track.mark( key );
				fs.stat( key, function( e, stat ) {
					if ( e ) {
						self._ignore[ key ] = null;
						return track.mark( key, true );
					}

					// Logger
					self.info( 'Reading Lintignore File ' + key );

					// Lintignore can be a js/json(5) file
					if ( rjs.exec( key ) ) {
						try {
							self._ignore[ key ] = require( key );
							track.mark( key, true );
						}
						catch ( jsError ) {
							track.error( jsError );
						}
					}
					else {
						fs.readFile( key, 'utf8', function( e, contents ) {
							if ( e ) {
								track.error( e );
							}
							else {
								try {
									self._ignore[ key ] = Nodelint.Depends.JSON5.parse( contents );
									track.mark( key, true );
								}
								catch ( jsonError ) {
									track.error( jsonError );
								}
							}
						});
					}
				});
			});
		});

		track.start();
	},

	// Generates a settings object for the directory
	_renderIgnores: function( path ) {
		var self = this,
			parts = path.split( rpathseparator ),
			settings = new Nodelint.Settings( self.options ),
			prefix = '';

		parts.forEach(function( dir ) {
			prefix += dir + '/';

			LintIgnoreFiles.forEach(function( ignore ) {
				var key = prefix + ignore;

				if ( self._ignore[ key ] ) {
					settings.update( self._ignore[ key ], prefix );
				}
			});
		});

		return settings;
	}

};


// Expose nodelint
module.exports = Nodelint;
