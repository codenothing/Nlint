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


Notes
-----

 - Basic installation installs 2 binfiles: Nodelint and jslint, 2 manfiles: Nodelint.1 and jslint.1,
and a libfile in your requires path: Nodelint.js.  
  
 - Nodelint is the main binfile, which can be used in pre-commit hooks, while jslint is a shortcut which auto-enables
a few options to output more information to the terminal.  
  
 - The Nodelint.js libfile is added to either the libpath defined, or the first availiable path found in your require path.


**Note:** npm installation does all of the above, except install the jslint manfile.


Configuration
-------------

There are a few configuration options

 - **jslint**: Path to a custom jslint file

 - **prefix**: Path to installation prefix, defaults to install path of node

 - **libpath**: Path to installation libfile, defaults to first availiable path in the require path

 - **no-Nodelint**: Block installation of Nodelint binfile

 - **no-jslint**: Block installation of jslint binfile

 - **no-libfile**: Block installation of Nodelint.js on the requires path


Here's a sample config

	./configure --jslint=/path/to/custom/jslint.js --prefix=/path/to/my/installationPrefix/ --no-libfile
