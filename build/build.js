/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = require('../src/Nodelint'),
	sys = require('sys'),
	fs = require('fs'),
	path = require('path'),
	root = __dirname.replace( /\/build\/?/, '' ),
	dist = root + '/dist/',
	rconfig = /#\{config\}/,
	rpath = /#\{path\}/,
	rexec = /#\{exec\}/;


// Default error handling
function error( e ) {
	sys.error( Nodelint.Color.bold.red( e.message || e ) );
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


// Building binfiles
function buildfile( name, file ) {
	fs.writeFile( dist + name, file, 'utf8', function( e ) {
		if ( e ) {
			error( e );
		}

		fs.chmod( dist + name, 0755, function( e ) {
			if ( e ) {
				error( e );
			}
			else {
				sys.puts( name + " built." );
			}
		});
	});
}


// Converts templates into binfiles
function convert( template, data ) {
	return template.replace( rconfig, data || 'null' )
		.replace( rpath, root )
		.replace( rexec, process.execPath );
}


// Make dist directory and build the binfiles
mkdir( dist, function(){
	fs.readFile( dist + '.config', 'utf8', function( e, data ) {
		if ( e ) {
			error( "Could not find configuration, did you run configure? - " + e );
			process.exit( 1 );
		}

		fs.readFile( __dirname + '/_template', 'utf8', function( e, template ) {
			if ( e ) {
				error( e );
				process.exit( 1 );
			}

			// No change to Nodelint
			buildfile( 'Nodelint', convert( template, data ) );

			// Show more information for focues lint binfiles
			var config = JSON.parse( data ), use;
			config.verbose = true;
			config[ 'Nodelint-cli' ] = true;
			config[ 'show-passed' ] = true;

			// Add any additional linters
			if ( config.add ) {
				global.Nodelint = Nodelint;
				config.add.forEach(function( path ) {
					require( path );
				});
			}

			// Go through each required linter
			Nodelint.each( Nodelint.Linters.linters, function( object, name ) {
				if ( config.only && config.only.indexOf( name ) > -1 ) {
					return;
				}

				config.use = [ name ];
				config['default'] = name;
				buildfile( name, convert( template, JSON.stringify( config ) ) );
			});
		});
	});
});
