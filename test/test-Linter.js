var Linter = Nlint.Linter;

munit( 'Linter',

	// Setup
	{
		setup: function( assert, callback ) {
			assert.data.result = {
				name: 'CustomLinter',
				match: 'js',
				render: munit.noop,
				defaults: {
					node: true,
					boss: true,
				}
			};
			assert.data.requireSpy = assert.spy( Nlint, 'require', {
				returnValue: {
					result: assert.data.result
				}
			});
			assert.data.linter = new Linter( "/a/b/c/linter.js" );
			Nlint.Linters.pop();
			callback();
		}
	},

	// Modules
	{

		'static': function( assert ) {
			assert.equal( 'MATCH_TYPE_STRING', Linter.MATCH_TYPE_STRING, 'MATCH_TYPE_STRING' )
				.equal( 'MATCH_TYPE_REGEX', Linter.MATCH_TYPE_REGEX, 'MATCH_TYPE_REGEX' )
				.equal( 'MATCH_TYPE_FUNC', Linter.MATCH_TYPE_FUNC, 'MATCH_TYPE_FUNC' )
				.isString( 'LINTER_DIR', Linter.LINTER_DIR );
		},

		init: function( assert ) {
			var linter = assert.data.linter,
				requireSpy = assert.data.requireSpy;

			// Basic properties
			assert.equal( 'path', linter.path, "/a/b/c/linter.js" )
				.equal( 'name', linter.name, 'CustomLinter' )
				.equal( 'lname', linter.lname, 'customlinter' )
				.deepEqual( 'defaults', linter.defaults, { node: true, boss: true } )
				.equal( 'match', linter.match, 'js' )
				.equal( 'runner', linter.runner, munit.noop )
				.equal( 'matchType', linter.matchType, Linter.MATCH_TYPE_STRING );

			// Match regex
			assert.data.result.match = /\.js$/;
			linter = new Nlint.Linter( "/a/b/c/linter.js" );
			Nlint.Linters.pop();
			assert.equal( 'match regex', linter.matchType, Linter.MATCH_TYPE_REGEX );

			// Match func
			assert.data.result.match = munit.noop;
			linter = new Nlint.Linter( "/a/b/c/linter.js" );
			Nlint.Linters.pop();
			assert.equal( 'match function', linter.matchType, Linter.MATCH_TYPE_FUNC );
			assert.data.result.match = 'js';

			// Linter require throws error
			assert.throws( 'require error', "Require Test Error", function(){
				requireSpy.option( 'returnValue', { error: "Require Test Error" } );
				linter = new Nlint.Linter( "/a/b/c/linter.js" );
			});

			// Linter require no error or result
			assert.throws( 'require no result/error', "No exports found on path [/a/b/c/linter.js]", function(){
				requireSpy.option( 'returnValue', {} );
				linter = new Nlint.Linter( "/a/b/c/linter.js" );
			});

			// No render handle
			assert.throws( 'require no render function', "Render not set on linter [/a/b/c/linter.js]", function(){
				requireSpy.option( 'returnValue', { result: {} } );
				linter = new Nlint.Linter( "/a/b/c/linter.js" );
			});

			// No render handle
			assert.throws( 'settings match type', "Match has to be of type string, regex, or function on linter [/a/b/c/linter.js]", function(){
				requireSpy.option( 'returnValue', { result: { render: munit.noop, match: {} } } );
				linter = new Nlint.Linter( "/a/b/c/linter.js" );
			});
		},

		isMatch: function( assert ) {
			var linter = assert.data.linter,
				matchSpy = assert.spy({ returnValue: true }),
				fakeSettings = {},
				fakeNlint = {};

			linter.match = 'js';
			linter.matchType = Linter.MATCH_TYPE_STRING;
			assert.isTrue( 'string extension match', linter.isMatch( "/a/b/c/test.js" ) );
			assert.isFalse( 'string extension non match', linter.isMatch( "/a/b/c/test.css" ) );

			linter.match = /\.js$/;
			linter.matchType = Linter.MATCH_TYPE_REGEX;
			assert.isTrue( 'regex match', linter.isMatch( "/a/b/c/test.js" ) );
			assert.isFalse( 'regex non match', linter.isMatch( "/a/b/c/test.css" ) );

			linter.match = matchSpy;
			linter.matchType = Linter.MATCH_TYPE_FUNC;
			assert.isTrue( 'func match', linter.isMatch( "/a/b/c/test.js", fakeSettings, fakeNlint ) );
			assert.equal( 'func match triggered', matchSpy.count, 1 );
			assert.equal( 'func match arg path', matchSpy.args[ 0 ], "/a/b/c/test.js" );
			assert.equal( 'func match arg settings', matchSpy.args[ 1 ], fakeSettings );
			assert.equal( 'func match arg nodelint', matchSpy.args[ 2 ], fakeNlint );
		},

		render: function( assert ) {
			var linter = assert.data.linter,
				path = "/a/b/c/test.js",
				settings = {},
				callback = assert.spy(),
				now = Date.now(),
				times,

				fs = require( 'fs' ),
				readSpy = assert.spy( fs, 'readFile', {
					onCall: function( a, b, callback ) {
						callback( null, "TEST CONTENTS" );
					}
				}),

				runnerSpy = assert.spy( linter, 'runner', {
					onCall: function( a, b, c, callback ) {
						callback();
					}
				});

			// Successful run through
			linter.render( path, settings, callback );
			assert.equal( 'fs.read triggered', readSpy.count, 1 );
			assert.equal( 'fs.read args path', readSpy.args[ 0 ], path );
			assert.equal( 'runner triggered', runnerSpy.count, 1 );
			assert.equal( 'runner arg path', runnerSpy.args[ 0 ], path );
			assert.equal( 'runner arg contents', runnerSpy.args[ 1 ], "TEST CONTENTS" );
			assert.equal( 'runner arg settings', runnerSpy.args[ 2 ], settings );
			assert.equal( 'callback triggered', callback.count, 1 );
			assert.isUndefined( 'callback arg error undefined', callback.args[ 0 ] );
			assert.isUndefined( 'callback arg errors undefined', callback.args[ 1 ] );
			assert.isUndefined( 'callback arg warnings undefined', callback.args[ 2 ] );
			assert.isObject( 'callback arg times object', callback.args[ 3 ] );

			// Times object testing
			times = callback.args[ 3 ];
			assert.equal( 'times object name', times.name, linter.name );
			assert.ok( 'times object start', times.start >= now );
			assert.ok( 'times object read', times.read >= times.start );
			assert.ok( 'times object lint', times.lint >= times.read );

			// Shebang removal test
			readSpy.option( 'onCall', function( a, b, callback ) {
				callback( null, "#!/bin/node\n\nTEST CONTENTS" );
			});
			linter.render( path, settings, callback );
			assert.equal( 'shebang fs.read triggered', readSpy.count, 2 );
			assert.equal( 'shebang runner triggered', runnerSpy.count, 2 );
			assert.equal( 'shebang runner arg contents', runnerSpy.args[ 1 ], "\n\nTEST CONTENTS" );

			// Test no content
			readSpy.option( 'onCall', function( a, b, callback ) {
				callback( null, null );
			});
			linter.render( path, settings, callback );
			assert.equal( 'no content fs.read triggered', readSpy.count, 3 );
			assert.equal( 'no content runner not triggered', runnerSpy.count, 2 );
			assert.isNull( 'no content callback arg error null', callback.args[ 0 ] );
			assert.isNull( 'no content callback arg errors null', callback.args[ 1 ] );
			assert.isNull( 'no content callback arg warnings null', callback.args[ 2 ] );
			assert.isObject( 'no content callback arg times object', callback.args[ 3 ] );
			times = callback.args[ 3 ];
			assert.ok( 'no content times object lint', times.lint >= times.read && times.read > 0 );

			// Test fs.read error
			readSpy.option( 'onCall', function( a, b, callback ) {
				callback( "Test Read Error" );
			});
			linter.render( path, settings, callback );
			assert.equal( 'read error fs.read triggered', readSpy.count, 4 );
			assert.equal( 'read error runner not triggered', runnerSpy.count, 2 );
			assert.equal( 'read error callback error string', callback.args[ 0 ], "Test Read Error" );
		},

	}

);
