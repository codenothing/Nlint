# Nodelint

Nodelint does full project syntax linting. It runs your js/json/css files
through linters to find errors that might not reveal themselves in testing.


### Installation

```bash
$ npm install -g nlint
```


### Usage

```bash
$ nlint /path/to/dir/
```

To incorporate nodelint into your build process, just trigger the render method

```js
var Nodelint = require( 'nlint' );

Nodelint.render( '/path/to/root/' );
```


### .nodelint

Nodelint files define out options for the directory it's in, and each subdirectory 
following. Each following nodelint file adds/overwrites the previous nodelint file in
the parent directories.

* **.nodelint, .nodelint.json, .nodelint.json5**: JSON files mimicking options for that directory
* **.nodelint.js**: module.exports is used as the options object for that directory


### Options

* **use**: List of linters to use. Comma separated list, or array of linters.
* **linters**: Object of options that are passed to the linter function
* **ignore**: List of file paths to ignore. Can be an array of either string paths or Match objects.
* **linter**: List of file paths to assign a specific linter to. Can be an array of either string paths or Match objects.
* **special**: List of file paths to assign special options to. Can be an array of either string paths or Match objects.

```js
// Match Object
{
	match: '/path/to/file',
	priority: 0.5 // Range: 0.0-1.0
}
```