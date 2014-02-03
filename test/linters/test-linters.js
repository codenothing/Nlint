munit( 'Integration', { queue: 'nlint-full', expect: 4, timeout: 3000 }, {

	CSSLint: function( assert ) {
		Nlint( __dirname + '/csslint/error.css', { user: 'csslint', fork: 0 }, function( e, linter ) {
			if ( e ) {
				return assert.fail( 'Fatal Error' );
			}

			// Should only be one error
			var err = linter.results[ 0 ].errors[ 0 ];
			if ( err ) {
				assert.equal( 'error-line', err.line, 3 );
				assert.equal( 'error-character', err.character, 11 );
			}
			else {
				assert.fail( 'No Error Found' );
			}

			// Confirm there is only one file and one error, otherwise tests need to be updated
			// to support new version of linter
			assert.equal( 'file', linter.results.length, 1 );
			assert.equal( 'error', linter.results[ 0 ].errors.length, 1 );
		});
	},

	'CSSLint-Fork': function( assert ) {
		Nlint( __dirname + '/csslint/error.css', { user: 'csslint', fork: 1 }, function( e, linter ) {
			if ( e ) {
				return assert.fail( 'Fatal Error' );
			}

			// Should only be one error
			var err = linter.results[ 0 ].errors[ 0 ];
			if ( err ) {
				assert.equal( 'error-line', err.line, 3 );
				assert.equal( 'error-character', err.character, 11 );
			}
			else {
				assert.fail( 'No Error Found' );
			}

			// Confirm there is only one file and one error, otherwise tests need to be updated
			// to support new version of linter
			assert.equal( 'file', linter.results.length, 1 );
			assert.equal( 'error', linter.results[ 0 ].errors.length, 1 );
		});
	},

	JSHint: function( assert ) {
		Nlint( __dirname + '/jshint/error.js', { use: 'jshint', fork: 0, linters: { jshint: { indent: 1 } } }, function( e, linter ) {
			if ( e ) {
				return assert.fail( 'Fatal Error' );
			}

			// Should only be one error
			var err = linter.results[ 0 ].errors[ 0 ];
			if ( err ) {
				assert.equal( 'error-line', err.line, 4 );
				assert.equal( 'error-character', err.character, 15 );
			}
			else {
				assert.fail( 'No Error Found' );
			}

			// Confirm there is only one file and one error, otherwise tests need to be updated
			// to support new version of linter
			assert.equal( 'file', linter.results.length, 1 );
			assert.equal( 'error', linter.results[ 0 ].errors.length, 1 );
		});
	},

	'JSHint-Fork': function( assert ) {
		Nlint( __dirname + '/jshint/error.js', { use: 'jshint', fork: 1, linters: { jshint: { indent: 1 } } }, function( e, linter ) {
			if ( e ) {
				return assert.fail( 'Fatal Error' );
			}

			// Should only be one error
			var err = linter.results[ 0 ].errors[ 0 ];
			if ( err ) {
				assert.equal( 'error-line', err.line, 4 );
				assert.equal( 'error-character', err.character, 15 );
			}
			else {
				assert.fail( 'No Error Found' );
			}

			// Confirm there is only one file and one error, otherwise tests need to be updated
			// to support new version of linter
			assert.equal( 'file', linter.results.length, 1 );
			assert.equal( 'error', linter.results[ 0 ].errors.length, 1 );
		});
	},

	JSONLint: function( assert ) {
		Nlint( __dirname + '/jsonlint/error.json', { use: 'jsonlint', fork: 0 }, function( e, linter ) {
			if ( e ) {
				return assert.fail( 'Fatal Error' );
			}

			// Should only be one error
			var err = linter.results[ 0 ].errors[ 0 ];
			if ( err ) {
				assert.equal( 'error-line', err.line, 4 );
				assert.equal( 'error-character', err.character, 2 );
			}
			else {
				assert.fail( 'No Error Found' );
			}

			// Confirm there is only one file and one error, otherwise tests need to be updated
			// to support new version of linter
			assert.equal( 'file', linter.results.length, 1 );
			assert.equal( 'error', linter.results[ 0 ].errors.length, 1 );
		});
	},

	'JSONLint-Fork': function( assert ) {
		Nlint( __dirname + '/jsonlint/error.json', { use: 'jsonlint', fork: 1 }, function( e, linter ) {
			if ( e ) {
				return assert.fail( 'Fatal Error' );
			}

			// Should only be one error
			var err = linter.results[ 0 ].errors[ 0 ];
			if ( err ) {
				assert.equal( 'error-line', err.line, 4 );
				assert.equal( 'error-character', err.character, 2 );
			}
			else {
				assert.fail( 'No Error Found' );
			}

			// Confirm there is only one file and one error, otherwise tests need to be updated
			// to support new version of linter
			assert.equal( 'file', linter.results.length, 1 );
			assert.equal( 'error', linter.results[ 0 ].errors.length, 1 );
		});
	},

	JSCS: function( assert ) {
		Nlint( __dirname + '/jscs/error.js', { use: 'jscs', fork: 0, linters: { jscs: { requireCurlyBraces: [ 'for' ] } } }, function( e, linter ) {
			if ( e ) {
				return assert.fail( 'Fatal Error' );
			}

			// Should only be one error
			var err = linter.results[ 0 ].errors[ 0 ];
			if ( err ) {
				assert.equal( 'error-line', err.line, 3 );
				assert.equal( 'error-character', err.character, 0 );
			}
			else {
				assert.fail( 'No Error Found' );
			}

			// Confirm there is only one file and one error, otherwise tests need to be updated
			// to support new version of linter
			assert.equal( 'file', linter.results.length, 1 );
			assert.equal( 'error', linter.results[ 0 ].errors.length, 1 );
		});
	},

	'JSCS-Fork': function( assert ) {
		Nlint( __dirname + '/jscs/error.js', { use: 'jscs', fork: 1, linters: { jscs: { requireCurlyBraces: [ 'for' ] } } }, function( e, linter ) {
			if ( e ) {
				return assert.fail( 'Fatal Error' );
			}

			// Should only be one error
			var err = linter.results[ 0 ].errors[ 0 ];
			if ( err ) {
				assert.equal( 'error-line', err.line, 3 );
				assert.equal( 'error-character', err.character, 0 );
			}
			else {
				assert.fail( 'No Error Found' );
			}

			// Confirm there is only one file and one error, otherwise tests need to be updated
			// to support new version of linter
			assert.equal( 'file', linter.results.length, 1 );
			assert.equal( 'error', linter.results[ 0 ].errors.length, 1 );
		});
	},

});
