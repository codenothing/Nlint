/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var fs = require('fs'),
	sys = require('sys'),
	Path = require('path'),
	Options = require('../../Options').Options,
	Tracking = require('./Tracking').Tracking,
	rjs = /\.js$/,
	rignore = /\.lintignore$/,
	rslicefile = /\/[^\/]*$/;

// Helper Util
function extend(){
	var args = Array.prototype.slice.call( arguments ), target = args.shift(), i = -1, l = args.length, name, copy;

	for ( ; ++i < l; ) {
		copy = args[ i ];
		for ( name in copy ) {
			if ( copy.hasOwnProperty( name ) ) {
				target[ name ] = copy[ name ];
			}
		}
	}

	return target;
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
	self.options = extend( { nodelint: {}, jslint: Options || {} }, options || {} );
	console.log( Options.nodelint.jslint );
	self.jslint = require( Options.nodelint.jslint || '../jslint/jslint' ).JSLINT;
	self.ignore = [];
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
				Render.error( e );
			}
			else {
				var isDirectory = stat.isDirectory(), current = '/', convert = path,
					track = new Tracking('Circular Lint Ignore', function( e, results ) {
						if ( e ) {
							Render.error( e );
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
					Render.error( e );
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

				// Compile a clean path
				self.stat( dir + line, function( e, stat, path ) {
					if ( e ) {
						Render.warn( e );
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
				Render.error( e );
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
						Render.error( e );
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

	// Linting files
	file: function( file, callback ) {
		var self = this;

		self.normalize( file, function( file ) {
			self.readFile( file, function( file, data ) {
				// Tracking number of files linted
				self.count.files++;

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

		Render.info( "Reading " + path );
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

				// Log files
				var length = files.length;
				files.forEach(function( file ) {
					self.stat( file, function( e, stat, file ) {
						// Hope not
						if ( e ) {
							if ( --length < 1 ) {
								self.fin( callback );
							}
							return;
						}
						

						// Force slash on directorys
						if ( stat.isDirectory() && file[ file.length - 1 ] != '/' ) {
							file += '/';
						}


						// On ignore path, do nothing
						if ( self.ignore.indexOf( file ) > -1 ) {
							if ( --length < 1 ) {
								self.fin( callback );
							}
							return;
						}


						// Directory, render it again
						if ( stat.isDirectory() ) {
							self.dir( file, function(){
								if ( --length < 1 ) {
									self.fin( callback );
								}
							});
						}
						// We only lint js files
						else if ( rjs.exec( file ) ) {
							self.file( file, function(){
								if ( --length < 1 ) {
									self.fin( callback );
								}
							});
						}
						// Might need last file
						else if ( --length < 1 ) {
							self.fin( callback );
						}
					});
				});
			});
		});
	}

};


extend( Render, {

	// Large directories take time to process, overwritting
	// the info to output onto the terminal will enhance ux
	info: function( msg ) {
		// Do something with the msg
	},

	// There are instances where we want to warn about a missing
	// file, but don't want to kill the process
	warn: function( msg ) {
		// Do something with the warning
	},

	// Custom error handling
	error: function( e ) {
		throw ( typeof e == 'string' ? new Error( e ) : e );
	}

});


// Expose rendering handler
exports.Render = Render;
