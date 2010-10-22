.lintignore
===========

.lintignore is a configuration file that lists file paths to ignore.
The file can be placed anywhere along the file tree, as the rendering module
works backwards to pick it up.

	var Nodelint = require('Nodelint'), sys = require('sys');

	Nodelint( '/Users/myname/some/path/myproject/', function( e, results ) {
		sys.puts( results.output );
	});

	// The rendering module will read the following ignore files first
	/.lintignore
	/Users/.lintignore
	/Users/myname/.lintignore
	/Users/myname/some/.lintignore
	/Users/myname/some/path/.lintignore
	/Users/myname/some/path/myproject/.lintignore

	// And then it will continue looking for .lintignore files in every sub directory of your project


Usage
=====
	# Ignore jquery as it doesn't pass my version of JSLINT, but is browser safe
	myproject/jquery/jquery.js

	# Ignore the compressed directory as it definitely won't pass jslint
	myproject/compressedjs/*

	# Ignore all my config files because they have special hacks
	myproject/*.config.js
