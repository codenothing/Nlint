This implementation is a fork of [tav]'s original [nodelint.js]

Nodelint
========

Nodelint combines the power of [Node] and [JSLint] to parse through files or projects and find syntax errors. It can be
used within your pre-commit hooks to force scripts into complying with standards set, and is just a general helper to clean out
javascript bugs. Here's a quick example:

![Nodelint Cli Example](http://www.cnstatic.com/images/github/Nodelint/example.png "Nodelint Cli Example")



Installation
------------

1. Download and extract Nodelint into a path of your choice

2. Add the alias to your bashrc file: alias jslint='node /path/to/Nodelint/cli.js -vp "$@"'

3. Source your bashrc file, and your good to go.



NPM Installation
----------------------

You can also install Nodelint through npm if you like.

	$ npm install Nodelint
	$ echo "require('Nodelint').cli();" > ~/.Nodelint.js
	$ echo "alias jslint='node ~/.Nodelint.js -vp \"\$@\"'" >> ~/.bashrc
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

You can autorun Nodelint based on command line arguments by passing the cli flag
	
	$ node Nodelint.js --Nodelint-cli [options] file.js

Nodelint comes with a cli script that will also force autorun without having to pass the cli flag.

	$ node cli.js [options] file.js

Nodelint passes all non-nodelint options on as JSLINT options

	$ node cli.js --adsafe=true file.js

Nodelint also allows you to store the results into a logfile of your choosing

	$ node cli.js -l logfile.out file.js



Bash Alias
----------

You can create a bash alias to map your own command to jslint. Just add the following to your bashrc file
	
	alias jslint='node /path/to/Nodelint/cli.js "$@"'

And then you will be able to call Nodelint with jslint alias

	$ jslint [options] file.js



Pre-commit Hook
---------------

Nodelint has a special operation for projects that want to use their version control pre-commit hooks.
Just add the following line to your pre-commit bash script

	node /path/to/Nodelint/index.js --Nodelint-pre-commit=git

On large projects, if there are many errors, node might not have enough time to flush it's buffers which
will result in partial output. To fix this, you will need to increase the buffer wait time(in millisecongs)
before Nodelint exits

	node /path/to/Nodelint/index.js --Nodelint-pre-commit=git --buffer-wait=1500 .



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




Options
-------

The package provides an Options.js file where default options for JSLINT and Nodelint can be set.
Take a look at docs/Options.md or [JSLINT's Options] to see what to put in there.



Credits
-------

- [tav], wrote original nodelint.js

- [Felix Geisendörfer][felixge], clarified Node.js specific details

- [Douglas Crockford], wrote the original JSLint and rhino.js runner

- [Nathan Landis][my8bird], updated nodelint.js to Node's new API.

- [Corey Hart], Rewrote nodelint.js to current Nodelint implementation



[Node]: http://nodejs.org/
[JSLint]: http://www.jslint.com/lint.html
[JSLINT's Options]: http://www.jslint.com/lint.html#options
[tav]: http://tav.espians.com
[felixge]: http://debuggable.com
[Douglas Crockford]: http://www.crockford.com
[my8bird]: http://github.com/my8bird
[Corey Hart]: http://www.codenothing.com
[nodelint.js]: http://github.com/tav/nodelint.js
