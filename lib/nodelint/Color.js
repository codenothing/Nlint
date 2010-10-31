/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	Color = Nodelint.Color = function( color, bold, str ) {
		return "\x1B[" + ( bold ? 1 : 0 ) + ";" + Color.colors[ color ] + "m" + str + "\x1B[0m";
	};

// Color references
Nodelint.Color.colors = {
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34
};

// Add the color references
Nodelint.each( Nodelint.Color.colors, function( value, color ) {
	// Normal color
	Nodelint.Color[ color ] = function( msg ) {
		return Color( color, false, msg );
	};

	// Bolded color
	Nodelint.Color[ 'bold' + color ] = function( msg ) {
		return Color( color, true, msg );
	};
});
