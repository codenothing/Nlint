/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	fs = require('fs'),
	path = __dirname + '/../linters/';

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

	linters: {},

	check: function( file ) {
		for ( var i in Linters ) {
			if ( Linters[ i ].hasOwnProperty( 'match' ) &&  Linters[ i ].match.exec( file ) ) {
				return true;
			}
		}

		return false;
	},

	add: function( name, path, match, handle ) {
		var linter;

		// Setup options for linter
		Nodelint.Options[ name ] = null;
		Nodelint.Options[ '_' + name ] = {};
		Nodelint.Options._paths[ name ] = true;

		// Shortcut the handle for the lint program
		Linters.linters[ name ] = function( file, content, options ) {
			linter = linter || require( options[ name ] || path );
			return handle.call( this, linter, file, content, options );
		};
	}

});

// Expose Linters on the Nodelint namespace
Nodelint.Linters = Linters;

// The only synchronous action in the library, just to read in the linters
fs.readdirSync( path ).forEach(function( file ) {
	require( path + file );
});
