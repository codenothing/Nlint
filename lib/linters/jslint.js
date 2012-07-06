var Nodelint = global.Nodelint,
	JSLint = Nodelint.Depends.JSLint,
	rerror = /^\s*(\S*(\s+\S+)*)\s*$/,
	settings = {
		name: 'JSLint',
		priority: 0.4,
		match: /\.js$/
	};


Nodelint.Linter( settings, function( path, contents, settings, callback ) {
	var errors = [];

	if ( ! JSLint( contents, settings || {} ) ) {
		// When jshint is unable to continue, it pushes a null entry
		if ( JSLint.errors[ JSLint.errors.length - 1 ] === null ) {
			JSLint.errors.pop();
		}

		// Transfer errors to nodelint format
		JSLint.errors.forEach(function( e ) {
			errors.push({
				path: path,
				message: e.error,
				line: e.line,
				character: e.character,
				evidence: ( e.evidence || '' ).replace( rerror, "$1" )
			});
		});
	}

	// callback( Actual error, lint errors, lint warnings )
	callback( null, errors, null );
});
