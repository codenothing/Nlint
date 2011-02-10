/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	fs = require('fs'),
	path = __dirname + '/linters/';


function Linters( file, content, options ) {
	var i, linters = Linters.linters, def = options['default'];

	for ( i in linters ) {
		// Limit linters to defined list in options
		if ( options.use && options.use.indexOf( i ) === -1 ) {
			continue;
		}
		else if ( linters[ i ].hasOwnProperty( 'match' ) &&  linters[ i ].match.exec( file ) ) {
			return linters[ i ].call( this, file, content, options );
		}
	}

	// For direct file pointers
	if ( def && linters[ def ] ) {
		return linters[ def ].call( this, file, content, options );
	}

	return null;
}


Nodelint.extend( Linters, {

	linters: {},

	check: function( file, options ) {
		var i, linters = Linters.linters;

		for ( i in linters ) {
			// Limit linters to defined list in options
			if ( options.use && options.use.indexOf( i ) === -1 ) {
				continue;
			}
			else if ( linters[ i ].hasOwnProperty( 'match' ) &&  linters[ i ].match.exec( file ) ) {
				return true;
			}
		}

		return false;
	},

	add: function( config, handle ) {
		var linter;

		// Setup options for linter
		Nodelint.Options[ config.name ] = null;
		Nodelint.Options[ '_' + config.name ] = {};
		Nodelint.Options._paths[ config.name ] = true;

		// Shortcut the handle for the lint program
		Linters.linters[ config.name ] = function( file, content, options ) {
			linter = linter || require( options[ config.name ] || config.path );

			// Processing info
			if ( options.verbose ) {
				Nodelint.info( ( config.display || config.name ) + 'ing ' + file );
			}

			// Run the linter
			return handle.call( this, linter, file, content, options[ '_' + config.name ], options );
		};

		// Attach configuration options to the internal handle
		Nodelint.extend( Linters.linters[ config.name ], config );
	}

});

// Expose Linters on the Nodelint namespace
Nodelint.Linters = Linters;

// The only synchronous action in the library, just to read in the linters
fs.readdirSync( path ).forEach(function( file ) {
	require( path + file );
});
