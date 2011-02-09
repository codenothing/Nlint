/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	config = {
		// Name of the linter
		name: '_TestAdd',

		// Display Name (optional)
		display: '_TestAdd',

		// Path this linters default module
		path: __dirname + '/linter.js',

		// Files to match for this linter
		match: rjson = /^_______This Should Not Match Anything_______$/i
	};

// Add linter to Nodelint, and attach a handle for output
Nodelint.Linters.add( config, function( Linter, file, content, options ) {
	sys.error( Nodelint.Color.bold.red( "Should not have gotten to test linter" ) );
	process.exit( 1 );
});
