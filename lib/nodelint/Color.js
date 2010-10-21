/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var colors = {
	red: "0;31",
	green: "0;32",
	yellow: "0;33",
	blue: "0;34",
	boldred: "1;31",
	boldgreen: "1;32",
	boldyellow: "1;33",
	boldblue: "1;34"
};


// Returns color wrapper terminal string
function Color( color, str ) {
	return "\x1B[" + colors[ color ] + "m" + str + "\x1B[0m";
}


// Simple each handler to attach colors to Color object
function each( obj, fn ) {
	for ( var i in obj ) {
		if ( obj.hasOwnProperty( i ) ) {
			fn( i );
		}
	}
}

each( colors, function( color ) {
	Color[ color ] = function( str ) {
		return Color( color, str );
	};
});


// Expose Color Module
exports.Color = Color;
