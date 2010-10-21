Nodelint.js
===========

Nodelint.js is the main Nodelint module that calls the renders files/directories and formats the output.


Nodelint.lint
-------------

Nodelint.lint is the function that formats the result from the rendering module. It takes three paramters

- **Files:** A single file path, or array of file paths to be parsed.

- **Options:** (Optional) Object of options in the same format as Options.js

- **Callback:** Function that is called once the rendering and formatting process is complete



The callback gets pass two arguments to it. The first is any error that may bubble up during rendering process, and a results object.

	{
	  passes: Array of files that passes jslint
	  errors: Array of objects containing files taht didn't pass, and the errors found within
	  missing: Files missing that couldn't be found
	  count: Object containing a count on the number of file processed, and the number of errors found
	  output: Formatted output for the terminal
	  logfile: Formatted output for a logfile
	}


Nodelint.info( msg )
--------------------

Informational messages sent from the Rendering module will be passed along to this function


Nodelint.warn( msg )
--------------------

Warning messages sent from the Rendering module will be passed along to this function


Nodelint.error( e )
-------------------

Error messages sent from the Rendering module will be passed along to this function


Usage
=====

	var Nodelint = require('Nodelint/lib/nodelint/Nodelint').Nodelint, sys = require('sys'), fs = require('fs');

	Nodelint.lint( '/path/to/myproject', function( e, results ) {
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
