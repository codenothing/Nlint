Installation
------------

1. Download and extract Nodelint into a path of your choice

2. Add the alias to your bashrc file: alias jslint='node /path/to/Nodelint/index.js --Nodelint-cli -vp "$@"'

3. Source your bashrc file, and your good to go.



NPM Installation
----------------

You can also install Nodelint through npm if you like.

	$ npm install Nodelint
	$ echo "module.exports = require('Nodelint');" > ~/.Nodelint.js
	$ echo "alias jslint='node ~/.Nodelint.js --Nodelint-cli -vp \"\$@\"'" >> ~/.bashrc
	$ source ~/.bashrc

	// Now we can use the jslint alias
	$ jslint file.js
