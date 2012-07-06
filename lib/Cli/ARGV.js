var Nodelint = global.Nodelint,
	PATH = require( 'path' ),
	rhome = /^\~\//,
	rlist = /^list\,/,
	rdash = /^\-\-/;


function ARGV( settings, argv ) {
	var targets = [], args = {}, option, shorthand, i;

	// Extend shorthand properties onto full length definitions
	settings.shorthand = settings.shorthand || {};
	for ( i in settings.shorthand ) {
		shorthand = settings.shorthand[ i ];

		if ( typeof shorthand == 'string' && settings.full[ shorthand ] ) {
			settings.full[ shorthand ].shorthand = i;
		}
		else if ( shorthand && shorthand.full && settings.full[ shorthand.full ] ) {
			settings.full[ shorthand.full ] = i;
		}
	}

	// Allow for set array of arguments to parse, otherwise skip the 'node script.js' arguments
	( argv || process.argv.slice( 2 ) ).forEach(function( arg, i ) {

		// Making tests easier
		shorthand = settings.shorthand[ arg.substr( 1 ) ];

		// Previous argument was a shorthand followed by a value
		if ( option ) {
			arg = arg.trim();
			shorthand = settings.shorthand[ option ];

			if ( typeof shorthand == 'string' && settings.full[ shorthand ] ) {
				args[ option ] = args[ shorthand ] = ARGV.convert( settings.full[ shorthand ].type, arg );
			}
			else if ( shorthand && shorthand.full && settings.full[ shorthand.full ] ) {
				args[ option ] = args[ shorthand.full ] = ARGV.convert( settings.full[ shorthand.full ].type, arg );
			}
			else if ( settings.full[ option ] ) {
				args[ option ] = ARGV.convert( settings.full[ option ].type, arg );
			}
			else {
				args[ option ] = arg;
			}

			option = null;
		}

		// Any argument that isn't prefixed with a dash '-'
		// and doesn't come after a shorthand value is a target
		else if ( arg[ 0 ] != '-' ) {
			targets.push( arg );
		}

		// Full length argument without value '--name'
		else if ( arg[ 1 ] == '-' && arg.indexOf( '=' ) === -1 ) {
			args[ arg.substr( 2 ) ] = true;
		}

		// Full length argument '--name=value'
		else if ( arg[ 1 ] == '-' ) {
			option = arg.substr( 2, arg.indexOf( '=' ) - 2 ).trim();
			arg = arg.substr( arg.indexOf( '=' ) + 1 ).trim();

			if ( settings.full[ option ] ) {
				args[ option ] = ARGV.convert( settings.full[ option ].type, arg );

				// Set shorthand value as well
				if ( settings.full[ option ].shorthand ) {
					args[ settings.full[ option ].shorthand ] = args[ option ];
				}
			}
			else {
				args[ option ] = arg;
			}

			option = null;
		}

		// Multiple shorthands in single arg '-abc'
		else if ( arg.length > 2 ) {
			arg.substr( 1 ).split('').forEach(function( character ) {
				shorthand = settings.shorthand[ arg.substr( 1 ) ];

				if ( typeof shorthand == 'string' && settings.full[ shorthand ] ) {
					args[ character ] = args[ shorthand ] = true;
				}
				else if ( shorthand.full && settings.full[ shorthand.full ] ) {
					args[ character ] = args[ shorthand.full ] = true;
				}
				else {
					args[ character ] = true;
				}
			});
		}

		// Shorthand argument followed by a value '-a value'
		else if ( argv[ i + 1 ] && argv[ i + 1 ].length > 0 && argv[ i + 1 ][ 0 ] != '-' ) {
			option = arg.substr( 1 );
		}

		// Standalone shorthand (string value) with a coresponding full argument value '-a'
		else if ( typeof shorthand == 'string' && settings.full[ shorthand ] ) {
			args[ arg.substr( 1 ) ] = args[ shorthand.full ] = true;
		}

		// Standalone shorthand (object value) with a coresponding full argument value '-a'
		else if ( shorthand.full && settings.full[ shorthand.full ] ) {
			args[ arg.substr( 1 ) ] = args[ shorthand.full ] = true;
		}

		// Standalone shorthand '-a'
		else {
			args[ arg.substr( 1 ) ] = true;
		}

	});


	// Return arguments 
	return { targets: targets, args: args };
}

// Converting argument values
ARGV.convert = function( type, value ) {
	type = type || '';

	// Null values get converted immediately
	if ( value === 'null' ) {
		return null;
	}

	// Path type turns the argument into an absolute system path
	// Just leave type blank to keep paths sent over the cli
	else if ( type == 'path' ) {
		if ( rhome.exec( value ) ) {
			value = process.env.HOME + '/' + value.replace( rhome, '' );
		}
		else if ( value[ 0 ] != '/' ) {
			value = process.cwd() + '/' + value;
		}

		return PATH.normalize( value + '/' );
	}

	// Integer type
	else if ( type == 'int' ) {
		return parseInt( value, 10 );
	}

	// Any number type
	else if ( type == 'number' ) {
		return parseFloat( value );
	}

	// Boolean type
	else if ( type == 'boolean' ) {
		return !!( value === '1' || value === 'true' );
	}

	// Comma separated list type
	else if ( type == 'list' ) {
		return value.split(',');
	}

	// Comma separated list with secondary types.
	else if ( rlist.exec( type ) ) {
		type = type.split(',').slice( 1 );
		value = value.split(',');

		// Can assign a type to each list item passed
		if ( type.length > 1 ) {
			type.forEach(function( t, i ) {
				value[ i ] = ARGV.convert( t, value[ i ] || '' );
			});
		}
		// Single type for all list items passed
		else {
			type = type[ 0 ];
			value.forEach(function( v, i ) {
				value[ i ] = ARGV.convert( type, v );
			});
		}
	}

	return value;
};


// Expose argument conversion
Nodelint.Cli.ARGV = ARGV;
