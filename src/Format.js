/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	Color = Nodelint.Color,
	bold = Color.bold,
	Push = Array.prototype.push,
	rerror = /^\s*(\S*(\s+\S+)*)\s*$/;


// Expose on the Nodelint namespace
Nodelint.Format = function( results, options ) {
	var Options = Nodelint.extend( true, {}, Nodelint.Options, options ),
		passes = [], missing = [], errors = [], logfile = [], stdout = [], stderr = [], ignore = [],
		count = { files: 0, errors: 0 }, term, i;

	// Sanity check
	if ( ! results ) {
		return undefined;
	}
	// Expect object of results from tracking module, just add parent level if not
	else if ( results.hasOwnProperty( '_lintignore' ) ) {
		results = { Nodelint: results };
	}

	// Stack all the results, make sure we are using Render objects
	for ( i in results ) {
		if ( results.hasOwnProperty( i ) && results[ i ].hasOwnProperty( '_lintignore' ) ) {
			Push.apply( passes, results[ i ].passes.slice( 0 ) );
			Push.apply( missing, results[ i ].missing.slice( 0 ) );
			Push.apply( errors, results[ i ].errors.slice( 0 ) );
			Push.apply( ignore, results[ i ].ignore.slice( 0 ) );
			count.files += results[ i ].count.files;
			count.errors += results[ i ].count.errors;
		}
	}

	// Files that were ignored
	if ( ignore.length && Options[ 'show-ignored' ] ) {
		ignore.forEach(function( file ) {
			stdout.push( Color.yellow( "Ignored " + file ) );
			logfile.unshift( file );
		});
		logfile.unshift( "\n=======================================\n\nIgnored Files\n" );
	}

	// Files not able to find
	if ( missing.length && Options[ 'show-missing' ] ) {
		missing.forEach(function( file ) {
			stdout.push( Color.yellow( "Missing " + file ) );
			logfile.unshift( file );
		});
		logfile.unshift( "\n=======================================\n\nMissing Files\n" );
	}

	// Files that passed without errors
	if ( passes.length && Options[ 'show-passed' ] ) {
		passes.forEach(function( file ) {
			stdout.push( Color.green( file + " passed with 0 errors" ) );
			logfile.unshift( file );
		});
		logfile.unshift( "\n=======================================\n\nFiles passed with 0 errors.\n" );
	}

	// Get some separation for stdout
	if ( stdout.length ) {
		stdout.push("\n=======================================\n\n");
	}

	// Files with errors
	errors.forEach(function( row ) {
		// stderr is it's own entity
		if ( stderr.length ) {
			stderr.push("\n=======================================\n");
		}

		// Attach each error to the logfile and output stacks
		row.errors.forEach(function( e ) {
			if ( ! e ) {
				return;
			}

			// Export error to terminal and logfile strings
			stderr.push(
				Color.red( row.file + ', Line ' + e.line + ', Character ' + e.character ),
				e.error,
				( e.evidence ? e.evidence + "\n" : '' )
			);
			logfile.unshift(
				row.file + ', Line ' + e.line + ', Character ' + e.character,
				e.error,
				( e.evidence ? e.evidence + "\n" : '' )
			);
		});

		// Get processing separation for logfile
		logfile.unshift("\n=======================================\n");
	});

	// Use stderr if errors were found, otherwise use stdout
	( stderr.length ? stderr : stdout ).push(
		count.errors ? "\n=======================================\n" : '',
		bold.red( 'Total Files: ' + count.files ),
		bold.red( 'Total Errors: ' + count.errors )
	);

	// Logfile has no encoding
	logfile.unshift(
		'Total Files: ' + count.files,
		'Total Errors: ' + count.errors
	);

	// Finalize the outputs and return object of results
	return {
		logfile: logfile.join("\n"),
		output: stdout.join("\n") + stderr.join("\n"),
		stdout: stdout.join("\n"),
		stderr: stderr.join("\n"),
		count: count,
		passes: passes,
		errors: errors,
		ignore: ignore,
		missing: missing
	};
};
