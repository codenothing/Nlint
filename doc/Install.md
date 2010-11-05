Installation
------------

Download and extract the Nodelint zip file. If you want the binfiles, then you will need to build it.

	$ ./configure
	$ make
	$ make install

	// Now we can use the jslint binfile
	$ jslint file.js


NPM Installation
----------------------

Nodelint is stored on the npm registry if needed.

	// Install Nodelint
	$ npm install Nodelint

	// Now we can use the jslint binfile
	$ jslint file.js


Configuration
-------------

There are a few configuration options

 - **jslint**: Path to a custom jslint file

 - **prefix**: Path to installation prefix, defaults to install path of node

 - **blocklibs**: Block installation of Nodelint.js on the requires path


Here's a sample config

	./configure --jslint=/path/to/custom/jslint.js --prefix=/path/to/my/installationPrefix --blocklibs
