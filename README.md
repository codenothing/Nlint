This implementation is a branch of [tav]'s original [nodelint.js]

Nodelint
========

- [Node] is a [V8] based framework for writing javascript applications outside the browser.

- [JSLint] is a code quality tool that checks for problems in javascript programs.

- **Nodelint** Parses through files or projects to find syntax errors in your javascript files. Heres a quick example

![Nodelint Cli Example](http://www.cnstatic.com/images/github/Nodelint/example.png "Nodelint Cli Example")



Installation
------------

1. Download and extract Nodelint into a path of your choice

2. Add the alias to your bashrc file: alias jslint='node /path/to/Nodelint/cli.js "$@"'

3. Source your bashrc file, and your good to go.



NPM Installation
----------------------

If you have npm installed, installing Nodelint is a breeze.

	$ npm install Nodelint
	$ echo "require('Nodelint').cli();" > ~/.Nodelint.cli.js
	$ echo "alias jslint='node ~/.Nodelint.cli.js \"\$@\"'" >> ~/.bashrc
	$ source ~/.bashrc

	// Now we can use the jslint alias
	$ jslint file.js



.lintignore
-----------

.lintgnore are Nodelint specific files that mark which files and/or directories to ignore during rendering. Here's an example

	# Ignore jquery as it doesn't pass my version of JSLINT, but is browser safe
	myproject/jquery/jquery.js

	# Ignore the compressed directory as it definitely won't pass jslint
	myproject/compressedjs/*

	# Ignore all my config files because they have special hacks
	myproject/*.config.js

**Note:** The renderer reads all .lintignore files up the file tree, so be aware when marking files down the tree.



Cli Usage
---------

	$ node cli.js [options] file.js [file2.js dir dir2]

Nodelint passes all non-nodelint options on as JSLINT options

	$ node cli.js --adsafe=true file.js

Nodelint also allows you to store the results into a logfile of your choosing

	$ node cli.js -l logfile.out file.js



Bash Alias
----------

You can create a bash alias to map your own command to jslint. Just add the following to your bashrc file
	
	alias jslint='node /path/to/Nodelint/cli.js "$@"'

And then you will be able to call Nodelint with jslint alias

	$ jslint [options] file.js [file2.js dir dir2]




Nodelint Usage
--------------

Nodelint can be included into your project or build process easily. Here's a quick example

	var Nodelint = require('Nodelint'), sys = require('sys'), fs = require('fs');

	Nodelint( '/path/to/myproject', function( e, results ) {
		if ( e ) {
			return Nodelint.error( e );
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

You can read more about Nodelint and other modules inside the doc/ directory.




Custom JSLINT
-------------

The current package comes with the latest version of JSLINT(2010-10-16). To add your own custom version,
or to update to a newer version of JSLINT, add the following as the last line of the jslint.js file.

	exports.JSLINT = JSLINT;

And then put that jslint file in your Nodelint/lib/jslint/ directory, or add it as a cli option

	$ node cli.js --jslint=/path/to/my/jslint.js file.js




Default Options
---------------

The package provides an Options.js file where default options for JSLINT and Nodelint can be set.
Take a look at [JSLINT's Options] to see what to put in there.



Contribute
----------

To contribute any patches, simply fork this repository using GitHub and send a pull request to me <<http://github.com/codenothing>>. Thanks!



Credits
-------

- [tav], wrote original nodelint.js

- [Felix Geisendörfer][felixge], clarified Node.js specific details

- [Douglas Crockford], wrote the original JSLint and rhino.js runner

- [Nathan Landis][my8bird], updated nodelint.js to Node's new API.

- [Corey Hart], Rewrote nodelint.js to current Nodelint implementation



[Node]: http://nodejs.org/
[V8]: http://code.google.com/p/v8/
[JSLint]: http://www.jslint.com/lint.html
[JSLINT's Options]: http://www.jslint.com/lint.html#options
[tav]: http://tav.espians.com
[felixge]: http://debuggable.com
[Douglas Crockford]: http://www.crockford.com
[my8bird]: http://github.com/my8bird
[Corey Hart]: http://www.codenothing.com
[nodelint.js]: http://github.com/tav/nodelint.js
