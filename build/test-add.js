/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = require('../src/Nodelint'),
	Color = Nodelint.Color,
	sys = require('sys'),
	root = __dirname.replace( /build\/?/, '' );

// We are only looking to see that the linter was loaded
Nodelint.Render( root, { add: [ root + 'test/TestAdd' ] }, function( e, render ) {
	// Unknown Error
	if ( e ) {
		sys.error( Color.bold.red( e.message || e ) );
		process.exit( 1 );
	}
	else if ( ! Nodelint.Linters.linters.hasOwnProperty('_TestAdd') ) {
		sys.error( Color.bold.red( "Did not find test linter addition" ) );
	}
	else {
		Nodelint.leave( 0, Color.green( "_TestAdd found" ) );
	}
});
