/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	sys = require('sys');


// Nodelint.Cli
module.exports = function( args ) {
	var argv = Nodelint.ARGV( Nodelint.Options, args );

	// Run based on the command line arguments
	Nodelint( argv.targets, argv.options, function( e, results ) {
		if ( e ) {
			Nodelint.error( e );
		}
		else {
			sys.puts( results.output );
		}
	});
};
