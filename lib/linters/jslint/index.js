/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,

	// Reformatters
	rshebang = /^\#\!.*/,
	rerror = /^\s*(\S*(\s+\S+)*)\s*$/,

	// Settings for JSONLint
	config = {
		// Name of the linter
		name: 'jslint',

		// Display Name (optional)
		display: 'JSLint',

		// Path this linters default module
		path: __dirname + '/jslint.js',

		// Files to match for this linter
		match: /\.js$/i
	};

Nodelint.Linters.add( config, function( JSLint, file, content, options ) {
	// Remove possible enviorment decalaration
	content = content.replace( rshebang, '' );

	// Lint the jsfile
	if ( JSLint( content, options ) ) {
		return [];
	}
	else {
		// When jslint is unable to continue, it pushes a null entry
		if ( JSLint.errors[ JSLint.errors.length - 1 ] === null ) {
			JSLint.errors.pop();
		}

		// Format jslint errors to our format
		for ( var i = -1, l = JSLint.errors.length; ++i < l; ) {
			JSLint.errors[ i ].error = JSLint.errors[ i ].reason;
			JSLint.errors[ i ].evidence = ( JSLint.errors[ i ].evidence || '' ).replace( rerror, "$1" );
		}

		return JSLint.errors;
	}
});
