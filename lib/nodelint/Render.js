/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	fs = require('fs'),
	sys = require('sys'),
	Path = require('path'),
	Options = Nodelint.Options,
	Tracking = Nodelint.Tracking,
	rjs = /\.js$/,
	rslicefile = /\/[^\/]*$/,
	rstar = /\*/g,
	rslash = /\//g,
	rlbrace = /\(/g,
	rrbrace = /\)/g,
	rlbracket = /\{/g,
	rrbracket = /\}/g,
	rdollar = /\$/g,
	rstart = /\^/g;



// Cleans a regex path
function PathRegex( path ) {
	return new RegExp( "^" + 
		( path || '' ).replace( rstar, ".*" )
			.replace( rslash, "\\/" )
			.replace( rlbrace, "\\(" )
			.replace( rrbrace, "\\)" )
			.replace( rlbracket, "\\{" )
			.replace( rrbracket, "\\}" )
			.replace( rdollar, "\\$" )
			.replace( rstart, "\\^" ) +
	"$" );
}


// Rendering Constructor
function Render( file, options, callback ) {
	if ( ! ( this instanceof Render ) ) {
		return new Render( file, options, callback );
	}
	else if ( callback === undefined && typeof options == 'function' ) {
		callback = options;
		options = {};
	}

	var self = this;
	self.options = Nodelint.extend( true, Nodelint.Options, options || {} );
	self.jslint = require( self.options.nodelint.jslint || '../jslint/jslint' ).JSLINT;
	self.ignore = [];
	self._rignore = [];
	self._lintignore = [];
	self.missing = [];
	self.passes = [];
	self.errors = [];
	self.count = {
		files: 0,
		errors: 0
	};

	// Start the rendering process if filepath provided
	if ( file && file !== '' ) {
		self.stat( file, function( e, stat, path ) {
			if ( e ) {
				return callback.call( self, e );
			}

			var isDirectory = stat.isDirectory(), current = '/', convert = path,
				track = new Tracking('Circular Lint Ignore', function( e, results ) {
					if ( e ) {
						callback.call( self, e );
					}
					else {
						self[ isDirectory ? 'dir' : 'file' ]( path, callback );
					}
				});


			// Strip the file name if not a directory
			if ( ! isDirectory ) {
				convert = convert.replace( rslicefile, '' );
			}

			// Unlikely, but look for ignore file in the root directory
			track.mark( 'root' );
			self.lintignore( '/', function(){
				track.mark( 'root', true );
			});

			// Go through each directory along the tree and pick up all ignore files
			convert.split('/').forEach(function( dir ) {
				if ( ! dir || dir === '' ) {
					return;
				}
				current += dir + '/';

				// Read the ignore file
				var id = track.mark();
				self.lintignore( current, function(){
					track.mark( id, true );
				});
			});

			// Start tracking
			track.start();
		});
	}
}

Render.prototype = {

	// Custom Direcotry Readying
	readdir: function( path, callback ) {
		var self = this;

		// Force closing slash
		if ( path[ path.length - 1 ] !== '/' ) {
			path += '/';
		}

		// Read the required directory
		fs.readdir( path, function( e, files ) {
			if ( e ) {
				callback.call( self, e );
			}

			// Add path prefix to every file
			var i = files.length;
			while ( i-- ) {
				files[ i ] = path + files[ i ];
			}

			// Return converted paths
			callback.call( self, null, path, files );
		});
	},

	// Abstracted for less complexity
	parseLintignore: function( dir, data, callback ) {
		// Need tracker for each line
		var self = this, track = new Tracking( 'Parsing Ignore List: ' + dir + '.lintignore', callback );

		// ignore file is line based
		data.split("\n").forEach(function( line ) {
			// Skip over comment and empty lines
			if ( ! line || line === '' || line[ 0 ] == '#' ) {
				return;
			}

			// Mark file
			track.mark( line );

			if ( line.indexOf('*') > -1 ) {
				self._rignore.push(
					PathRegex( Path.normalize( dir + line ) )
				);
				return track.mark( line, true );
			}

			// Compile a clean path
			self.stat( dir + line, function( e, stat, path ) {
				if ( e ) {
					Nodelint.warn( e );
					return track.mark( line, e );
				}

				// Force ending slash
				if ( stat.isDirectory() && path[ path.length - 1 ] != '/' ) {
					path += '/';
				}

				// Add to ignore list
				self.ignore.push( path );
				track.mark( line, true );
			});
		});

		// Start tracking
		track.start();
	},

	// JSLint ignore files
	lintignore: function( dir, callback ) {
		var self = this, lintignore = dir + '.lintignore';

		// Force closing slash
		if ( dir[ dir.length - 1 ] != '/' ) {
			lintignore = ( dir += '/' ) + '.lintignore';
		}
		
		// Don't re-read ignore files
		if ( self._lintignore.indexOf( lintignore ) > -1 ) {
			return callback.call( self );
		}

		// Mark file as read, and continue on
		self._lintignore.push( lintignore );
		Path.exists( lintignore, function( exists ) {
			if ( ! exists ) {
				return callback.call( self );
			}

			// Parse the ignore spec
			fs.readFile( lintignore, 'utf-8', function( e, data ) {
				return e ? callback.call( self, e ) : self.parseLintignore( dir, data || '', callback );
			});
		});
	},

	// Normalizing paths to full paths
	normalize: function( path, callback ) {
		var self = this;

		fs.realpath( path, function( e, path ) {
			callback.call( self, e, e || Path.normalize( path ) );
		});
	},

	// Custom path stats, normalizes the path
	stat: function( path, callback ) {
		var self = this;

		Path.exists( path, function( exists ) {
			if ( ! exists ) {
				self.missing.push( "Invalid File or Path: " + path );
				callback.call( self, "Invalid File or Path: " + path );
				return;
			}

			// Normalize it before sending the stat info back
			self.normalize( path, function( e, path ) {
				if ( e ) {
					return callback.call( self, e );
				}

				fs.stat( path, function( e, stat ) {
					callback.call( self, null, stat, path );
				});
			});
		});
	},

	// Loops through regex array for a match
	rignore: function( path ) {
		var i = this._rignore.length;

		while ( i-- ) {
			if ( this._rignore[ i ].exec( path ) ) {
				return true;
			}
		}

		return false;
	},

	// Linting files
	file: function( file, callback ) {
		var self = this;

		self.normalize( file, function( e, file ) {
			if ( e ) {
				return callback.call( self, e );
			}

			fs.readFile( file, 'utf-8', function( e, data ) {
				if ( e ) {
					return callback.call( self, e );
				}

				// Tracking number of files linted
				self.count.files++;

				// Send processing back to caller
				Nodelint.info( "JSLinting " + file );

				// lint the file info
				if ( ! self.jslint( data, self.options.jslint ) ) {
					self.count.errors += self.jslint.errors.length;
					self.errors.push({
						file: file,
						errors: self.jslint.errors.slice( 0 )
					});
				}
				else {
					self.passes.push( file );
				}

				callback.call( self, null, self );
			});
		});
	},

	// Linting directories
	dir: function( path, callback ) {
		var self = this;

		// Make sure we are dealing with a full path
		if ( path[ 0 ] != '/' ) {
			return self.normalize( path, function( e, path ) {
				return e ? callback.call( self, e ) : self.dir( path, callback );
			});
		}

		Nodelint.info( "Reading " + path );
		self.lintignore( path, function(){
			self.readdir( path, function( e, path, files ) {
				// Pass error along to the callback
				if ( e ) {
					return callback.call( this, e );
				}

				// No files in this directory, move on
				if ( ! files.length ) {
					return callback.call( self, null, self );
				}

				// Tracking directory read
				var track = Tracking("Rendering Directory: " + path, function( e ) {
					callback.call( self, e, self );
				});

				// Parse over directory
				files.forEach(function( file ) {
					var id = track.mark();
					self.stat( file, function( e, stat, file ) {
						// Hope not
						if ( e ) {
							return track.error( e );
						}


						// Force slash on directorys
						if ( stat.isDirectory() && file[ file.length - 1 ] != '/' ) {
							file += '/';
						}


						// On ignore path, do nothing
						if ( self.ignore.indexOf( file ) > -1  || self.rignore( file ) ) {
							return track.mark( id, true );
						}


						// Directory, render it again
						if ( stat.isDirectory() ) {
							self.dir( file, function(){
								track.mark( id, true );
							});
						}
						// We only lint js files
						else if ( rjs.exec( file ) ) {
							self.file( file, function(){
								track.mark( id, true );
							});
						}
						// Might need last file
						else {
							track.mark( id, true );
						}
					});
				});

				// All files marked
				track.start();
			});
		});
	}

};


// Expose rendering handler
Nodelint.Render = Render;
