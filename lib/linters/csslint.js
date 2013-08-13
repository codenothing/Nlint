var CSSLint = require( 'csslint' ).CSSLint;

module.exports = {

	name: 'CSSLint',
	match: 'css',

	render: function( path, contents, settings, callback ) {
		var report = CSSLint.verify( contents, settings || {} ),
			errors = [];

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
	}
};
