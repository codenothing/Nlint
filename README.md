This implementation is a branch of [tav]'s original [nodelint.js]

Nodelint
========

- [Node] is a [V8] based framework for writing Javascript applications outside the browser.

- [JSLint] is a code quality tool that checks for problems in Javascript programs.

- **Nodelint** Parses through files or projects to find syntax errors in your js files



.lintignore
-----------

.lintgnore are Nodelint specific files that mark which files and/or directories to ignore during rendering. Here's an example

	# Ignore jquery as it doesn't pass my version of JSLINT, but is browser safe
	myproject/jquery/jquery.js

	# Ignore the compressed directory as it definently won't pass jslint
	myproject/compressedjs/

	# Ignore my config file because it has special hacks
	myproject/config.js

**Note:** The renderer reads all .lintignore files up the file tree, so be aware when marking files down the tree.



Autorun Usage
-------------

	$ node autorun.js [options] file.js [file2.js dir dir2]

Nodelint passes all non-nodelint options on as JSLINT options

	$ node autorun.js --adsafe=true file.js

Nodelint also allows you to store the results into a logfile of your choosing

	$ node autorun.js -l logfile.out file.js

Here's a quick screen shot of possible results

![Nodelint Example](http://www.codenothing.com/images/github/Nodelint/example.png "Nodelint Example")


Nodelint Usage
--------------

Nodelint can be included into your project or build process easily. Here's a quick example

	var Nodelint = require('/path/to/Nodelint'), sys = require('sys'), fs = require('fs');

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

You can read more about Nodelint and other modules inside the doc/ directory.



Bash Alias
----------

You can create a bash alias to map your own command to jslint. Just add the following to your bashrc file
	
	jslint() {
		clear
		node path/to/Nodelint/autorun.js "$@"
	}

And then you will be able to call nodelint on multiple files like so:

	$ jslint [options] file.js [file2.js dir dir2]




Custom JSLINT
-------------

The current package comes with the latest version of JSLINT(2010-10-16), to add your own custom version,
or to update to a newer version of JSLINT, simply add the following as the last line of the jslint.js file,
and put it under Nodelint/lib/jslint/

	exports.JSLINT = JSLINT;




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
