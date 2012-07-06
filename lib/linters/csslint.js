var Nodelint = global.Nodelint,
	CSSLint = Nodelint.Depends.CSSLint.CSSLint,
	settings = {
		name: 'CSSLint',
		match: /\.css$/
	};


Nodelint.Linter( settings, function( path, contents, settings, callback ) {
	var report = CSSLint.verify( contents, settings || {} ), errors = [];

	if ( report.messages ) {
		report.messages.forEach(function( e ) {
			errors.push({
				path: path,
				message: e.message,
				line: e.line,
				character: e.col,
				evidence: e.evidence
			});
		});
	}

	// callback( Actual error, lint errors, lint warnings )
	callback( null, errors, null );
});
