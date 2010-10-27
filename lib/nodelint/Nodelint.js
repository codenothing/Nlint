/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var _Nodelint = global.Nodelint,
	fs = require('fs'),
	sys = require('sys'),
	Nodelint, Render, Tracking, Color;


global.Nodelint = Nodelint = function( Files, Options, Callback ) {
	// Allow no Options
	if ( Callback === undefined && typeof Options == 'function' ) {
		Callback = Options;
		Options = {};
	}

	// Handle options meant directly for JSLINT
	if ( ! Options.hasOwnProperty( 'nodelint' ) && ! Options.hasOwnProperty( 'jslint' ) ) {
		Options = { jslint: Options, nodelint: {} };
	}

	// Copy over defaults
	Nodelint.extend( true, Options, Nodelint.Options );

	// Force array structure for files, since passing
	// in a single file is allowed
	if ( ! Array.isArray( Files ) ) {
		Files = [ Files ];
	}

	// Main Tracker
	var track = new Tracking( 'Nodelint Main Render', function( e, results ) {
		if ( e || ! results ) {
			return Callback.call( Nodelint, e || "Expecting a file or directory to lint." );
		}

		// Get formatted result
		var format = Nodelint.Format( results );

		// Write to log files for attachment purposes
		if ( Options.nodelint.logfile ) {
			fs.writeFile( Options.nodelint.logfile, logfile, 'utf8', function( e ) {
				format.output += e ?
					"Unable to write to logfile - " + ( e.message || e ) :
					"Logs have been recorded to " + Options.nodelint.logfile;

				// Add some spacing
				format.output += "\n\n";

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


	// Start the full project rendering process
	Files.forEach(function( file ) {
		var id = track.mark();
		Render( file, function( e, render ) {
			if ( e ) {
				track.error( e );
			}
			else {
				track.mark( id, render );
			}
		});
	});


	// Start tracking
	track.start();
};


// Load all submods
"Util Options ARGV Tracking Color Render Cli Format".split(' ').forEach(function( file ) {
	require( './' + file );
});


// Push messaging utilities onto Nodelint
Nodelint.extend({

	// Processing information
	info: function( msg ) {
		if ( Nodelint.Options.nodelint.verbose ) {
			sys.puts( Color.blue( msg ) );
		}
	},

	// Missing files, invalid ignore paths, etc.
	warn: function( msg ) {
		if ( Nodelint.Options.nodelint[ 'show-warnings' ] ) {
			sys.puts( Color.yellow( msg ) );
		}
	},

	// Serious error
	error: function( e ) {
		sys.puts( Color.boldred( e.message || e ) );
		process.exit( 1 );
	}
});


// Assign internal ops
Render = Nodelint.Render;
Tracking = Nodelint.Tracking;
Color = Nodelint.Color;


// Handle auto running commands
Nodelint.each( process.argv, function( val ) {
	// Running cli module directly instead of through proxy script
	if ( val === '--Nodelint-cli' ) {
		Nodelint.cli();
		return false;
	}
	// For pre commits in version control systems
	else if ( val === '--Nodelint-pre-commit' ) {
		Nodelint( Nodelint.ARGV(), function( e, results ) {
			if ( e ) {
				return Nodelint.error( e );
			}
			else if ( results.errors.length ) {
				// Output as error
				sys.error( results.stderr );

				// Terrible hack to make sure buffers flush 
				setTimeout(function(){
					process.exit( 1 );
				}, Nodelint.Options.nodelint[ 'buffer-wait' ] );
			}
			else {
				process.exit( 0 );
			}
		});
	}
});


// Reassign the global Nodelint back to it's original owner, and export Nodelint
global.Nodelint = _Nodelint;
module.exports = Nodelint;
