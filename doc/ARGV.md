ARGV.js
=======

ARGV.js parses the command line arguments and merges them into their respective areas. It also creates the array of files that need to be rendered.
ARGV parses the command line arguments and creates the array of files that need to be rendered.


Usage
=====

	// Parse command line arguments
	var argv = require('Nodelint').ARGV();
	argv.files // Files that need to be rendered
	argv.options // Options read from the command line

	// If you need to send a custom list of arguments
	var argv = require('Nodelint').ARGV( myargs );
