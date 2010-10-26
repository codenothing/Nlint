/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = require('./Nodelint'), sys = require('sys');

Nodelint( __dirname, function( e, results ) {
	// Unknown Error
	if ( e ) {
		return Nodelint.error( e );
	}
	// There should be one error from the test dir
	else if ( ! results.errors.length ) {
		sys.puts( Nodelint.Color.boldred( "Did not find test error in test/" ) );
	}
	// Make sure that the single error is the pre-determined one
	else if ( results.errors.length === 1 && /\/test\/error.js$/.exec( results.errors[ 0 ].file ) ) {
		process.exit( 0 );
	}
	else {
		sys.puts( results.output );
		// Terrible hack to ensure buffers clear
		setTimeout(function(){
			process.exit( 1 );
		}, 1000);
	}
});
