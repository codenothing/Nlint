Format.js
=========

Format takes the result of a Render Object, and formats the outputs.

Usage
=====

	var Nodelint = require('Nodelint'), sys = require('sys'), fs = require('fs');

	Nodelint.Render( '/path/to/myproject', function( e, results ) {
		if ( e || ! results ) {
			return Nodelint.error( e || "Invalid Project Path." );
		}
		else {
			// Get the formatted results
			results = Nodelint.Format( results );
		}

		if ( results.errors.length ) {
			// Do something when there are errors
		}
		else {
			// Do something else when there are no errors
		}

		// Output the results to the terminal
		sys.puts( results.output );

		// Write the results to a logfile
		fs.writeFile( 'logfile.out', results.logfile, 'utf8' );
	});
