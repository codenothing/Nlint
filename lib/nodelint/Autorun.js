/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var sys = require('sys'),
	Nodelint = require('./Nodelint').Nodelint,
	Files = require('./ARGV.js').Files,
	Options = require('../../Options').Options,
	Color = require('./Color').Color;

// Hanlde rendering output
Nodelint.info = function( msg ) {
	sys.puts( Color.blue( msg ) );
};

// Display warnings
Nodelint.warn = function( msg ) {
	sys.puts( Color.yellow( msg ) );
};

// Exit on errors
Nodelint.error = function( e ) {
	sys.puts( "\n\n" + Color.boldred( e.message || e ) + "\n\n" );
	process.exit( 1 );
};


// Run based on the command line arguments
Nodelint.lint( Files, Options, function( e, results ) {
	if ( e ) {
		sys.puts( Color.boldred( "Error: " + ( e.message || e ) ) );
		process.exit( 1 );
	}
	else {
		sys.puts( results.output );
	}
});
