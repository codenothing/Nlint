munit( 'Fork', { priority: munit.PRIORITY_HIGHER }, function( assert ) {
	var procSpy = assert.spy( process, 'on', { passthru: true } ),
		forkFile = require( Nlint.FORK_FILE ),
		fork = procSpy.args[ 1 ],
		message = {
			id: 345,
			linter: '/a/b/c/linter.js',
			path: '/a/b/c/path.js',
			settings: { boss: true }
		},
		callback,

		// Watcher for console error
		errorSpy = assert.spy( console, 'error' ),

		// Watch process sending
		sendSpy = assert.spy( process, 'send' ),

		// Linter spies
		renderSpy = assert.spy({
			onCall: function( p, s, callback ) {
				callback( 6, 7, 8 );
			}
		}),
		linter = { render: renderSpy },
		linterSpy = assert.spy( Nlint, 'Linter', { returnValue: linter });

	// Test setup
	assert.equal( 'process.on triggered', procSpy.count, 1 );
	assert.equal( 'process.on arg key', procSpy.args[ 0 ], 'message' );
	assert.isFunction( 'process.on arg callback', procSpy.args[ 1 ] );
	callback = procSpy.args[ 1 ];

	// Test successful render
	callback( message );
	assert.equal( 'Nlint.Linter triggered', linterSpy.count, 1 );
	assert.equal( 'Nlint.Linter arg path', linterSpy.args[ 0 ], message.linter );
	assert.equal( 'linter.render triggered', renderSpy.count, 1 );
	assert.equal( 'linter.render arg path', renderSpy.args[ 0 ], message.path );
	assert.equal( 'linter.render arg settings', renderSpy.args[ 1 ], message.settings );
	assert.isFunction( 'linter.render arg callback', renderSpy.args[ 2 ] );
	assert.equal( 'process.send triggered', sendSpy.count, 1 );
	assert.deepEqual( 'process.send args', sendSpy.args, [{ id: message.id, args: [ 6, 7, 8 ] }] );

	// Test throwing an error if linter not defined
	linterSpy.option( 'returnValue', null );
	assert.throws( "throw if linter cannot be found", "No linter loaded at path [" + message.linter + "]", function(){
		callback( message );
	});

	// Test throwing of error when no path is defined
	message.path = null;
	assert.throws( "throw when no path is defined", "Unknown Fork Message", function(){
		callback( message );
	});
	assert.equal( 'console.error triggered when no path defined', errorSpy.count, 1 );
	assert.deepEqual( 'console.error message arg', errorSpy.args, [ message ] );

	// Test throwing of error when no linter path is defined
	message.path = "/a/b/c/path.js";
	message.linter = null;
	assert.throws( "throw when no linter path is defined", "Unknown Fork Message", function(){
		callback( message );
	});
});
