munit( 'FileResult', {

	init: function( assert ) {
		var result = new Nlint.FileResult( "/a/b/c/test.js" );

		assert.equal( 'path', result.path, "/a/b/c/test.js" )
			.isFalse( 'passed', result.passed )
			.deepEqual( 'errors', result.errors, [] )
			.deepEqual( 'warnings', result.warnings, [] )
			.deepEqual( 'times', result.times, [] );
	},

	addResults: function( assert ) {
		var result = new Nlint.FileResult( "/a/b/c/test.js" );

		// Test success
		assert.doesNotThrow( 'addResults no errors or warnings', function(){
			result.addResults( null, null, {}, 'JSHint' );
		});
		assert.deepEqual( 'times', result.times, [{}] );
		assert.isTrue( 'no errors/warnings passed', result.passed );

		// Test successful addition of errors/warnings
		assert.doesNotThrow( 'addResults errors and warnings', function(){
			var errors = [{
					line: 10,
					character: 14,
					message: 'error foobar'
				}],
				warnings = [{
					line: 5,
					character: 7,
					message: 'warning foobar'
				}];

			result.addResults( errors, warnings, {}, 'JSHint' );
		});
		assert.deepEqual( 'errors', result.errors, [{
			line: 10,
			character: 14,
			message: 'error foobar'
		}]);
		assert.deepEqual( 'warnings', result.warnings, [{
			line: 5,
			character: 7,
			message: 'warning foobar'
		}]);
		assert.isFalse( 'passed state false now there are errors and warnings', result.passed );

		// Test non-array error/warning throw
		assert.throws( 'No array for errors param', "JSHint didn't return an array for errors [/a/b/c/test.js]", function(){
			result.addResults( { foo: 'bar' }, null, {}, 'JSHint' );
		});
		assert.throws( 'No array for warnings param', "JSHint didn't return an array for warnings [/a/b/c/test.js]", function(){
			result.addResults( null, { foo: 'bar' }, {}, 'JSHint' );
		});

		// Test throw on missing line for errors/warnings
		assert.throws( 'Invalid error object', "JSHint didn't return a line number for errors [/a/b/c/test.js]", function(){
			result.addResults( [{ message: 'foobar' }], null, {}, 'JSHint' );
		});
		assert.throws( 'Invalid warning object', "JSHint didn't return a line number for warnings [/a/b/c/test.js]", function(){
			result.addResults( null, [{ message: 'foobar' }], {}, 'JSHint' );
		});
	},

	validate: function( assert ) {
		var result = new Nlint.FileResult( "/a/b/c/test.js" );

		assert.doesNotThrow( 'Successful validation', function(){
			result.validate( { message: 'foobar', line: 5, character: 8 }, 'JSHint', 'errors' );
		});

		assert.throws( 'no message', "JSHint didn't return a message for errors [/a/b/c/test.js]", function(){
			result.validate( {}, 'JSHint', 'errors' );
		});

		assert.throws( 'no line', "JSHint didn't return a line number for errors [/a/b/c/test.js]", function(){
			result.validate( { message: 'foobar' }, 'JSHint', 'errors' );
		});

		assert.throws( 'no line number type', "JSHint didn't return a line number for errors [/a/b/c/test.js]", function(){
			result.validate( { message: 'foobar', line: '10' }, 'JSHint', 'errors' );
		});

		assert.throws( 'no character', "JSHint didn't return a character number for errors [/a/b/c/test.js]", function(){
			result.validate( { message: 'foobar', line: 10 }, 'JSHint', 'errors' );
		});

		assert.throws( 'no character type', "JSHint didn't return a character number for errors [/a/b/c/test.js]", function(){
			result.validate( { message: 'foobar', line: 10, character: '10' }, 'JSHint', 'errors' );
		});
	}

});
