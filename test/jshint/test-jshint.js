munit( 'JSHint', 3, function( assert ) {
	var linter = Nodelint( __dirname + '/error.js', { use: 'jshint', linters: { jshint: { indent: 1 } } }, function( e, linter ) {
		if ( e ) {
			return assert.fail( 'Fatal Error' );
		}

		// Should only be one error
		var err = linter.errors[ 0 ];
		if ( err ) {
			assert.equal( 'error-line', err.line, 4 );
			assert.equal( 'error-character', err.character, 15 );
		}
		else {
			assert.fail( 'No Error Found' );
		}

		// Confirm there is only one error, otherwise tests need to be updated
		// to support new version of linter
		assert.equal( 'error', linter.errors.length, 1 );
	});
});
