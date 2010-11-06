/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	Options = Nodelint.Options,
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


Nodelint.ARGV = function( args ) {
	// Allow using list of arguments passed (but note that nothing is shifted if that is the case)
	var useargs = args && Array.isArray( args ),
		ARGV = useargs ? args.slice( 0 ) : process.argv.slice( 0 ),
		nodelint = Options.nodelint,
		jslint = Options.jslint,
		shortcuts = Options.shortcuts,
		copy = { nodelint: {}, jslint: {} },
		targets = [];

	// Assume binfile alias when not using node initializer
	if ( ! useargs && ARGV.shift() == 'node' ) {
		ARGV.shift();
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
					copy.nodelint[ parts[ 0 ] ] = convert( parts[ 1 ] );
				}
				else {
					copy.jslint[ parts[ 0 ] ] = convert( parts[ 1 ] );
				}
			}
			// Again, check if the option is defined in nodelint options,
			// Otherwise assume its a jslint option
			else if ( nodelint.hasOwnProperty( opt ) ) {
				copy.nodelint[ opt ] = true;
			}
			else {
				copy.jslint[ opt ] = true;
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
						copy.nodelint[ short.long ] = short.expect && ARGV.length ? convert( ARGV.shift() ) : short['default'];
					}
				}
			}
			else if ( ( short = shortcuts[ opt ] ) ) {
				copy.nodelint[ short.long ] = short.expect && ARGV.length ? convert( ARGV.shift() ) : short['default'];
			}
		}
		else {
			targets.push( opt );
		}
	}

	// Return the converted File List
	return { files: targets, options: copy };
};
