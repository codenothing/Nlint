ARGV.js
=======

ARGV.js parses the command line arguments and merges them into their respective areas. It also creates the array of files that need to be rendered.


Usage
=====

	// Returns the array of files to be rendered
	var Files = require('Nodelint').ARGV();

	// If you need to send a custom list of arguments
	var Files = require('Nodelint').ARGV( myargs );
