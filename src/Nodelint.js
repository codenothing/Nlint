/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var _Nodelint = global.Nodelint,
	fs = require('fs'),
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
			return Callback.call( render, e || "Expecting a file or directory to lint." );
		}

		// Format the result
		render = Nodelint.Format( render );

		// Write to log files for attachment purposes
		if ( render.options.logfile ) {
			fs.writeFile( render.options.logfile, render.logfile, 'utf8', function( e ) {
				var info = e ? 
					"Unable to write to logfile - " + ( e.message || e ) :
					"Logs have been recorded to " + render.options.logfile;

				// Output logfile storage info
				render.output += "\n\n" + Nodelint.Color.blue( info ) + "\n\n";

				// Send back to caller
				Callback.call( render, null, render );
			});
		}
		else {
			// Add spacing
			render.output += "\n\n";

			// Send back to caller
			Callback.call( render, null, render );
		}
	});
};


// Load all submods
"Util Options ARGV Tracking Color Help Encodings Linters Render Precommit Format Cli".split(' ').forEach(function( mod ) {
	require( './' + mod );
});

// Reassign the global Nodelint back to it's original owner, and export Nodelint
global.Nodelint = _Nodelint;
module.exports = Nodelint;
