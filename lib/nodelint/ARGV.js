/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Options = require('../../Options').Options,
	nodelint = Options.nodelint,
	jslint = Options.jslint,
	shortcuts = Options.shortcuts,
	ARGV = process.argv.slice( 2 ),
	Files = [],
	rdouble = /^--/,
	rsingle = /^-/,
	short, opt, parts, i, l;


// Type conversion
function convert( val ) {
	return val === undefined || val.length < 1 || val === 'undefined' ? undefined :
		val === 'true' ? true :
		val === 'false' ? false :
		val === 'null' ? null :
		val == parseFloat( val ) ? parseFloat( val ) :
		val;
}


// Run through the arguments and apply to their respective areas
while ( ARGV.length ) {
	opt = ARGV.shift();

	// Longhand notation "--option=value"
	// NOTE*: Longhand notations may contain jslint options, so check for defined props
	if ( rdouble.exec( opt ) ) {
		opt = opt.replace( rdouble, '' );

		// Check for value assignment first
		if ( opt.indexOf('=') > -1 ) {
			parts = opt.split('=');

			// Must be defined in nodelint options, otherwise assume it's a jslint option
			if ( nodelint.hasOwnProperty( parts[ 0 ] ) ) {
				nodelint[ parts[ 0 ] ] = convert( parts[ 1 ] );
			}
			else {
				jslint[ parts[ 0 ] ] = convert( parts[ 1 ] );
			}
		}
		// Again, check if the option is defined in nodelint options,
		// Otherwise assume its a jslint option
		else if ( nodelint.hasOwnProperty( opt ) ) {
			nodelint[ opt ] = true;
		}
		else {
			jslint[ opt ] = true;
		}
	}
	// Shorthand notation "-o [value]"
	else if ( rsingle.exec( opt ) ) {

		// Shorthand operations can be bunched, so go through each character and do match comparrisons
		if ( ( opt = opt.replace( rsingle, '' ) ).length > 1 ) {
			for ( i = -1, l = opt.length; ++i < l; ) {
				if ( ( short = shortcuts[ opt[ i ] ] ) ) {

					// Check to see if it's expecting a second argument first
					// Otherwise just use the default
					nodelint[ short.long ] = short.expect && ARGV.length ? convert( ARGV.shift() ) : short['default'];
				}
			}
		}
		else if ( ( short = shortcuts[ opt ] ) ) {
			nodelint[ short.long ] = short.expect && ARGV.length ? convert( ARGV.shift() ) : short['default'];
		}
	}
	else {
		Files.push( opt );
	}
}

// Expose file list
exports.Files = Files;
