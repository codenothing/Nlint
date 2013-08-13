var JSONLint = require( 'json-lint' );

module.exports = {

	name: 'JSONLint',
	match: 'json',

	render: function( path, contents, settings, callback ) {
		var lint = JSONLint( contents, settings || {} ),
			errors = [];

		if ( lint.error ) {
			errors.push({
				path: path,
				message: lint.error,
				line: lint.line,
				character: lint.character,
				evidence: lint.evidence
			});
		}

		// callback( Actual error, lint errors, lint warnings )
		callback( null, errors, null );
	}
};
