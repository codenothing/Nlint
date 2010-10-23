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
Nodelint.cli = function(){

	// Overwrite messaging
	Nodelint.extend({

		// Display processing information
		info: function( msg ) {
			sys.puts( Color.blue( msg ) );
		},

		// Display warnings
		warn: function( msg ) {
			sys.puts( Color.yellow( msg ) );
		},

		// Exit on errors
		error: function( e ) {
			sys.puts( "\n\n" + Color.boldred( e.message || e ) + "\n\n" );
			process.exit( 1 );
		}

	});


	// Run based on the command line arguments
	Nodelint( Nodelint.ARGV(), Options, function( e, results ) {
		if ( e ) {
			Nodelint.error( e );
		}
		else {
			sys.puts( results.output );
		}
	});
};
