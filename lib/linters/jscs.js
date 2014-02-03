var JSCS = require( 'jscs/lib/checker.js' ),
	rnewline = /\r\n|\r|\n/;

module.exports = {

	name: 'JSCS',
	match: 'js',

	render: function( path, contents, settings, callback ) {
		var errors = [],
			checker = new JSCS(),
			results = [],
			lines = contents.trim().split( rnewline ),
			lintError;

		try {
			checker.registerDefaultRules();
			checker.configure( settings );
			results = checker.checkString( contents ).getErrorList();
		}
		catch ( e ) {
			if ( typeof e == 'string' ) {
				lintError = new Error( e );
			}
			else if ( ! ( e instanceof Error ) ) {
				lintError = new Error( "Unknown JSCS Error - " + e );
			}
			else {
				lintError = e;
			}

			errors.push({
				path: path,
				message: lintError.stack,
				line: lintError.lineNumber || 0,
				character: 0,
			});

			return callback( null, errors, null );
		}

		if ( results && results.length ) {
			results.forEach(function( e ) {
				var line = e.line - 1;

				if ( line === 0 ) {
					line++;
				}
				else if ( line === lines.length - 1 ) {
					line--;
				}

				errors.push({
					path: path,
					message: e.message,
					line: e.line,
					character: e.column,
					evidence: [
						line + "| " + lines[ line - 1 ],
						( line + 1 ) + "| " + lines[ line ],
						( line + 2 ) + "| " + lines[ line + 1 ],
					].join( "\n" ),
				});
			});
		}

		// callback( Actual error, lint errors, lint warnings )
		callback( null, errors, null );
	}
};
