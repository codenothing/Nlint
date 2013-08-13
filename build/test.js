var munit = global.munit = require( 'munit' );

// Extend module timeout grace period to 5 seconds
munit.defaults.settings.timeout = 5000;

// Only stop test suite when running make test
if ( ! process.env.NODE_TEST_NO_SKIP ) {
	munit.defaults.settings.stopOnFail = true;
}

// Render all tests
munit.render( __dirname + '/../test/', {
	junit: __dirname + '/results/',
	junitPrefix: process.version.replace( /\./g, '_' )
});
