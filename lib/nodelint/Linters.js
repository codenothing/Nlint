/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	rshebang = /^\#\!.*/,
	rerror = /^\s*(\S*(\s+\S+)*)\s*$/;

function Linters( file, content, options ) {
	var linters = Linters, i;

	for ( i in Linters ) {
		if ( Linters[ i ].hasOwnProperty( 'match' ) &&  Linters[ i ].match.exec( file ) ) {
			return Linters[ i ].handle( file, content, options );
		}
	}

	return null;
}

Nodelint.extend( Linters, {

	_check: function( file ) {
		for ( var i in Linters ) {
			if ( Linters[ i ].hasOwnProperty( 'match' ) &&  Linters[ i ].match.exec( file ) ) {
				return true;
			}
		}

		return false;
	},

	jslint: {
		path: __dirname + '/../linters/jslint.js',
		match: /\.js$/,
		handle: function( file, content, options ) {
			// Prevent loading of linter on every run
			var linter = Linters.jslint._linter || require( options.jslint || Linters.jslint.path );
			Linters.jslint._linter = linter;

			// Remove possible enviorment decalaration
			content = content.replace( rshebang, '' );

			// Inform Dev
			if ( options.verbose ) {
				Nodelint.info( "JSLinting " + file );
			}

			// Lint the jsfile
			if ( linter( content, options._jslint ) ) {
				return [];
			}
			else {
				// When jslint is unable to continue, it pushes a null entry
				if ( linter.errors[ linter.errors.length - 1 ] === null ) {
					linter.errors.pop();
				}

				// Format jslint errors to our format
				for ( var i = -1, l = linter.errors.length; ++i < l; ) {
					linter.errors[ i ].error = linter.errors[ i ].reason;
					linter.errors[ i ].evidence = ( linter.errors[ i ].evidence || '' ).replace( rerror, "$1" );
				}

				return linter.errors;
			}
		}
	},

	jsonlint: {
		path: __dirname + '/../linters/jsonlint.js',
		match: /\.json$/,
		handle: function( file, content, options ) {
			// Prevent loading of linter on every run
			var linter = Linters.jsonlint._linter || require( options.jsonlint || Linters.jsonlint.path ), result;
			Linters.jsonlint._linter = linter;

			// Inform Dev
			if ( options.verbose ) {
				Nodelint.info( "JSONLinting " + file );
			}

			// Run JSON file through linter
			result = linter( content, options._jsonlint );

			// JSONLint only stops on every error, so create a single entry array from it
			return result.error ? [ result ] : [];
		}
	}
});


// Expose Linters
module.exports = Linters;
