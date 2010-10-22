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
	rignore = /\.lintignore$/,
	rslicefile = /\/[^\/]*$/,
	rslash = /\//g,
	rstar = /\*/g,
	rlbrace = /\(/g,
	rrbrace = /\)/g,
	rlbracket = /\{/g,
	rrbracket = /\}/g,
	rdollar = /\$/g,
	rstart = /\^/g;



// Cleans a regex path
function PathRegex( path ) {
	return new RegExp( "^" + 
		path.replace( rslash, "\\/" )
			.replace( rstar, ".*" )
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
				Nodelint.error( e );
			}
			else {
				var isDirectory = stat.isDirectory(), current = '/', convert = path,
					track = new Tracking('Circular Lint Ignore', function( e, results ) {
						if ( e ) {
							Nodelint.error( e );
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


				// Go through each directory along the tree and pick up all
				// ignore files
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
			}
		});
	}
}

Render.prototype = {

	// Custom File Reading
	readFile: function( file, callback ) {
		var self = this;

		fs.readFile( file, 'utf-8', function( e, data ) {
			// Only mark non-lintignore files as missing
			if ( e && typeof e == 'string' && ! rignore.exec( e ) ) {
				self.missing.push( e );
			}
			callback.call( self, file, data || '' );
		});
	},

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

	// JSLint ignore files
	lintignore: function( dir, callback ) {
		var self = this;

		// Force closing slash
		if ( dir[ dir.length - 1 ] != '/' ) {
			dir += '/';
		}
		
		// Don't re-read ignore files
		if ( self._lintignore.indexOf( dir + '.lintignore' ) > -1 ) {
			return callback.call( self );
		}

		// Mark file as read, and continue on
		self._lintignore.push( dir + '.lintignore' );
		self.readFile( dir + '.lintignore', function( file, data ) {
			var track = new Tracking('Parsing Ignore List', function( e, results ) {
				if ( e ) {
					Nodelint.error( e );
				}
				else {
					callback.call( self );
				}
			});

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
					track.mark( line, true );
					return;
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
		});
	},

	// Normalizing paths to full paths
	normalize: function( path, callback ) {
		var self = this;

		fs.realpath( path, function( e, path ) {
			if ( e ) {
				Nodelint.error( e );
			}
			else {
				callback.call( self, Path.normalize( path ) );
			}
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
			self.normalize( path, function( path ) {
				fs.stat( path, function( e, stat ) {
					if ( e ) {
						Nodelint.error( e );
					}
					else {
						callback.call( self, null, stat, path );
					}
				});
			});
		});
	},

	// Single Exit
	fin: function( callback ) {
		callback.call( this, null, this );
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

		self.normalize( file, function( file ) {
			self.readFile( file, function( file, data ) {
				// Tracking number of files linted
				self.count.files++;

				// Send processing back to caller
				Nodelint.info( "JSLinting " + file );

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

				self.fin( callback );
			});
		});
	},

	// Linting directories
	dir: function( path, callback ) {
		var self = this;

		// Make sure we are dealing with a full path
		if ( path[ 0 ] != '/' ) {
			self.normalize( path, function( path ) {
				self.dir( path, callback );
			});
			return;
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
					return self.fin( callback );
				}

				// Tracking directory read
				var track = Tracking("Render Directory Files", function( e ) {
					if ( e ) {
						Nodelint.error( e );
					} else {
						self.fin( callback );
					}
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
