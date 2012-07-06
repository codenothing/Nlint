var Nodelint = global.Nodelint,
	PATH = require( 'path' ),
	EventEmitter = require( 'events' ).EventEmitter,
	toString = Object.prototype.toString,
	Slice = Array.prototype.slice,
	rhome = /^\~\//,
	rpathprefix = /^(\/|\.\.\/)/;


// Type tests
"Boolean Number String Function Array Date RegExp Object Error".split(' ').forEach(function( method ) {
	if ( method == 'Array' ) {
		return ( Nodelint.isArray = Array.isArray );
	}
	else if ( method == 'Error' ) {
		Nodelint.isError = function( object ) {
			return object && ( object instanceof Error );
		};

		return;
	}

	var match = '[object ' + method + ']';
	Nodelint[ 'is' + method ] = function( object ) {
		return object !== undefined && object !== null && toString.call( object ) == match;
	};
});


// Extensions
Nodelint.extend = function(){
	var args = Slice.call( arguments ), i = -1, l = args.length, deep = false, target = this, name, copy;

	// Check for deep copy
	if ( Nodelint.isBoolean( args[ 0 ] ) ) {
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
			if ( deep && copy[ name ] && Nodelint.isArray( copy[ name ] ) ) {
				target[ name ] = Nodelint.extend( deep, target[ name ] || [], copy[ name ] );
			}
			else if ( deep && Nodelint.isObject( copy[ name ] ) ) {
				target[ name ] = Nodelint.extend( deep, target[ name ] || {}, copy[ name ] );
			}
			else {
				target[ name ] = copy[ name ];
			}
		}
	}

	return target;
};


Nodelint.extend({

	// Blank function
	noop: function(){},

	// Iterations
	each: function( items, fn ) {
		var i, l;

		if ( Nodelint.isArray( items ) ) {
			for ( i = -1, l = items.length; ++i < l; ) {
				if ( fn.call( items[ i ], items[ i ], i ) === false ) {
					break;
				}
			}
		}
		else {
			for ( i in items ) {
				if ( fn.call( items[ i ], items[ i ], i ) === false ) {
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
		emitter.on( 'error', Nodelint.noop );
		[ 'on', 'once', 'emit', 'removeListener', 'removeAllListeners' ].forEach(function( name ) {
			if ( ! object.hasOwnProperty( name ) ) {
				object[ name ] = emitter[ name ].bind( emitter );
			}
		});
	},

	// Path normalizer
	normalizePath: function( path, root ) {
		if ( rhome.exec( path ) ) {
			path = process.env.HOME + '/' + path;
		}
		else if ( ! rpathprefix.exec( path ) ) {
			path = ( root || process.cwd() ) + '/' + path;
		}

		return PATH.normalize( path ) + ( path[ path.length - 1 ] == '/' ? '/' : '' );
	},

	// Cleans a path for regex
	// Enclosed as no need to litter the script with regex patterns
	regexPath: (function(){
		var rstar = /\*/g,
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
				( path || '' ).replace( rstar, ".*" )
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
