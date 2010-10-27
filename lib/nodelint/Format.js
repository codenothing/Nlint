/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	Options = Nodelint.Options.nodelint,
	Color = Nodelint.Color,
	Push = Array.prototype.push,
	rerror = /^\s*(\S*(\s+\S+)*)\s*$/;


Nodelint.Format = function( results ) {
	var passes = [], missing = [], errors = [], output = [], logfile = [], stdout = [], stderr = [], count = { files: 0, errors: 0 }, term, i;

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
			count.files += results[ i ].count.files;
			count.errors += results[ i ].count.errors;
		}
	}

	// Files that passed without errors
	if ( Options[ 'show-passed' ] ) {
		passes.forEach(function( file ) {
			output.push( Color.green( file + " passed with 0 errors" ) );
			stdout.push( Color.green( file + " passed with 0 errors" ) );
			logfile.unshift( file + " passed with 0 errors");
		});
	}

	// Files not able to find
	missing.forEach(function( file ) {
		output.push( Color.yellow( "Missing " + file ) );
		stdout.push( Color.yellow( "Missing " + file ) );
		logfile.unshift( "Missing " + file );
	});

	// Files with errors
	errors.forEach(function( row ) {
		// Separators
		if ( output.length ) {
			output.push("\n=======================================\n");
			logfile.unshift("\n=======================================\n");
		}
		else {
			output.push("\n");
		}

		// stderr is it's own entity
		if ( stderr.length ) {
			stderr.push("\n=======================================\n");
		}

		// Attach each error the logfile and output stacks
		row.errors.forEach(function( e ) {
			if ( ! e ) {
				return;
			}

			term = [
				Color.red( row.file + ', Line ' + e.line + ', Character ' + e.character ),
				e.reason,
				( e.evidence || '' ).replace( rerror , "$1" ),
				''
			];

			// Export error to terminal and logfile strings
			Push.apply( output, term );
			Push.apply( stderr, term );
			logfile.unshift(
				row.file + ', Line ' + e.line + ', Character ' + e.character,
				e.reason,
				( e.evidence || '' ).replace( rerror , "$1" ),
				''
			);
		});
	});

	// Tallies
	term = [
		"\n=======================================\n",
		Color.boldred( 'Total Files: ' + count.files ),
		Color.boldred( 'Total Errors: ' + count.errors )
	];

	// Always push to output, but use stderr if errors were found, otherwise use stdout
	Push.apply( output, term );
	Push.apply( stderr.length ? stderr : stdout, term );

	// Logfile has no encoding
	logfile.unshift(
		"\n=======================================\n",
		'Total Files:' + count.files,
		'Total Errors: ' + count.errors
	);

	// Finalize the outputs and return object of results
	return {
		logfile: logfile.join("\n"),
		output: output.join("\n"),
		stdout: stdout.join("\n"),
		stderr: stderr.join("\n"),
		count: count,
		passes: passes,
		errors: errors,
		missing: missing
	};
};
