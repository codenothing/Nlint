# Nlint

Nlint does full project syntax linting. It runs your js/json/css files
through linters to find errors that might not reveal themselves in testing.

* Async, multi process for faster reading and linting
* [JSHint](https://github.com/jshint/jshint): JavaScript code quality tool
* [CSSLint](https://github.com/stubbornella/csslint): Automated linting of Cascading Stylesheets
* [JSONLint](https://github.com/codenothing/jsonlint): JSON Linter that allows comments
  
[![Build Status](https://travis-ci.org/codenothing/Nlint.png?branch=master)](https://travis-ci.org/codenothing/Nlint)

### Installation

```bash
$ npm install nlint
```


### Usage

When installed globally `npm install -g nlint`, the nlint command may be used

```bash
$ nlint /path/to/dir/
```

To incorporate nlint into your build process, just trigger the render method

```js
require( 'nlint' ).render( '/path/to/root/' );
```


### Options

* **use**: List of linters to use. Comma separated list, or array of linters. Defaults to all linters.
* **fork**: Number of forked processes for use in linting. Will speed up large projects. Defaults to the number of cpus on the system.
* **ignore**: List of file paths to ignore. Should be an array of string paths.
* **linters**: Object of options that are passed to the linter function
* **reset**: Resets all previous options up to that directory (including global defaults)

Here is a sample nlint file that can be used (commented)

```js
// .nlint.json
{
	// Use all linters
	"use": "*",

	// Use a forked process for each linter
	"fork": true,

	// Ignore the .git generated directory because nothing good can come of it
	// Also ignore node_modules as third-party modules might not pass your standards
	"ignore": [
		".git/",
		"node_modules/"
	],

	// Tell jshint that the JavaScript files are for a nodejs enviornment
	"linters": {
		"jshint": {
			"node": true
		}
	}
}
```


### .nlint

Nlint files define out options for the directory it's in, and each subdirectory
following. Each following nlint file adds/overwrites the previous nlint file in
the parent directories.

* **.nlint, .nlint.json, .nlint.json5**: JSON files mimicking options for that directory
* **.nlint.js**: module.exports is used as the options object for that directory

```sh
# Sample directory setup
/Users/me/my-project/.nlint.json
/Users/me/my-project/test/.nlint.json
```

When nlint is traversing your project, every file and directory that is not the `/test` directory
inherits it's settings from the root `/.nlint.json` file.  
  
When nlint is traversing your test directory, the settings used is the equivalent of the following

```js
settings = extend(
	require( "/Users/me/my-project/.nlint.json" ),
	require( "/Users/me/my-project/test/.nlint.json" )
);
```


----
### License

```
The MIT License

Copyright (c) 2012-2013 Corey Hart

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
