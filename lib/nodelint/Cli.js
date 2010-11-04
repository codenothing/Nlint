/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	sys = require('sys'),
	Options = Nodelint.Options,
	Color = Nodelint.Color;


// Autorun has to be called
Nodelint.cli = function( args ) {
	// Run based on the command line arguments
	Nodelint( Nodelint.ARGV( args ), Options, function( e, results ) {
		if ( e ) {
			Nodelint.error( e );
		}
		else {
			sys.puts( results.output );
		}
	});
};
