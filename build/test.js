global.munit = require( 'munit' );
global.Nodelint = require( '../' );

// Kill tests on failure
munit.extend( munit.defaults.settings, {
	stopOnFail: true,
	timeout: 5000
});

// Render all tests
munit.render( __dirname + '/../test/', {
	junit: __dirname + '/results/',
	junitPrefix: process.version.replace( /\./g, '_' )
});
