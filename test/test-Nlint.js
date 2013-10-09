var Slice = Array.prototype.slice,

	// Add setup to create common Nlint test object
	// (remember nlint.run gets triggered in the constructor)
	setupOptions = {
		setup: function( assert, callback ) {
			assert.data.runSpy = assert.spy( Nlint.prototype, 'run' );
			assert.data.nlint = new Nlint( __dirname );
			assert.data.runSpy.restore();
			callback();
		}
	},

	// Shortcut to triggering the last argument of a function call
	// (useful for spies)
	triggerLastArgument = function(){
		var args = Slice.call( arguments );

		return function(){
			Slice.call( arguments ).pop().apply( this, args );
		};
	};


// Core types
munit( 'Nlint', { priority: munit.PRIORITY_HIGHEST }, {

	'static': function( assert ) {
		assert.isFunction( 'Nlint', Nlint )
			.isFunction( 'FileResult', Nlint.FileResult )
			.isFunction( 'MatchPath', Nlint.MatchPath )
			.isFunction( 'Cli', Nlint.Cli )
			.isFunction( 'Linter', Nlint.Linter )
			.isArray( 'Linters', Nlint.Linters )
			.isFunction( 'Settings', Nlint.Settings )
			.isFunction( 'render', Nlint.render );
	},

	init: function( assert ) {
		var spy = assert.spy( Nlint.prototype, 'run' ),
			nlint = new Nlint( __dirname );

		// Init values
		assert.deepEqual( 'files', nlint.files, [ __dirname ] )
			.isObject( 'options', nlint.options )
			.isObject( 'settings', nlint.settings )
			.deepEqual( 'results', nlint.results, [] )
			.deepEqual( 'ignored', nlint.ignored, [] )
			.deepEqual( 'nodelints', nlint.nodelints, [] )
			.deepEqual( '_nodelints', nlint._nodelints, {} )
			.deepEqual( '_forks', nlint._forks, [] )
			.deepEqual( '_queue', nlint._queue, [] )
			.deepEqual( '_jobs', nlint._jobs, {} )
			.equal( 'fileCount', nlint.fileCount, 0 )
			.equal( 'fileComplete', nlint.fileComplete, 0 )
			.equal( 'run triggered', spy.count, 1 );

		// Test for error when no file is passed
		assert.throws( 'No file', /No Files Argument/, function(){
			nlint = new Nlint();
		});

		// Test for error when no array/string passed
		assert.throws( 'Invalid File Type', /No Files Argument/, function(){
			nlint = new Nlint({ test: true });
		});

		// Make sure you can actually pass an array
		assert.doesNotThrow( 'Array Init', function(){
			nlint = new Nlint( [ __dirname ] );
		});
	}

});


// Testing each method on Nlint
munit( 'Nlint', setupOptions, {

	run: function( assert ) {
		var nlint = assert.data.nlint,
			callback = assert.spy(),
			fakeSettings = { fork: 199 },

			// Forks creator
			forkSpy = assert.spy( nlint, 'forks' ),

			// Pass through the close method without doing anything
			closeSpy = assert.spy( nlint, 'close', { onCall: triggerLastArgument() }),

			// nlint callbacks
			updateSpy = assert.spy( nlint.settings, 'update' ),
			nodelintSpy = assert.spy( nlint, 'nodelint', { onCall: triggerLastArgument( null, fakeSettings ) } ),
			dirSpy = assert.spy( nlint, 'dir', { onCall: triggerLastArgument() }),
			singleSpy = assert.spy( nlint, 'single', { onCall: triggerLastArgument() }),

			// Watch for internal fs.stat call
			fs = require( 'fs' ),
			statSpy = assert.spy( fs, 'stat', {
				onCall: triggerLastArgument( null, {
					isDirectory: function(){
						return true;
					}
				})
			});

		// Trigger project run
		nlint.run( callback );

		// Internal calls
		assert.equal( 'run .forks triggered', forkSpy.count, 1 );
		assert.equal( 'run fs.stat trigger', statSpy.count, 1 );
		assert.equal( 'run settings.update trigger', updateSpy.count, 1 );
		assert.equal( 'run settings.update arg path', updateSpy.args[ 0 ], fakeSettings );
		assert.equal( 'run nodelint trigger', nodelintSpy.count, 1 );
		assert.equal( 'run dir trigger', dirSpy.count, 1 );
		assert.equal( 'run single not triggered', singleSpy.count, 0 );

		// Callback stats
		assert.equal( 'run callback', callback.count, 1 );
		assert.equal( 'run callback args', callback.args.length, 2 );
		assert.empty( 'run callback args error', callback.args[ 0 ] );
		assert.equal( 'run callback args nlint', callback.args[ 1 ], nlint );


		// Convert stat spy to trigger a single() call
		// Also create new call spy for counters
		statSpy.option( 'onCall', triggerLastArgument( null, {
			isDirectory: function(){
				return false;
			}
		}));
		nlint.run( callback );
		assert.equal( 'run dir trigger not triggered', dirSpy.count, 1 );
		assert.equal( 'run single triggered', singleSpy.count, 1 );


		// Force an error from single()
		singleSpy.option( 'onCall', triggerLastArgument( "Test Single Error" ) );
		nlint.run( callback );
		assert.equal( 'single error', callback.args[ 0 ], "Test Single Error" );
		assert.equal( 'single error no dir call', dirSpy.count, 1 );
		assert.equal( 'single error called', singleSpy.count, 2 );


		// Force an error from dir()
		statSpy.option( 'onCall', function( path, callback ) {
			callback( null, {
				isDirectory: function(){
					return true;
				}
			});
		});
		dirSpy.option( 'onCall', triggerLastArgument( "Test Dir Error" ) );
		nlint.run( callback );
		assert.equal( 'dir error', callback.args[ 0 ], "Test Dir Error" );
		assert.equal( 'dir error dir call', dirSpy.count, 2 );
		assert.equal( 'dir error no single called', singleSpy.count, 2 );


		// Force an error from fs.stat
		statSpy.option( 'onCall', triggerLastArgument( "Test Error" ) );
		nlint.run( callback );
		assert.equal( 'fs.stat error', callback.args[ 0 ], "Test Error" );
		assert.equal( 'fs.stat error no dir call', dirSpy.count, 2 );
		assert.equal( 'fs.stat error no single call', singleSpy.count, 2 );
	},

	forks: function( assert ) {
		var nlint = assert.data.nlint,
			checkSpy = assert.spy( nlint, '_checkQueue' ),
			callback = assert.spy(),
			event,

			// Fake child object
			EventEmitter = require( 'events' ).EventEmitter,
			emitter = new EventEmitter(),
			onSpy = assert.spy( emitter, 'on' ),

			// Watch forking
			child_process = require( 'child_process' ),
			forkSpy = assert.spy( child_process, 'fork', { returnValue: emitter } );

		// Test fork creation
		nlint.settings.fork = 1;
		nlint._forks = [];
		nlint.forks();
		assert.equal( 'fork triggered', forkSpy.count, 1 );
		assert.equal( 'on called for error, message, exit, and close', onSpy.count, 4 );
		assert.deepEqual( 'child fork objects', nlint._forks, [ emitter ] );

		// Test quick return if forks already exist
		nlint.forks();
		assert.equal( 'fork not triggered when forks exist', forkSpy.count, 1 );

		// Error event
		event = onSpy.history[ 0 ];
		assert.equal( 'error event arg name', event.args[ 0 ], 'error' );
		assert.throws( 'error callback throws', "Test Error Emit", function(){
			event.args[ 1 ]( "Test Error Emit" );
		});

		// Message Event
		nlint._forks = [];
		nlint._jobs = { 123: { id: 123, callback: callback } };
		event = onSpy.history[ 1 ];
		assert.equal( 'message event arg name', event.args[ 0 ], 'message' );
		event.args[ 1 ]({ id: 123, args: [ 1, true, 'a' ] });
		assert.equal( 'job callback triggered', callback.count, 1 );
		assert.deepEqual( 'job callback argurments', callback.args, [ 1, true, 'a' ] );
		assert.equal( 'all jobs removed', Object.keys( nlint._jobs ).length, 0 );
		assert.deepEqual( 'child put back on fork queue', nlint._forks, [ emitter ] );
		assert.equal( 'check queue triggered', checkSpy.count, 1 );

		// Exit event
		nlint._forks = [ emitter, {} ];
		event = onSpy.history[ 2 ];
		assert.equal( 'exit event arg name', event.args[ 0 ], 'exit' );
		assert.doesNotThrow( 'exit event with multiple forks shouldnt throw', function(){
			event.args[ 1 ]();
		});
		assert.deepEqual( 'triggering close should remove child', nlint._forks, [ {} ] );
		nlint._forks = [];
		assert.throws( "exit throws when no forks are left (fatal error)", "All forks have failed", function(){
			event.args[ 1 ]();
		});

		// Close event
		nlint._forks = [];
		event = onSpy.history[ 3 ];
		assert.equal( 'close event arg name', event.args[ 0 ], 'close' );
		assert.throws( "close throws when no forks are left (fatal error)", "All forks have failed", function(){
			event.args[ 1 ]();
		});
	},

	close: function( assert ) {
		var spies = [],
			nlint = assert.data.nlint,
			callback = assert.spy(),
			child = {},
			removeSpy = child.removeAllListeners = assert.spy({ returnValue: child }),
			onSpy = child.on = assert.spy(),
			killSpy = child.kill = assert.spy();


		// Test for event attachments
		nlint._forks = [ child ];
		nlint.close( callback );
		assert.equal( 'close callback not triggered, async', callback.count, 0 );
		assert.equal( 'removeAllListeners triggered only once', removeSpy.count, 1 );
		assert.equal( 'kill triggered only once', killSpy.count, 1 );
		assert.equal( 'on triggered for both exit & close', onSpy.count, 2 );
		assert.equal( 'on exit is first call', onSpy.history[ 0 ].args[ 0 ], 'exit' );
		assert.equal( 'on close is second call', onSpy.history[ 1 ].args[ 0 ], 'close' );

		// Callback trigger
		onSpy.args[ 1 ]();
		assert.equal( 'callback triggered', callback.count, 1 );
		assert.empty( 'callback no error', callback.args[ 0 ] );
	},

	render: function( assert ) {
		var nlint = assert.data.nlint,
			callback = assert.spy(),
			runLint = assert.spy( nlint, '_runLint', { onCall: triggerLastArgument() } ),

			// Settings for path matching
			settings = new Nlint.Settings({ ignore: [ "/a/b/" ] }),
			useSpy = assert.spy( settings, 'use', { returnValue: true } ),

			// Add a spy to watch the path matching calls of each linter
			// (The linter tests will handle argument tests, this just needs to know it was called)
			spies = Nlint.Linters.map(function( linter ) {
				var spy = assert.spy( linter, 'isMatch', { returnValue: true });
				spy._linterName = linter.name;
				return spy;
			});

		// Test ignore path
		nlint.render( "/a/b/c/test.js", settings, callback );
		assert.equal( 'ignore callback triggered', callback.count, 1 );
		assert.equal( 'ignore still no results', nlint.results.length, 0 );
		assert.equal( 'ignore runLint not trigered', runLint.count, 0 );

		// Test going through a successful path, and callback gets triggered with no errors
		nlint.render( "/sub/test.js", settings, callback );
		assert.equal( 'callback triggered', callback.count, 2 );
		assert.equal( 'result count', nlint.results.length, 1 );
		assert.equal( 'first runLint argument should be result argument', nlint.results[ 0 ], runLint.args[ 0 ] );
		assert.equal( 'runLint trigered', runLint.count, Nlint.Linters.length );
		assert.equal( 'settings.use trigered', useSpy.count, Nlint.Linters.length );
		spies.forEach(function( spy ) {
			assert.equal( 'spy ' + spy._linterName + ' called', spy.count, 1 );
		});

		// Test no file match path
		useSpy.option( 'returnValue', false );
		nlint.render( "/sub/test.js", settings, callback );
		assert.equal( 'callback still triggered with no match', callback.count, 3 );
		assert.equal( 'runLint not triggered', runLint.count, Nlint.Linters.length );
	},

	_runLint: function( assert ) {
		var nlint = assert.data.nlint,
			callback = assert.spy(),
			emitSpy = assert.spy( nlint, 'emit' ),
			times = {},
			job = {},

			// Result object
			result = new Nlint.FileResult( "/test.js" ),
			addSpy = assert.spy( result, 'addResults' ),

			// Settings object
			settings = new Nlint.Settings(),
			optionSpy = assert.spy( settings, 'linters', { returnValue: {} } ),

			// Queue check spy
			checkSpy = assert.spy( nlint, '_checkQueue' ),

			// Setup linter and it's spy
			linter = Nlint.Linters[ 0 ],
			renderSpy = assert.spy( linter, 'render' );

		// We override queue object, so make sure it gets restored once complete
		assert.spy( nlint, '_queue' );


		// Testing basic run with queue addition
		nlint._queue = [];
		nlint._runLint( result, settings, linter, callback );
		assert.equal( 'callback not triggered', callback.count, 0 );
		assert.equal( 'settings.linter triggered', optionSpy.count, 1 );
		assert.equal( 'fileCount', nlint.fileCount, 1 );
		assert.equal( 'emit', emitSpy.count, 1 );
		assert.equal( 'emit key', emitSpy.args[ 0 ], 'progress' );
		assert.empty( 'emit path not initially passed', emitSpy.args[ 1 ] );
		assert.equal( '_queue added to', nlint._queue.length, 1 );
		assert.equal( '_checkQueue triggered', checkSpy.count, 1 );

		// Test job added to the queue
		job = nlint._queue[ 0 ];
		assert.equal( 'job id', job.id, nlint.fileCount );
		assert.isFunction( 'job callback', job.callback );
		assert.isObject( 'job send', job.send );
		assert.equal( 'job send.id', job.send.id, nlint.fileCount );
		assert.equal( 'job send.path', job.send.path, result.path );
		assert.equal( 'job send.linter', job.send.linter, linter.path );
		assert.deepEqual( 'job send.settings', job.send.settings, {} );

		// Test basic run with direct linter rendering
		nlint.settings.fork = 0;
		nlint._runLint( result, settings, linter, callback );
		assert.equal( 'linter.render triggered', renderSpy.count, 1 );

		// Testing Success Render
		renderSpy.option( 'onCall', triggerLastArgument( null, null, null, times ) );
		addSpy.option( 'onCall', munit.noop );
		nlint._runLint( result, settings, linter, callback );
		assert.equal( 'success emit path', emitSpy.args[ 1 ], "/test.js" );
		assert.equal( 'success callback triggered', callback.count, 1 );
		assert.empty( 'success callback triggered no error', callback.args[ 0 ] );

		// Testing fatal error from linter rendering
		renderSpy.option( 'onCall', triggerLastArgument( 'Test Error' ) );
		nlint._runLint( result, settings, linter, callback );
		assert.equal( 'error callback triggered', callback.count, 2 );
		assert.equal( 'error callback arg', callback.args[ 0 ], 'Test Error' );

		// Testing format error from rendering results
		renderSpy.option( 'onCall', triggerLastArgument( null, null, null, times ) );
		addSpy.option( 'onCall', function(){
			throw "Format Test Error";
		});
		nlint._runLint( result, settings, linter, callback );
		assert.equal( 'callback triggered with format error', callback.args[ 0 ], "Format Test Error" );
	},

	_checkQueue: function( assert ) {
		var nlint = assert.data.nlint,
			sendSpy = assert.spy(),
			child = { send: sendSpy },
			job = { id: 321, send: { linter: '/a/b/c/test/js' } };

		// Test drainage
		nlint._forks = [ child ];
		nlint._queue = [ job ];
		nlint._checkQueue();
		assert.equal( 'send triggered', sendSpy.count, 1 );
		assert.deepEqual( 'send arguments', sendSpy.args, [ job.send ] );
		assert.equal( 'forks drained', nlint._forks.length, 0 );
		assert.equal( 'queue drained', nlint._queue.length, 0 );

		// Ensure both a job and fork exists for drainage
		nlint._forks = [ child ];
		nlint._queue = [];
		nlint._checkQueue();
		assert.equal( 'send not triggered again', sendSpy.count, 1 );
		assert.deepEqual( 'fork queue not changed', nlint._forks, [ child ] );
	},

	single: function( assert ) {
		var nlint = assert.data.nlint,
			fakeSettings = {},
			callback = assert.spy(),
			renderSpy = assert.spy( nlint, 'render' ),
			nodelintSpy = assert.spy( nlint, 'nodelint', {
				onCall: triggerLastArgument( null, fakeSettings )
			});

		// Testing successful nodelint
		nlint.single( "/a/b/c/test.js", callback );
		assert.equal( 'nodelint called', nodelintSpy.count, 1 );
		assert.equal( 'render triggered', renderSpy.count, 1 );
		assert.equal( 'render arg path', renderSpy.args[ 0 ], "/a/b/c/test.js" );
		assert.equal( 'render arg settings', renderSpy.args[ 1 ], fakeSettings );
		assert.equal( 'render arg callback', renderSpy.args[ 2 ], callback );
		assert.equal( 'callback not triggered due to render spy', callback.count, 0 );

		// Testing nodelint error
		nodelintSpy.option( 'onCall', triggerLastArgument( "Nlint Test Error" ) );
		nlint.single( "/a/b/c/test.js", callback );
		assert.equal( 'nodelint arg path', nodelintSpy.args[ 0 ], "/a/b/c/" );
		assert.isFunction( 'nodelint arg callback', nodelintSpy.args[ 1 ] );
		assert.equal( 'nodelint callback triggered', callback.count, 1 );
		assert.equal( 'nodelint error', callback.args[ 0 ], "Nlint Test Error" );
		assert.equal( 'render not called on error', renderSpy.count, 1 );
	},

	dir: function( assert ) {
		var nlint = assert.data.nlint,
			callback = assert.spy(),
			dirSpy = assert.spy( nlint, '_dir', {
				onCall: triggerLastArgument()
			}),

			// .nodelint spy
			fakeSettings = {},
			nodelintSpy = assert.spy( nlint, 'nodelint', {
				onCall: triggerLastArgument( null, fakeSettings )
			}),

			// fs.readdir spy
			fs = require( 'fs' ),
			readSpy = assert.spy( fs, 'readdir', {
				onCall: triggerLastArgument( null, [ 'test1.js', 'test2.js' ] )
			});

		// Testing successful path
		nlint.dir( '/a/b/c/', callback );
		assert.equal( 'readdir called', readSpy.count, 1 );
		assert.equal( 'readdir arg path', readSpy.args[ 0 ], '/a/b/c/' );
		assert.isFunction( 'readdir arg callback', readSpy.args[ 1 ] );
		assert.equal( 'nodelint called', nodelintSpy.count, 1 );
		assert.equal( 'nodelint arg path', nodelintSpy.args[ 0 ], '/a/b/c/' );
		assert.isFunction( 'nodelint arg callback', nodelintSpy.args[ 1 ] );
		assert.equal( '_dir called', dirSpy.count, 1 );
		assert.equal( '_dir arg path', dirSpy.args[ 0 ], '/a/b/c/' );
		assert.deepEqual( '_dir arg files', dirSpy.args[ 1 ], [ 'test1.js', 'test2.js' ] );
		assert.equal( '_dir arg settings', dirSpy.args[ 2 ], fakeSettings );
		assert.equal( '_dir arg callback', dirSpy.args[ 3 ], callback );
		assert.equal( '_dir callback triggered', callback.count, 1 );

		// Testing readdir error
		readSpy.option( 'onCall', triggerLastArgument( "Readdir Test Error" ) );
		nlint.dir( '/a/b/c/', callback );
		assert.equal( 'readdir error', callback.args[ 0 ], "Readdir Test Error" );
		assert.equal( 'readdir error no _dir trigger', dirSpy.count, 1 );

		// Testing nodelint error
		readSpy.option( 'onCall', triggerLastArgument() );
		nodelintSpy.option( 'onCall', triggerLastArgument( "Nlint Test Error" ) );
		nlint.dir( '/a/b/c/', callback );
		assert.equal( 'nodelint error', callback.args[ 0 ], "Nlint Test Error" );
		assert.equal( 'nodelint error no _dir trigger', dirSpy.count, 1 );
	},

	_dir: function( assert ) {
		var nlint = assert.data.nlint,
			callback = assert.spy(),

			// Mock settings object
			settings = new Nlint.Settings(),
			ignoreSpy = assert.spy( settings, 'ignore', { returnValue: false } ),

			// .dir
			dirSpy = assert.spy( nlint, 'dir', {
				onCall: triggerLastArgument()
			}),

			// .render
			renderSpy = assert.spy( nlint, 'render', {
				onCall: triggerLastArgument()
			}),

			// fs.stat spy
			fs = require( 'fs' ),
			statSpy = assert.spy( fs, 'stat', {
				onCall: triggerLastArgument( null, {
					isDirectory: function(){
						return true;
					}
				})
			});

		// Test Success Path
		nlint._dir( '/a/b/c/', [ 'd' ], settings, callback );
		assert.equal( 'fs.stat triggered', statSpy.count, 1 );
		assert.equal( 'fs.stat arg file path', statSpy.args[ 0 ], '/a/b/c/d' );
		assert.equal( 'settings.ignore triggered', ignoreSpy.count, 1 );
		assert.equal( 'dir triggered', dirSpy.count, 1 );
		assert.equal( 'dir arg path', dirSpy.args[ 0 ], '/a/b/c/d/' );
		assert.equal( 'dir success callback triggered', callback.count, 1 );
		assert.empty( 'dir success callback no error', callback.args[ 0 ] );
		assert.equal( 'dir success render not triggered', renderSpy.count, 0 );

		// Testing ignored directory
		ignoreSpy.option( 'returnValue', true );
		nlint._dir( '/a/b/c/', [ 'd' ], settings, callback );
		assert.equal( 'settings.ignore triggered again', ignoreSpy.count, 2 );
		assert.equal( 'ignore path dir not triggered', dirSpy.count, 1 );
		assert.equal( 'ignore path callback triggered', callback.count, 2 );
		assert.empty( 'ignore path callback no error', callback.args[ 0 ] );
		ignoreSpy.option( 'returnValue', false );

		// Testing single file render
		statSpy.option( 'onCall', triggerLastArgument( null, {
			isDirectory: function(){
				return false;
			}
		}));
		nlint._dir( '/a/b/c/', [ 'd' ], settings, callback );
		assert.equal( 'render path triggered', renderSpy.count, 1 );
		assert.equal( 'render path dir not triggered', dirSpy.count, 1 );
		assert.equal( 'render path callback triggered', callback.count, 3 );
		assert.empty( 'render path callback no error', callback.args[ 0 ] );

		// Testing single file render error
		renderSpy.option( 'onCall', triggerLastArgument( "render error" ) );
		nlint._dir( '/a/b/c/', [ 'd' ], settings, callback );
		assert.equal( 'render error path triggered', renderSpy.count, 2 );
		assert.equal( 'render error path dir not triggered', dirSpy.count, 1 );
		assert.equal( 'render error path callback triggered', callback.count, 4 );
		assert.equal( 'render error path callback error', callback.args[ 0 ], "render error" );

		// Testing dir error
		dirSpy.option( 'onCall', triggerLastArgument( "dir error" ) );
		statSpy.option( 'onCall', triggerLastArgument( null, {
			isDirectory: function(){
				return true;
			}
		}));
		nlint._dir( '/a/b/c/', [ 'd' ], settings, callback );
		assert.equal( 'dir error path triggered', dirSpy.count, 2 );
		assert.equal( 'dir error path render not triggered', renderSpy.count, 2 );
		assert.equal( 'dir error path callback triggered', callback.count, 5 );
		assert.equal( 'dir error path callback error', callback.args[ 0 ], "dir error" );

		// Testing fs.stat error
		statSpy.option( 'onCall', triggerLastArgument( "fs.stat Test Error" ) );
		nlint._dir( '/a/b/c/', [ 'd' ], settings, callback );
		assert.equal( 'fs.stat error callback triggered', callback.count, 6 );
		assert.equal( 'fs.stat error callback error', callback.args[ 0 ], "fs.stat Test Error" );
		assert.equal( 'fs.stat error path dir not triggered', dirSpy.count, 2 );
		assert.equal( 'fs.stat error path render not triggered', renderSpy.count, 2 );
	},

	nodelint: function( assert ) {
		var nlint = assert.data.nlint,
			callback = assert.spy(),

			// _renderSettings handle
			settings = new Nlint.Settings(),
			renderSpy = assert.spy( nlint, '_renderSettings', { returnValue: settings } ),

			// _nodelint handle
			nodelintSpy = assert.spy( nlint, '_nodelint', {
				onCall: triggerLastArgument()
			});

		// Test successful path
		nlint.nodelint( '/a/b/c/', callback );
		assert.equal( '_nodelint triggered for each subpath', nodelintSpy.count, 4 );
		assert.equal( 'callback triggered', callback.count, 1 );
		assert.empty( 'callback arg no error', callback.args[ 0 ] );
		assert.equal( 'callback arg settings', callback.args[ 1 ], settings );

		// Test error in _nodelint
		nodelintSpy.option( 'onCall', triggerLastArgument( "Test _nodelint Error" ) );
		nlint.nodelint( '/a/b/c/', callback );
		assert.equal( '_nodelint fail callback triggered', callback.count, 2 );
		assert.equal( '_nodelint fail callback arg error', callback.args[ 0 ], "Test _nodelint Error" );
	},

	_nodelint: function( assert ) {
		var nlint = assert.data.nlint,
			callback = assert.spy(),

			// Mark nodelint files as read to mimick _renderNodelint
			renderSpy = assert.spy( nlint, '_renderNodelint', {
				onCall: function( path, callback ) {
					nlint._nodelints[ path ] = null;
					callback();
				}
			});

		// Test path that triggers _renderNodelint on every nodelint file
		nlint._nodelint( '/a/b/c/', callback );
		assert.equal( 'render triggered on every file type', renderSpy.count, 4 );
		assert.equal( 'callback triggered through render', callback.count, 1 );

		// Previous test marked all entries as read, test that
		nlint._nodelint( '/a/b/c/', callback );
		assert.equal( '_renderNodelint should not have been called', renderSpy.count, 4 );
		assert.equal( 'callback still triggered', callback.count, 2 );
	},

	_renderNodelint: function( assert ) {
		var nlint = assert.data.nlint,
			callback = assert.spy(),
			fakeOptions = {},

			// Watch for internal fs.stat call
			fs = require( 'fs' ),
			statSpy = assert.spy( fs, 'stat', {
				onCall: triggerLastArgument()
			}),
			readSpy = assert.spy( fs, 'readFile', {
				onCall: triggerLastArgument()
			}),

			// JSON parsing spy
			JSON5 = require( 'json5' ),
			jsonSpy = assert.spy( JSON5, 'parse', { returnValue: fakeOptions } ),

			// Require spy
			requireSpy = assert.spy( Nlint, 'require', { returnValue: { result: fakeOptions } } );

		// Test successful json parse path, along with all triggers inbetween
		nlint._renderNodelint( '/a/b/c/.nlint.json', callback );
		assert.equal( 'json fs.stat triggered', statSpy.count, 1 );
		assert.equal( 'json nodelint path added for logging', nlint.nodelints[ nlint.nodelints.length - 1 ], '/a/b/c/.nlint.json' );
		assert.equal( 'json fs.readFile triggered', readSpy.count, 1 );
		assert.equal( 'json JSON5 called', jsonSpy.count, 1 );
		assert.equal( 'json require not triggered', requireSpy.count, 0 );
		assert.equal( 'json _nodelints path added', nlint._nodelints[ '/a/b/c/.nlint.json' ], fakeOptions );
		assert.equal( 'json callback triggered', callback.count, 1 );
		assert.empty( 'json callback no error', callback.args[ 0 ] );

		// Test successful json5 parse path
		nlint._renderNodelint( '/a/b/c/.nlint.json5', callback );
		assert.equal( 'json5 parser still called', jsonSpy.count, 2 );
		assert.equal( 'json5 require not triggered', requireSpy.count, 0 );
		assert.equal( 'json5 added to _nodelints', nlint._nodelints[ '/a/b/c/.nlint.json5' ], fakeOptions );
		assert.equal( 'json5 callback triggered', callback.count, 2 );
		assert.empty( 'json5 callback no error', callback.args[ 0 ] );

		// Test successful js parse path
		nlint._renderNodelint( '/a/b/c/.nlint.js', callback );
		assert.equal( 'js require triggered', requireSpy.count, 1 );
		assert.equal( 'js JSON5 not called', jsonSpy.count, 2 );
		assert.equal( 'js added to _nodelints', nlint._nodelints[ '/a/b/c/.nlint.js' ], fakeOptions );
		assert.equal( 'js callback triggered', callback.count, 3 );
		assert.empty( 'js callback no error', callback.args[ 0 ] );

		// Test successful root parse path
		nlint._renderNodelint( '/a/b/c/.nlint', callback );
		assert.equal( 'root require triggered', requireSpy.count, 2 );
		assert.equal( 'root JSON5 not called', jsonSpy.count, 2 );
		assert.equal( 'root added to _nodelints', nlint._nodelints[ '/a/b/c/.nlint' ], fakeOptions );
		assert.equal( 'root callback triggered', callback.count, 4 );
		assert.empty( 'root callback no error', callback.args[ 0 ] );

		// Test root parse error path
		requireSpy.option( 'returnValue', { error: "Require Test Error" } );
		nlint._renderNodelint( '/a/b/c/.nlint', callback );
		assert.equal( 'root error callback triggered', callback.count, 5 );
		assert.equal( 'root error callback error string', callback.args[ 0 ], "Require Test Error" );

		// Test json parse error path
		jsonSpy.option( 'onCall', function(){
			throw "JSON Test Error";
		});
		nlint._renderNodelint( '/a/b/c/.nlint.json', callback );
		assert.equal( 'json error callback triggered', callback.count, 6 );
		assert.equal( 'json error callback error string', callback.args[ 0 ], "JSON Test Error" );

		// Test json read error path
		readSpy.option( 'onCall', triggerLastArgument( "JSON Read Test Error" ) );
		nlint._renderNodelint( '/a/b/c/.nlint.json', callback );
		assert.equal( 'json read error callback triggered', callback.count, 7 );
		assert.equal( 'json read error callback error string', callback.args[ 0 ], "JSON Read Test Error" );

		// Test stat error (no error passback)
		statSpy.option( 'onCall', triggerLastArgument( "fs.stat Test Error" ) );
		nlint._renderNodelint( '/a/b/c/.nlint', callback );
		assert.equal( 'fs.stat error callback triggered', callback.count, 8 );
		assert.empty( 'fs.stat error callback no error', callback.args[ 0 ] );
		assert.equal( 'fs.stat error JSON5 not called', jsonSpy.count, 3 );
		assert.equal( 'fs.stat error require not triggered', requireSpy.count, 3 );
	},

	_renderSettings: function( assert ) {
		var nlint = assert.data.nlint,
			settings;

		nlint.options = {};
		nlint._nodelints = {
			"/a/.nlint": { fork: 4 },
			"/a/b/.nlint": { fork: 10 }
		};

		// Check default values hold
		settings = nlint._renderSettings( '/foo/bar' );
		assert.equal( 'Default fork value', settings.fork, Nlint.Defaults.Settings.fork );

		// Test passed in options overriding defaults
		nlint.options = { fork: 0 };
		settings = nlint._renderSettings( '/foo/bar' );
		assert.equal( 'Options Overwrite', settings.fork, nlint.options.fork );
		nlint.options = {};

		// Testing '/a/' path
		settings = nlint._renderSettings( '/a/' );
		assert.equal( '/a/ fork is 4', settings.fork, 4 );

		// Testing '/a/b/' path overriding '/a/' path
		settings = nlint._renderSettings( '/a/b/' );
		assert.equal( '/a/b/ fork is 10', settings.fork, 10 );
	}

});
