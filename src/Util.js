/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	sys = require('sys'),
	Path = require('path'),
	rhome = /^\~\//,
	rroot = /^\//;


var Util = {

	// Meta
	version: "[VERSION]",
	date: "[DATE]",

	// Processing information
	info: function( msg ) {
		sys.puts( Nodelint.Color.blue( msg ) );
	},

	// Missing files, invalid ignore paths, etc.
	warn: function( msg ) {
		sys.puts( Nodelint.Color.yellow( msg ) );
	},

	// Serious error
	error: function( e ) {
		sys.error( Nodelint.Color.bold.red( e.message || e ) );
		process.exit( 1 );
	},

	// Internal path normalizer, handles home and relative directories
	normalize: function( path ) {
		if ( rhome.exec( path ) ) {
			path = path.replace( rhome, process.env.HOME + '/' );
		}
		else if ( ! rroot.exec( path ) ) {
			path = process.cwd() + '/' + path;
		}

		path = Path.normalize( path );
	},

	// Object extensions
	extend: function(){
		var args = Array.prototype.slice.call( arguments ), i = -1, l = args.length, deep = false, target = this, name, copy;

		// Check for deep copy
		if ( typeof args[ 0 ] == 'boolean' ) {
			deep = args.shift();
			l = args.length;
		}
		
		// Check for multi object extension
		if ( l > 1 ) {
			target = args.shift();
			l = args.length;
		}

		for ( ; ++i < l; ) {
			copy = args[ i ];
			for ( name in copy ) {
				if ( copy.hasOwnProperty( name ) ) {
					if ( deep && copy[ name ] && Array.isArray( copy[ name ] ) ) {
						target[ name ] = Util.extend( deep, target[ name ] || [], copy[ name ] );
					}
					else if ( deep && typeof copy[ name ] == 'object' && copy[ name ] !== null ) {
						target[ name ] = Util.extend( deep, target[ name ] || {}, copy[ name ] );
					}
					else {
						target[ name ] = copy[ name ];
					}
				}
			}
		}

		return target;
	},

	// List iterations with a closure
	each: function( items, scope, fn ) {
		var i = -1, l = items.length;

		// Allow for custom scoping
		if ( fn === undefined ) {
			fn = scope;
			scope = undefined;
		}

		// Assign scope
		scope = scope || items;

		// Iterating over an object
		if ( l === undefined ) {
			for ( i in items ) {
				if ( fn.call( scope, items[ i ], i, items ) === false ) {
					break;
				}
			}
		}
		else {
			for ( ; ++i < l; ) {
				if ( fn.call( scope, items[ i ], i, items ) === false ) {
					break;
				}
			}
		}

		return items;
	},

	// Terrible hack to exit after buffers have finished,
	// assumes there is no other processing
	leave: function( code, msg ) {
		sys[ code > 0 ? 'error' : 'puts' ]( msg );
		process.on('exit', function(){
			process.reallyExit( code );
		});
	}

};

// Push utilities onto Nodelint namespace
Util.extend( global.Nodelint, Util );
