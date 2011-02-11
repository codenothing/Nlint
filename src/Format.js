/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	Color = Nodelint.Color,
	bold = Color.bold;


// Expose on the Nodelint namespace
Nodelint.Format = function( results ) {
	var logfile = [], stdout = [], stderr = [];

	// Sanity check
	if ( ! results ) {
		return undefined;
	}

	// Files that were ignored
	if ( results.ignore.length && results.options[ 'show-ignored' ] ) {
		results.ignore.forEach(function( file ) {
			stdout.push( Color.yellow( "Ignored " + file ) );
			logfile.unshift( file );
		});
		logfile.unshift( "\n=======================================\n\nIgnored Files\n" );
	}

	// Files not able to find
	if ( results.missing.length && results.options[ 'show-missing' ] ) {
		results.missing.forEach(function( file ) {
			stdout.push( Color.yellow( "Missing " + file ) );
			logfile.unshift( file );
		});
		logfile.unshift( "\n=======================================\n\nMissing Files\n" );
	}

	// Files that passed without errors
	if ( results.passes.length && results.options[ 'show-passed' ] ) {
		results.passes.forEach(function( file ) {
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
	results.errors.forEach(function( row ) {
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
		results.count.errors ? "\n=======================================\n" : '',
		bold.red( 'Total Files: ' + results.count.files ),
		bold.red( 'Total Errors: ' + results.count.errors )
	);

	// Logfile has no encoding
	logfile.unshift(
		'Total Files: ' + results.count.files,
		'Total Errors: ' + results.count.errors
	);

	// Finalize the outputs and append to results object
	results.logfile = logfile.join("\n");
	results.output = stdout.join("\n") + stderr.join("\n");
	results.stdout = stdout.join("\n");
	results.stderr = stderr.join("\n");

	return results;
};
