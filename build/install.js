/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = require('../src/Nodelint'),
	Color = Nodelint.Color,
	sys = require('sys'),
	fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec,
	root = __dirname.replace( /build\/?$/, '' ),
	dist = root + 'dist/',
	config = {}, prefix = '';


// Default error handling
function error( e ) {
	sys.error( Color.bold.red( e.message || e ) );
	process.exit( 1 );
}


// Creates the directory if it doesn't exist
function mkdir( dir, callback ) {
	path.exists( dir, function( exists ) {
		if ( exists ) {
			callback();
		}
		else {
			fs.mkdir( dir, 0755, function( e ) {
				if ( e ) {
					error( e );
				}

				callback();
			});
		}
	});
}


// Installs binfiles
function install( from, to ) {
	exec( 'cp ' + from + ' ' + to, function( e ) {
		if ( e ) {
			error( e );
		}
		sys.puts( Color.blue( 'Installed ' + to ) );
	});
}


// Installs binfiles and manfiles
function all(){
	var stack = [ 'nodelint', 'nodelint-base' ];

	// Install each of the lint cli programs
	Nodelint.each( Nodelint.Linters.linters, function( object, name ) {
		stack.push( name );
	});

	// Install the nodelint and nodelint-base clie programs
	Nodelint.each( stack, function( name ) {
		// Binfile
		install(
			dist + name,
			prefix + 'bin/' + name
		);

		// Manfile
		install(
			dist + name + '.1',
			prefix + 'share/man/man1/' + name + '.1'
		);
	});
}


// Installing lib file for requiring into your apps
function libfile( i ) {
	if ( i >= require.paths.length ) {
		error( "Could not find path to insall lib files." );
	}

	path.exists( require.paths[ i ], function( exists ) {
		if ( ! exists ) {
			return libfile( ++i );
		}

		install(
			dist + 'Nodelint.js',
			require.paths[ i ] + '/Nodelint.js'
		);
	});
}


// Read configuration values
fs.readFile( dist + '.config', 'utf8', function( e, data ) {
	if ( e ) {
		error( e );
	}

	// Set configurations
	config = JSON.parse( data );
	prefix = ( config.prefix || process.installPrefix );

	// Ensure trailing slash
	if ( prefix[ prefix.length - 1 ] != '/' ) {
		prefix += '/';
	}

	// Install prefixs
	path.exists( prefix, function( exists ) {
		if ( ! exists ) {
			error( "The install prefix doesn't exist: " + prefix );
		}

		// Binfiles
		mkdir( prefix + 'bin/', function(){
			// Manfiles
			mkdir( prefix + 'share/', function(){
				mkdir( prefix + 'share/man/', function(){
					mkdir( prefix + 'share/man/man1/', all );
				});
			});
		});
	});

	// Auto install the lib file
	libfile( 0 );
});
