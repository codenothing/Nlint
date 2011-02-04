/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,

	// Settings for JSONLint
	config = {
		// Name of the linter
		name: 'jsonlint',

		// Display Name (optional)
		display: 'JSONLint',

		// Path this linters default module
		path: __dirname + '/jsonlint.js',

		// Files to match for this linter
		match: rjson = /\.json$/i
	};


// Add linter to Nodelint, and attach a handle for output
Nodelint.Linters.add( config, function( JSONLint, file, content, options ) {
	// Run JSON file through linter
	result = JSONLint( content, options );

	// JSONLint only stops on every error, so create a single entry array from it
	return result.error ? [ result ] : [];
});
