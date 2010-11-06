/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var _Nodelint = global.Nodelint,
	fs = require('fs'),
	sys = require('sys'),
	rprecom = /^--Nodelint-pre-commit/,
	rprecomall = /^--Nodelint-pre-commit-all/,
	Nodelint, Render, Tracking, Color;


global.Nodelint = Nodelint = function( Files, Options, Callback ) {
	// Allow no Options
	if ( Callback === undefined && typeof Options == 'function' ) {
		Callback = Options;
		Options = {};
	}

	// Copy over defaults
	Options = Nodelint.extend( true, {}, Nodelint.Options, Options );

	// Force array structure for files, since passing
	// in a single file is allowed
	if ( ! Array.isArray( Files ) ) {
		Files = [ Files ];
	}

	// Render handles array of files, so use it
	Render( Files, Options, function( e, render ) {
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
				format.output += "\n\n" + Color.blue( info ) + "\n\n";

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
"Util Options ARGV Tracking Color Render Cli Precommit Format".split(' ').forEach(function( mod ) {
	Nodelint[ mod ] = require( './' + mod );
});


// Assign internal ops after load
Render = Nodelint.Render;
Tracking = Nodelint.Tracking;
Color = Nodelint.Color;


// Extend predefined options
Nodelint.extend( true, Nodelint.Options, global._NodelintOptions || {} );


// Push messaging utilities onto Nodelint
Nodelint.extend({

	// Processing information
	info: function( msg ) {
		sys.puts( Color.blue( msg ) );
	},

	// Missing files, invalid ignore paths, etc.
	warn: function( msg ) {
		sys.puts( Color.yellow( msg ) );
	},

	// Serious error
	error: function( e ) {
		sys.error( Color.boldred( e.message || e ) );
		process.exit( 1 );
	}
});


// Handle auto running commands
Nodelint.each( process.argv, function( val ) {
	// Running cli module directly instead of through proxy script
	if ( val === '--Nodelint-cli' ) {
		Nodelint.Cli();
		return false;
	}
	// For precommits: jslinting entire project
	else if ( val === '--Nodelint-pre-commit-all' ) {
		Nodelint.Precommit.All();
		return false;
	}
	// For precommits: jslinting only changed files
	else if ( rprecom.exec( val ) ) {
		Nodelint.Precommit( val.split('=').pop() );
		return false;
	}
});


// Reassign the global Nodelint back to it's original owner, and export Nodelint
global.Nodelint = _Nodelint;
module.exports = Nodelint;
