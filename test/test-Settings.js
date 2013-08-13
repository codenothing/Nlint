munit( 'Settings', { priority: munit.PRIORITY_HIGHER }, {

	init: function( assert ) {
		var resetSpy = assert.spy( Nlint.Settings.prototype, 'reset', { passthru: true } ),
			updateSpy = assert.spy( Nlint.Settings.prototype, 'update', { passthru: true } ),
			settings = new Nlint.Settings();

		// No Update
		assert.isFunction( 'update', settings.update )
			.isFunction( 'reset', settings.reset )
			.isFunction( 'use', settings.use )
			.isFunction( 'linters', settings.linters )
			.isFunction( 'ignore', settings.ignore )
			.isNumber( 'fork', settings.fork )
			.isNull( '_use', settings._use )
			.deepEqual( '_ignore', settings._ignore, [] )
			.deepEqual( '_linters', settings._linters, {} )
			.equal( 'reset triggered', resetSpy.count, 1 )
			.equal( 'update not called, no object', updateSpy.count, 0 );

		// With Update
		settings = new Nlint.Settings({});
		assert.equal( 'reset triggered again', resetSpy.count, 2 )
			.equal( 'update triggered, object passed', updateSpy.count, 1 );
	},

	update: function( assert ) {
		var settings = new Nlint.Settings(),
			resetSpy = assert.spy( settings, 'reset' ),
			addSpy = assert.spy( settings, '_addLinters' ),
			MatchPath = Nlint.MatchPath,
			matchSpy = assert.spy( Nlint, 'MatchPath', { passthru: true } ),
			object;

		// Reset option
		settings.update({ reset: true });
		assert.equal( 'reset triggered', resetSpy.count, 1 );
		settings.update({ reset: false });
		assert.equal( 'reset not triggered false', resetSpy.count, 1 );
		settings.update({ reset: 1 });
		assert.equal( 'reset not type true', resetSpy.count, 1 );
		settings.update({});
		assert.equal( 'reset not a key', resetSpy.count, 1 );

		// Fork option
		settings.fork = 0;
		settings.update({ fork: 4 });
		assert.equal( 'fork direct number', settings.fork, 4 );
		settings.update({ fork: '6' });
		assert.equal( 'fork string to number', settings.fork, 6 );
		settings.fork = 2;
		settings.update({});
		assert.equal( 'fork not a key, stay the same', settings.fork, 2 );

		// add-linter option
		settings.update({ 'add-linter': "/a/b/c/linter.js" });
		assert.equal( 'add-linter', addSpy.count, 1 );
		settings.update({});
		assert.equal( 'add-linter no key, do not call', addSpy.count, 1 );

		// Use option
		settings.use = undefined;
		settings.update({ use: '*' });
		assert.isNull( 'use all', settings._use );
		settings.update({ use: 'jshint csslint' });
		assert.deepEqual( 'use specific', settings._use, [ 'jshint', 'csslint' ] );
		settings.update({ use: 'JSHint CSSLint' });
		assert.deepEqual( 'use specific lowercase', settings._use, [ 'jshint', 'csslint' ] );
		settings.update({ use: [ 'jshint', 'csslint' ] });
		assert.deepEqual( 'use specific array', settings._use, [ 'jshint', 'csslint' ] );
		settings.update({ use: [ 'JSHint', 'CSSLint' ] });
		assert.deepEqual( 'use specific array lowercase', settings._use, [ 'jshint', 'csslint' ] );
		settings.update({ use: {} });
		assert.deepEqual( 'unknown type do nothing', settings._use, [ 'jshint', 'csslint' ] );

		// linters option
		object = { jshint: { node: true }, csslint: { block: true } };
		settings.linters = {};
		settings.update({ linters: object });
		assert.deepEqual( 'linters', settings._linters, object );
		settings.update({ linters: null });
		assert.deepEqual( 'linters cleared', settings._linters, {} );
		settings.update({ linters: object });
		settings.update({ linters: [] });
		assert.deepEqual( 'linters options wrong type', settings._linters, object );
		settings.update({});
		assert.deepEqual( 'linters options key non existant', settings._linters, object );

		// Ignore option
		settings.update({ ignore: "/a/b/c/test.js" }, "/root/path/");
		assert.equal( 'single ignore added', settings._ignore.length, 1 );
		assert.isTrue( 'single ignore object is MatchPath objrect', settings._ignore[ 0 ] instanceof MatchPath );
		assert.equal( 'single ignore match path called', matchSpy.count, 1 );
		assert.equal( 'single ignore match path arg path', matchSpy.args[ 0 ], "/a/b/c/test.js" );
		assert.equal( 'single ignore match path arg root', matchSpy.args[ 1 ], "/root/path/" );

		// Multi ignore option
		settings._ignore = [];
		settings.update({
			ignore: [
				"/a/b/c/test.js",
				null,
				"/a/b/c/"
			]
		});
		assert.equal( 'multi ignore skips empty values', settings._ignore.length, 2 );
	},

	reset: function( assert ) {
		var settings = new Nlint.Settings({
			fork: 9,
			use: 'jshint csslint',
			ignore: "/a/b/c",
			linters: {
				jshint: {
					node: true
				}
			}
		});

		settings.reset();
		assert.equal( 'fork', settings.fork, 0 );
		assert.isNull( '_use', settings._use );
		assert.deepEqual( '_ignore', settings._ignore, [] );
		assert.deepEqual( '_linters', settings._linters, {} );
	},

	_addLinters: function( assert ) {
		var settings = new Nlint.Settings(),
			normalizeSpy = assert.spy( Nlint, 'normalizePath', { passthru: true } ),
			linterSpy = assert.spy( Nlint, 'Linter' );

		settings._addLinters( "/a/b/c/linter.js", "/root/path" );
		assert.equal( 'normalize triggered once', normalizeSpy.count, 1 );
		assert.equal( 'normalize arg path', normalizeSpy.args[ 0 ], "/a/b/c/linter.js" );
		assert.equal( 'normalize arg root', normalizeSpy.args[ 1 ], "/root/path" );
		assert.equal( 'Linter called once', linterSpy.count, 1 );

		settings._addLinters( [ "/a/b/c", "/e/f/g" ], "/root/path/" );
		assert.equal( 'normalize multi called 2 more times', normalizeSpy.count, 3 );
		assert.equal( 'Linter multi called 2 more times', linterSpy.count, 3 );
	},

	use: function( assert ) {
		var settings = new Nlint.Settings();

		settings._use = [ 'jslint', 'jshint', 'csslint' ];
		assert.isTrue( 'limited jshint', settings.use( 'jshint' ) );
		assert.isTrue( 'limited csslint', settings.use( 'csslint' ) );
		assert.isFalse( 'limited htmllint not found', settings.use( 'htmllint' ) );

		settings._use = null;
		assert.isTrue( 'all jshint', settings.use( 'jshint' ) );
		assert.isTrue( 'all any match', settings.use( 'foobar' ) );
	},

	linters: function( assert ) {
		var settings = new Nlint.Settings({
			linters: {
				jshint: {
					node: true,
					boss: true
				},
				csslint: {
					block: true
				}
			}
		});

		assert.deepEqual( 'jshint', settings.linters( 'jshint' ), { node: true, boss: true } );
		assert.deepEqual( 'csslint', settings.linters( 'csslint' ), { block: true } );
		assert.deepEqual( 'foobar', settings.linters( 'foobar' ), {} );
	},

	ignore: function( assert ) {
		var settings = new Nlint.Settings({ ignore: "/a/b/c/" }, {}),
			ignoreSpy = assert.spy( settings._ignore[ 0 ], 'isMatch', { returnValue: true } );

		assert.isTrue( 'ignore path found', settings.ignore( "/some/path" ) );
		assert.equal( 'ignore spy triggered', ignoreSpy.count, 1 );
		assert.equal( 'ignore spy arg path', ignoreSpy.args[ 0 ], "/some/path" );
		assert.equal( 'ignore spy arg settings', ignoreSpy.args[ 1 ], settings );
		assert.equal( 'ignore spy arg nodelint', ignoreSpy.args[ 2 ], settings.nlint );

		ignoreSpy.option( 'returnValue', false );
		assert.isFalse( 'ignore path not found', settings.ignore( "/some/path" ) );
	}

});
