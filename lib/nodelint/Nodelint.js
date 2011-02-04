/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var _Nodelint = global.Nodelint,
	fs = require('fs'),
	sys = require('sys'),
	Nodelint;


// Open Nodelint onto the global space, so all the 
// subclasses can attach to it before removing it.
global.Nodelint = Nodelint = function( Files, Options, Callback ) {
	if ( Callback === undefined ) {
		Callback = Options;
		Options = {};
	}

	// The Render object does the heavy lifting
	Nodelint.Render( Files, Options, function( e, render ) {
		if ( e ) {
			return Callback.call( Nodelint, e || "Expecting a file or directory to lint." );
		}

		// Get formatted result
		var format = Nodelint.Format( render, Options );

		// Write to log files for attachment purposes
		if ( Options.logfile ) {
			fs.writeFile( Options.logfile, format.logfile, 'utf8', function( e ) {
				var info = e ? 
					"Unable to write to logfile - " + ( e.message || e ) :
					"Logs have been recorded to " + Options.logfile;

				// Output logfile storage info
				format.output += "\n\n" + Nodelint.Color.blue( info ) + "\n\n";

				// Send back to caller
				Callback.call( Nodelint, null, format );
			});
		}
		else {
			// Add spacing
			format.output += "\n\n";

			// Send back to caller
			Callback.call( Nodelint, null, format );
		}
	});
};


// Load all submods
"Util Options ARGV Tracking Color Help Encodings Linters Render Precommit Format".split(' ').forEach(function( mod ) {
	require( './' + mod );
});

// Extend predefined options
Nodelint.extend( true, Nodelint.Options, global._NodelintOptions || {} );

// Initial options
var argv = Nodelint.ARGV( Nodelint.Options );

// First check for help command
if ( argv.options.help ) {
	Nodelint.Help( argv.targets[ 0 ] );
}
// Running cli module directly instead of through proxy script
else if ( argv.options[ 'Nodelint-cli' ] || Nodelint.Options[ 'Nodelint-cli' ] ) {
	// Run based on the command line arguments
	Nodelint( argv.targets, Nodelint.extend( true, Nodelint.Options, argv.options ), function( e, results ) {
		if ( e ) {
			Nodelint.error( e );
		}
		else {
			Nodelint.leave( results.errors.length ? 1 : 0, results.output );
		}
	});
}
// For precommits: jslinting entire project
else if ( argv.options[ 'Nodelint-pre-commit' ] || Nodelint.Options[ 'Nodelint-pre-commit' ] ) {
	Nodelint.Precommit( argv.options[ 'Nodelint-pre-commit' ] || Nodelint.Options[ 'Nodelint-pre-commit' ] );
}
// For precommits: jslinting only changed files
else if ( argv.options[ 'Nodelint-pre-commit-all'] || Nodelint.Options[ 'Nodelint-pre-commit-all'] ) {
	Nodelint.Precommit.All();
}


// Reassign the global Nodelint back to it's original owner, and export Nodelint
global.Nodelint = _Nodelint;
module.exports = Nodelint;
