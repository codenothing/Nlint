MUnit( 'CSSLint', 3, function( assert ) {
	var linter = Nodelint( __dirname + '/error.css', function( e, linter ) {
		if ( e ) {
			return assert.fail( 'Fatal Error' );
		}

		// Should only be one error
		var err = linter.errors[ 0 ];
		if ( err ) {
			assert.equal( 'error-line', err.line, 3 );
			assert.equal( 'error-character', err.character, 11 );
		}
		else {
			assert.fail( 'No Error Found' );
		}

		// Confirm there is only one error, otherwise tests need to be updated
		// to support new version of linter
		assert.equal( 'error', linter.errors.length, 1 );
	});
});
