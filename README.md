# Nodelint

Nodelint does full project syntax linting. It runs your js/json/css files
through linters to find errors that might not reveal themselves in testing.


# Installation

```bash
$ npm install -g nlint
```


# Including In Your Build Process

Nodelint comes with a render function so that it may be easily added to your build process

```js
var Nodelint = require( 'nlint' );

Nodelint.render( '/path/to/root/project' );
```
