var Nodelint = global.Nodelint,
	JSHint = Nodelint.Depends.JSHint.JSHINT,
	settings = {
		name: 'JSHint',
		match: /\.js$/
	};


Nodelint.Linter( settings, function( path, contents, settings, callback ) {
	var errors = [];

	if ( ! JSHint( contents, settings || {} ) ) {
		// When jshint is unable to continue, it pushes a null entry
		if ( JSHint.errors[ JSHint.errors.length - 1 ] === null ) {
			JSHint.errors.pop();
		}

		// Transfer errors to nodelint format
		JSHint.errors.forEach(function( e ) {
			errors.push({
				path: path,
				message: e.reason,
				line: e.line,
				character: e.character,
				evidence: e.evidence
			});
		});
	}

	// callback( Actual error, lint errors, lint warnings )
	callback( null, errors, null );
});
