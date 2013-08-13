var Nlint = global.Nlint,
	PATH = require( 'path' ),
	EventEmitter = require( 'events' ).EventEmitter,
	toString = Object.prototype.toString,
	Slice = Array.prototype.slice,
	rhome = /^\~\//,
	rpathprefix = /^\//;


// Type tests
"Boolean Number String Function Array Date RegExp Object Error".split(' ').forEach(function( method ) {
	if ( method == 'Array' ) {
		return ( Nlint.isArray = Array.isArray );
	}
	else if ( method == 'Error' ) {
		Nlint.isError = function( object ) {
			return object && ( object instanceof Error );
		};

		return;
	}

	var match = '[object ' + method + ']';
	Nlint[ 'is' + method ] = function( object ) {
		return object !== undefined && object !== null && toString.call( object ) == match;
	};
});


// Extensions
Nlint.extend = function(){
	var args = Slice.call( arguments ), i = -1, l = args.length, deep = false, target = this, name, copy;

	// Check for deep copy
	if ( Nlint.isBoolean( args[ 0 ] ) ) {
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
			if ( deep && copy[ name ] && Nlint.isArray( copy[ name ] ) ) {
				target[ name ] = Nlint.extend( deep, target[ name ] || [], copy[ name ] );
			}
			else if ( deep && Nlint.isObject( copy[ name ] ) ) {
				target[ name ] = Nlint.extend( deep, target[ name ] || {}, copy[ name ] );
			}
			else {
				target[ name ] = copy[ name ];
			}
		}
	}

	return target;
};


Nlint.extend({

	// Fork File
	FORK_FILE: __dirname + '/Fork.js',

	// Blank function
	noop: function(){},

	// Iterations
	each: function( items, fn ) {
		var i, l;

		if ( Nlint.isNumber( items ) ) {
			for ( i = -1; ++i < items; ) {
				if ( fn( i, null, items ) === false ) {
					break;
				}
			}
		}
		else if ( Nlint.isArray( items ) ) {
			for ( i = -1, l = items.length; ++i < l; ) {
				if ( fn( items[ i ], i, items ) === false ) {
					break;
				}
			}
		}
		else {
			for ( i in items ) {
				if ( fn( items[ i ], i, items ) === false ) {
					break;
				}
			}
		}

		return items;
	},

	// Attach custom events module to object
	Event: function( object ) {
		if ( ! object ) {
			return object;
		}

		var emitter = object.__EventEmitter = new EventEmitter();
		emitter.on( 'error', Nlint.noop );
		[ 'on', 'once', 'emit', 'removeListener', 'removeAllListeners' ].forEach(function( name ) {
			if ( ! object.hasOwnProperty( name ) ) {
				object[ name ] = emitter[ name ].bind( emitter );
			}
		});
	},

	// Path normalizer
	normalizePath: function( path, root ) {
		var end = path[ path.length - 1 ] == '/';

		if ( rhome.exec( path ) ) {
			path = process.env.HOME + path.replace( rhome, '/' );
		}
		else if ( ! rpathprefix.exec( path ) ) {
			path = ( root || process.cwd() ) + '/' + path;
		}

		return ( path = PATH.normalize( path ) ) + ( end && path[ path.length - 1 ] != '/' ? '/' : '' );
	},

	// Custom require that exposes Nlint to the global
	// scope during evaluation
	require: function( path ) {
		var _Nlint = global.Nlint, result, error;
		global.Nlint = Nlint;

		try {
			result = require( path );
		}
		catch ( e ) {
			error = e;
		}

		global.Nlint = _Nlint;
		return { result: result, error: error };
	},

	// Cleans a path for regex
	// Enclosed as no need to litter the script with regex patterns
	regexPath: (function(){
		var rdot = /\./g,
			rstar = /\*/g,
			rquot = /'/g,
			rdquot = /"/g,
			rslash = /\//g,
			rlparen = /\(/g,
			rrparen = /\)/g,
			rlbracket = /\{/g,
			rrbracket = /\}/g,
			rlbrace = /\[/g,
			rrbrace = /\]/g,
			rdollar = /\$/g,
			rstart = /\^/g;

		// Return an enclosed function for conversions
		return function( path ) {
			return new RegExp( "^" + 
				( path || '' ).replace( rdot, "\\." )
					.replace( rstar, ".*" )
					.replace( rquot, "\\'" )
					.replace( rdquot, "\\\"" )
					.replace( rslash, "\\/" )
					.replace( rlparen, "\\(" )
					.replace( rrparen, "\\)" )
					.replace( rlbracket, "\\{" )
					.replace( rrbracket, "\\}" )
					.replace( rlbrace, "\\[" )
					.replace( rrbrace, "\\]" )
					.replace( rdollar, "\\$" )
					.replace( rstart, "\\^" ) +
			"$" );
		};
	})()

});
