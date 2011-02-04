/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	path = __dirname + '/jslint.js',
	rjs = /\.js$/i,
	rshebang = /^\#\!.*/,
	rerror = /^\s*(\S*(\s+\S+)*)\s*$/;

Nodelint.Linters.add( 'jslint', path, rjs, function( JSLint, file, content, options ) {
	// Remove possible enviorment decalaration
	content = content.replace( rshebang, '' );

	// Inform Dev
	if ( options.verbose ) {
		Nodelint.info( "JSLinting " + file );
	}

	// Lint the jsfile
	if ( JSLint( content, options._jslint ) ) {
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
