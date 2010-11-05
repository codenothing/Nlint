/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var sys = require('sys'),
	fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec,
	dist = __dirname.replace( /build\/?$/, 'dist/' ),
	config = {}, prefix = '';


// Creates the directory if it doesn't exist
function mkdir( dir, callback ) {
	path.exists( dir, function( exists ) {
		if ( exists ) {
			callback();
		}
		else {
			fs.mkdir( dir, 0755, function( e ) {
				if ( e ) {
					sys.error( e );
					process.exit( 1 );
				}

				callback();
			});
		}
	});
}


// Installs binfiles
function install( file ) {
	var from = dist + file,
		to = path.normalize( prefix + 'bin/' + file );

	exec( 'cp ' + from + ' ' + to, function( e ) {
		if ( e ) {
			sys.error( e );
			process.exit( 1 );
		}
		sys.puts( 'Installed ' + to );
	});
}


// Installing lib file
function libfile( i ) {
	if ( i >= require.paths.length ) {
		sys.error( "Could not find path to install lib files." );
		process.exit( 1 );
	}

	path.exists( require.paths[ i ], function( exists ) {
		if ( ! exists ) {
			return libfile( ++i );
		}

		exec( 'cp ' + dist + 'Nodelint ' + require.paths[ i ] + '/Nodelint.js', function( e ) {
			if ( e ) {
				sys.error( e );
				process.exit( 1 );
			}

			sys.puts( 'Installed ' + require.paths[ i ] + '/Nodelint.js' );
		});
	});
}


// Read configuration values
fs.readFile( dist + '.config', 'utf8', function( e, data ) {
	if ( e ) {
		sys.error( e );
		process.exit( 1 );
	}

	// Set configurations
	config = JSON.parse( data );
	prefix = ( config.prefix || process.installPrefix );

	// Ensure trailing slash
	if ( prefix[ prefix.length ] != '/' ) {
		prefix += '/';
	}

	// Install prefixs
	path.exists( prefix, function( exists ) {
		if ( ! exists ) {
			sys.error( "The install prefix doesn't exist: " + prefix );
		}

		mkdir( prefix + 'bin/', function(){
			[ 'jslint', 'Nodelint' ].forEach( install );
		});
	});

	if ( ! config.blocklibs ) {
		libfile( 0 );
	}
});
