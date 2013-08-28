munit( 'Cli', function( assert ) {
	var argv = require( 'argv' ),
		clearSpy = assert.spy( argv, 'clear', { passthru: true } ),
		optionSpy = assert.spy( argv, 'option', { passthru: true } ),
		runSpy = assert.spy( argv, 'run', { passthru: true } ),
		renderSpy = assert.spy( Nlint, 'render' );
	
	// Test with options and a target
	Nlint.Cli([ '-f', '10', '--ignore=node_modules', 'lib/'  ]);
	assert.equal( 'argv.clear triggered', clearSpy.count, 1 );
	assert.greaterThan( 'argv.option triggered', optionSpy.count, 0 );
	assert.equal( 'argv.option arg defaults', optionSpy.history[ 2 ].args[ 0 ], Nlint.Defaults.argv );
	assert.equal( 'argv.run triggered', runSpy.count, 1 );
	assert.deepEqual( 'argv.run arg args', runSpy.args[ 0 ], [ '-f', '10', '--ignore=node_modules', 'lib/' ] );
	assert.equal( 'render triggered', renderSpy.count, 1 );
	assert.deepEqual( 'render arg targets', renderSpy.args[ 0 ], [ 'lib/' ] );
	assert.deepEqual( 'render arg options', renderSpy.args[ 1 ], {
		fork: 10,
		ignore: [ process.cwd() + '/node_modules' ]
	});

	// Test with no options or targets
	Nlint.Cli([]);
	assert.equal( 'render empty triggered', renderSpy.count, 2 );
	assert.deepEqual( 'render empty arg targets', renderSpy.args[ 0 ], [ process.cwd() ] );
	assert.deepEqual( 'render empty arg options', renderSpy.args[ 1 ], {} );
});
