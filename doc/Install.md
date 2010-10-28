Installation
------------

1. Download and extract Nodelint into a path of your choice

2. Add the alias to your bashrc file: alias jslint='node /path/to/Nodelint/cli.js -vp "$@"'

3. Source your bashrc file, and your good to go.



NPM Installation
----------------

You can also install Nodelint through npm if you like.

	$ npm install Nodelint
	$ echo "require('Nodelint').cli();" > ~/.Nodelint.js
	$ echo "alias jslint='node ~/.Nodelint.js -vp \"\$@\"'" >> ~/.bashrc
	$ source ~/.bashrc

	// Now we can use the jslint alias
	$ jslint file.js



Recommendation
--------------

To get the most use out of Nodelint, I suggest you add a ".Nodelint.js" to your home directory. If you
downloaded the src package, then add the following to .Nodelint.js:

	module.exports = require('/path/to/Nodelint');

If you installed Nodelint via NPM, then add the following to .Nodelint.js instead:

	module.exports = require('Nodelint');

This will give you quick access to the full Nodelint api. That way, if you want to bring Nodelint into your
project for testing, you can just add it to your require declaration:

	// Get Nodelint
	var Nodelint = require('~/.Nodelint');

And you can easily add it to your pre-commit bash scripts with:

	node ~/.Nodelint.js --Nodelint-pre-commit .

Of course, you will have to modify your jslint alias with the following to force autorun:

	alias jslint='node ~/.Nodelint.js --Nodelint-cli -vp "$@"'
