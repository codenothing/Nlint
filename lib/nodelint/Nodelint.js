/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var _Nodelint = global.Nodelint,
	fs = require('fs'),
	sys = require('sys'),
	Push = Array.prototype.push,
	rerror = /^\s*(\S*(\s+\S+)*)\s*$/,
	Nodelint, Render, Tracking, Color;


global.Nodelint = Nodelint = function( Files, Options, Callback ) {
	// Allow no Options
	if ( Callback === undefined && typeof Options == 'function' ) {
		Callback = Options;
		Options = {};
	}

	// Force array structure for files, since passing
	// in a single file is allowed
	if ( ! Array.isArray( Files ) ) {
		Files = [ Files ];
	}

	// Main Tracker
	var track = new Tracking( 'Nodelint Main Render', function( e, results ) {
		if ( e ) {
			return Callback.call( Nodelint, e );
		}

		// locals
		var passes = [], missing = [], errors = [], output = [], logfile = [], count = { files: 0, errors: 0 }, i;

		// Stack all the results
		for ( i in results ) {
			if ( results.hasOwnProperty( i ) ) {
				Push.apply( passes, results[ i ].passes.slice( 0 ) );
				Push.apply( missing, results[ i ].missing.slice( 0 ) );
				Push.apply( errors, results[ i ].errors.slice( 0 ) );
				count.files += results[ i ].count.files;
				count.errors += results[ i ].count.errors;
			}
		}

		// Files that passed without errors
		passes.forEach(function( file ) {
			output.push( Color.green( file + " passed with 0 errors" ) );
			logfile.unshift( file + " passed with 0 errors");
		});

		// Files not able to find
		missing.forEach(function( file ) {
			output.push( Color.yellow( file ) );
		});

		// Files with errors
		errors.forEach(function( row ) {
			var file = row.file;

			// Separators
			if ( output.length ) {
				output.push("\n=======================================\n");
				logfile.unshift("\n=======================================\n");
			}
			else {
				output.push("\n");
			}

			// Attach each error the logfile and output stacks
			row.errors.forEach(function( e ) {
				if ( ! e ) {
					return;
				}

				output.push(
					Color.red( row.file + ', Line ' + e.line + ', Character ' + e.character ),
					e.reason,
					( e.evidence || '' ).replace( rerror , "$1" ),
					''
				);

				logfile.unshift(
					row.file + ', Line ' + e.line + ', Character ' + e.character,
					e.reason,
					( e.evidence || '' ).replace( rerror , "$1" ),
					''
				);
			});
		});

		// Separater
		output.push("\n=======================================\n");
		logfile.unshift("\n=======================================\n");


		// Tallies
		output.push(
			Color.boldred( 'Total Files: ' + count.files ),
			Color.boldred( 'Total Errors: ' + count.errors )
		);
		logfile.unshift(
			'Total Files:' + count.files,
			'Total Errors: ' + count.errors
		);


		// Finalize the logfile
		logfile = logfile.join("\n");

		// Write to log files for attachment purposes
		if ( Options && Options.nodelint && Options.nodelint.logfile ) {
			fs.writeFile( Options.nodelint.logfile, logfile, 'utf8', function( e ) {
				output.push( e ? 
					"Unable to write to logfile - " + ( e.message || e ) :
					"Logs have been recorded to " + Options.nodelint.logfile
				);

				// Finalize output
				output = output.join("\n") + "\n\n";

				// Send back to caller
				Callback.call( Nodelint, null, {
					logfile: logfile,
					output: output,
					count: count,
					passes: passes,
					errors: errors,
					missing: missing
				});
			});
		}
		else {
			// Finalize the output
			output = output.join("\n") + "\n\n";

			// Send back to caller
			Callback.call( Nodelint, null, {
				logfile: logfile,
				output: output,
				count: count,
				passes: passes,
				errors: errors,
				missing: missing
			});
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

// Messaging Utilities
Nodelint.info = function(){};
Nodelint.warn = function(){};
Nodelint.error = function( msg ) {
	sys.puts( Color.boldred( msg ) );
	process.exit( 1 );
};


// Load all submods
"Util Options ARGV Tracking Color Render Cli".split(' ').forEach(function( file ) {
	require( './' + file );
});


// Assign internal ops
Render = Nodelint.Render;
Tracking = Nodelint.Tracking;
Color = Nodelint.Color;


// Reassign the global Nodelint back to it's original owner
global.Nodelint = _Nodelint;

// Export nodelint
module.exports = Nodelint;
