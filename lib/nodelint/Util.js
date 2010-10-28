/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint;


// Extension Utility
Nodelint.extend = function(){
	var args = Array.prototype.slice.call( arguments ), i = -1, l = args.length, deep = false, target = this, name, copy;

	// Check for deep copy
	if ( typeof args[ 0 ] == 'boolean' ) {
		deep = args.shift();
		l = args.length;
	}
	
	// Check for multi object extension
	if ( l > 1 ) {
		target = args[ 0 ];
		i = 0;
	}

	for ( ; ++i < l; ) {
		copy = args[ i ];
		for ( name in copy ) {
			if ( copy.hasOwnProperty( name ) ) {
				target[ name ] = deep && typeof copy[ name ] == 'object' && copy[ name ] !== null ? 
					Nodelint.extend( deep, target[ name ] || {}, copy[ name ] ) :
					copy[ name ];
			}
		}
	}

	return target;
};


// Other Utils
Nodelint.extend({

	each: function( items, scope, fn ) {
		var i = -1, l = items.length;

		// Allow for custom scoping
		if ( fn === undefined && typeof scope == 'function' ) {
			fn = scope;
			scope = undefined;
		}

		// Iterating over an object
		if ( l === undefined ) {
			for ( i in items ) {
				if ( fn.call( scope || items, items[ i ], i, items ) === false ) {
					break;
				}
			}
		}
		else {
			for ( ; ++i < l; ) {
				if ( fn.call( scope || items, items[ i ], i, items ) === false ) {
					break;
				}
			}
		}

		return items;
	}

});
