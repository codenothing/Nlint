munit( 'MatchPath', { priority: munit.PRIORITY_HIGHER }, {

	init: function( assert ) {
		var match = new Nlint.MatchPath(),
			normalizeSpy = assert.spy( Nlint, 'normalizePath', { passthru: true } ),
			regexSpy = assert.spy( Nlint, 'regexPath', { passthru: true } );

		// Object info
		assert.isFunction( 'isMatch', match.isMatch )
			.isFalse( 'isDirectory', match.isDirectory )
			.isFalse( 'isString', match.isString )
			.isFalse( 'isRegExp', match.isRegExp )
			.isFalse( 'isFunction', match.isFunction )
			.isUndefined( 'match', match.match );

		// Ensure string spies didn't get triggered on a non string
		assert.equal( 'normalize not called on non string', normalizeSpy.count, 0 );
		assert.equal( 'regexPath not called on non string', regexSpy.count, 0 );

		// String matches should only trigger one normalzie call, and no regex without a *
		match = new Nlint.MatchPath( "/test.js" );
		assert.equal( 'normalize called on string', normalizeSpy.count, 1 );
		assert.equal( 'regexPath not called on non-star string', regexSpy.count, 0 );

		// String matches should only trigger one normalzie call, and no regex without a *
		match = new Nlint.MatchPath( "/z/*" );
		assert.equal( 'normalize called on star string', normalizeSpy.count, 2 );
		assert.equal( 'regexPath called on star string', regexSpy.count, 1 );

		// File matching
		match = new Nlint.MatchPath( "/a/b/c/test.js" );
		assert.isTrue( 'string file', match.isString )
			.isFalse( 'string file not dir', match.isDirectory )
			.equal( 'string file equal', match.match, "/a/b/c/test.js" );

		// Directory matching
		match = new Nlint.MatchPath( "/a/b/c/" );
		assert.isTrue( 'string dir', match.isString )
			.isTrue( 'string dir is a directory', match.isDirectory )
			.equal( 'string dir equal', match.match, "/a/b/c/" );

		// Home path replacement
		match = new Nlint.MatchPath( "~/home/path/" );
		assert.isTrue( 'string home path', match.isString )
			.equal( 'string home path equal', match.match, process.env.HOME + "/home/path/" );

		// Relative path replacement
		match = new Nlint.MatchPath( "relative/path/", "/root/path/" );
		assert.isTrue( 'string relative path', match.isString )
			.equal( 'string relative path equal', match.match, "/root/path/relative/path/" );

		// Star path conversion
		match = new Nlint.MatchPath( "/home/path/star/*" );
		assert.isFalse( 'string star path is regex not string', match.isString )
			.isTrue( 'string star path is regex', match.isRegExp )
			.isRegExp( 'string star path type regex', match.match );

		// Regex Matching
		match = new Nlint.MatchPath( /\a\b.*/ );
		assert.isTrue( 'regex path', match.isRegExp )
			.isRegExp( 'regex path type regex', match.match );

		// Function Matching
		match = new Nlint.MatchPath( munit.noop );
		assert.isTrue( 'function path', match.isFunction )
			.equal( 'function path equal', match.match, munit.noop );
	},

	isMatch: function( assert ) {
		[

			{
				name: 'dir match basic',
				match: '/a/b/c/',
				test: '/a/b/c/',
				result: true
			},

			{
				name: 'dir match prefix fail',
				match: '/a/b/c/',
				test: '/z/a/b/c/',
				result: false
			},

			{
				name: 'file test',
				match: '/a/b/c/test.js',
				test: '/a/b/c/test.js',
				result: true
			},

			{
				name: 'file test prefix fail',
				match: '/a/b/c/test.js',
				test: '/z/a/b/c/test.js',
				result: false
			},

			{
				name: 'regex match',
				match: /^\/a\/b(.*)$/,
				test: '/a/b/c/test.js',
				result: true
			},

			{
				name: 'regex match prefix fail',
				match: /^\/a\/b(.*)$/,
				test: '/z/a/b/c/test.js',
				result: false
			},

			{
				name: 'function match',
				match: assert.spy({ returnValue: true }),
				test: '/z/a/b/c/test.js',
				result: true
			},

			{
				name: 'function match failed',
				match: assert.spy({ returnValue: false }),
				test: '/z/a/b/c/test.js',
				result: false
			},

		].forEach(function( object ) {
			var match = new Nlint.MatchPath( object.match );

			assert.equal( object.name, match.isMatch( object.test ), object.result );
			if ( object.match && object.match.isSpy ) {
				assert.equal( object.name + ' spy called', object.match.count, 1 );
			}
		});
	}

});
