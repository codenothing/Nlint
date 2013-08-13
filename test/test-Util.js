munit( 'Util', {

	typeChecks: function( assert ) {
		assert.isTrue( 'isBoolean - True Boolean', Nlint.isBoolean( true ) )
			.isTrue( 'isBoolean - Flase Boolean', Nlint.isBoolean( false ) )
			.isFalse( 'isBoolean - Int non-Boolean', Nlint.isBoolean( 1 ) )
			.isFalse( 'isBoolean - Int false non-boolean', Nlint.isBoolean( 0 ) )

			.isTrue( 'isNumber - Number', Nlint.isNumber( 10 ) )
			.isTrue( 'isNumber - Float Number', Nlint.isNumber( 10.001 ) )
			.isTrue( 'isNumber - <1 Float Number', Nlint.isNumber( 0.001 ) )
			.isFalse( 'isNumber - Boolean Number', Nlint.isNumber( true ) )

			.isTrue( 'isString - Basic String', Nlint.isString( 'test' ) )
			.isFalse( 'isString - Null String', Nlint.isString( null ) )

			.isTrue( 'isFunction - Function Check', Nlint.isFunction( Nlint.noop ) )
			.isFalse( 'isFunction - Function Instance', Nlint.isFunction( new Nlint.noop() ) )

			.isTrue( 'isArray - Basic Array', Nlint.isArray( [1,2,3] ) )
			.isFalse( 'isArray - Array Like', Nlint.isArray( {0:1,1:2,2:3,length:3} ) )

			.isTrue( 'isDate - Basic Date', Nlint.isDate( new Date() ) )
			.isFalse( 'isDate - Plain Object', Nlint.isDate( {} ) )

			.isTrue( 'isRegExp - Basic RegExp', Nlint.isRegExp( /abc/i ) )
			.isFalse( 'isRegExp - Plain Object', Nlint.isRegExp( {} ) )

			.isTrue( 'isObject - Basic Object', Nlint.isObject( {a:'b',b:true} ) )
			.isFalse( 'isObject - Array Object', Nlint.isObject( [1,2,3] ) )
			.isFalse( 'isObject - Null Object', Nlint.isObject( null ) )
			
			.isTrue( 'isError - Error', Nlint.isError( new Error( 'blah blah blah' ) ) )
			.isFalse( 'isError - Nlint.noop', Nlint.isError( new Nlint.noop() ) );
	},

	Event: function( assert ) {
		var EventEmitter = require( 'events' ).EventEmitter,
			object = {};

		Nlint.Event( object );
		assert.isTrue( 'EventEmitter object', object.__EventEmitter instanceof EventEmitter )
			.isFunction( 'on', object.on )
			.isFunction( 'once', object.on )
			.isFunction( 'emit', object.on )
			.isFunction( 'removeListener', object.on )
			.isFunction( 'removeAllListeners', object.on );
	},

	normalizePath: function( assert ) {
		[

			{
				name: 'Directory',
				path: "/a/b/c/",
				match: "/a/b/c/"
			},

			{
				name: 'File',
				path: "/a/b/c/test.js",
				match: "/a/b/c/test.js"
			},

			{
				name: 'Empty End',
				path: "/a/b/c/test",
				match: "/a/b/c/test"
			},

			{
				name: 'Home Replacement',
				path: "~/home/path",
				match: process.env.HOME + "/home/path"
			},

			{
				name: 'Home Replacement End',
				path: "~/home/path/",
				match: process.env.HOME + "/home/path/"
			},

			{
				name: 'Relative no root',
				path: "relative/noroot",
				match: process.cwd() + "/relative/noroot"
			},

			{
				name: 'Relative root',
				path: "relative/root",
				root: "/root/path/",
				match: "/root/path/relative/root"
			},

		].forEach(function( object ) {
			assert.equal( object.name, Nlint.normalizePath( object.path, object.root ), object.match );
		});
	},

	require: function( assert ) {
		var result = Nlint.require( __dirname + '/util-require.js' );

		// Test success
		assert.equal( 'result.result', result.result.Nlint, Nlint );
		assert.empty( 'result.error', result.error );

		// Test error
		result = Nlint.require( __dirname + '/file-doesnt-exist-foobar.js' );
		assert.empty( 'error result.result', result.result );
		assert.exists( 'error result.error', result.error );
	},

	regexPath: function( assert ) {
		[

			{
				name: 'Basic',
				path: "/a/b.js",
				match: "/^\\/a\\/b\\.js$/"
			},

			{
				name: 'Star and quotes',
				path: "/a\"dd'bb/*",
				match: "/^\\/a\\\"dd\\'bb\\/.*$/"
			},

			{
				name: 'Parens, Braces, Brackets',
				path: "/a[foo]{bar}(file).js",
				match: "/^\\/a\\[foo\\]\\{bar\\}\\(file\\)\\.js$/"
			},

			{
				name: 'Start/Finish',
				path: "/a^b$.js",
				match: "/^\\/a\\^b\\$\\.js$/"
			},

		].forEach(function( object ) {
			assert.equal( object.name, Nlint.regexPath( object.path ).toString(), object.match );
		});
	}

});
