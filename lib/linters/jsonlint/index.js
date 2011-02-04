/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	path = __dirname + '/jsonlint.js',
	rjson = /\.json$/i;

Nodelint.Linters.add( 'jsonlint', path, rjson, function( JSONLint, file, content, options ) {
	// Inform Dev of lint type
	if ( options.verbose ) {
		Nodelint.info( "JSONLinting " + file );
	}

	// Run JSON file through linter
	result = JSONLint( content, options._jsonlint );

	// JSONLint only stops on every error, so create a single entry array from it
	return result.error ? [ result ] : [];
});
