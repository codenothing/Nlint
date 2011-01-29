/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = require('../lib/nodelint/Nodelint'),
	sys = require('sys'),
	root = __dirname.replace( /build\/?/, '/' );

// Custom pre-commit hook for Nodelint
Nodelint( root, { encodings: [ 'UTF-8-BOM' ] }, function( e, results ) {
	// Unknown Error
	if ( e ) {
		sys.error( e.message || e );
		process.exit( 1 );
	}
	// There should be two errors from the test dir
	else if ( ! results.errors.length ) {
		sys.error( Nodelint.Color.bold.red( "Did not find test errors in linters" ) );
		process.exit( 1 );
	}
	// Make sure that there are only two errors
	else if ( results.errors.length === 2 ) {
		process.exit( 0 );
	}
	else {
		Nodelint.leave( 1, results.stderr );
	}
});
