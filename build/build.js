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
	root = __dirname.replace( /\/build\/?$/, '' ),
	dist = root + '/dist/',
	rconfig = /#\{config\}/g,
	rpath = /#\{path\}/g,
	rexec = /#\{exec\}/g,
	rname = /#\{name\}/g,
	rdisplay = /#\{display\}/g;


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

// Simple copy function
function copy( from, to ) {
	fs.readFile( from, 'utf8', function( e, content ) {
		if ( e ) {
			error( e );
		}

		fs.writeFile( to, content, 'utf8', function( e ) {
			if ( e ) {
				error( e );
			}
		});
	});
}

// Building custom man files for each linter
function buildman( name, manfile, config ) {
	manfile = manfile.replace( rname, name ).replace( rdisplay, config.display );
	fs.writeFile( dist + name + '.1', manfile, 'utf8', function( e ) {
		if ( e ) {
			error( e );
		}

		sys.puts( name + '.1 built.' );
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


// Centralized processing handler, for when all templates are loaded
function make( data, template, man ) {
	// No change to base Nodelint
	buildfile( 'nodelint-base', convert( template, data ) );

	// Copy base nodelint manfiles
	copy( __dirname + '/../man1/nodelint-base.1', dist + 'nodelint-base.1');
	copy( __dirname + '/../man1/nodelint.1', dist + 'nodelint.1');

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

	// The global nodelint handler
	buildfile( 'nodelint', convert( template, JSON.stringify( config ) ) );

	// Go through each required linter
	Nodelint.each( Nodelint.Linters.linters, function( object, name ) {
		if ( config.only && config.only.indexOf( name ) > -1 ) {
			return;
		}

		config.use = [ name ];
		config['default'] = name;
		buildfile( name, convert( template, JSON.stringify( config ) ) );
		buildman( name, man, object );
	});
}


// Make dist directory and get the templates
mkdir( dist, function(){
	fs.readFile( dist + '.config', 'utf8', function( e, data ) {
		if ( e ) {
			error( "Could not find configuration, did you run configure? - " + e );
		}

		fs.readFile( __dirname + '/_template', 'utf8', function( e, template ) {
			if ( e ) {
				error( e );
			}

			fs.readFile( __dirname + '/../man1/individual.1', 'utf8', function( e, man ) {
				if ( e ) {
					error( e );
				}

				make( data, template, man );
			});
		});
	});
});
