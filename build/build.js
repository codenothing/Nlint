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
	root = __dirname.replace( /\/build\/?$/, '' ),
	dist = root + '/dist/',
	rconfig = /#\{config\}/g,
	rpath = /#\{path\}/g,
	rexec = /#\{exec\}/g,
	rname = /#\{name\}/g,
	rdisplay = /#\{display\}/g,
	track,
	templates = [
		{
			name: 'data',
			path: dist + '.config',
			error: 'Could not find configuration, did you run configure? - '
		},
		{
			name: 'template',
			path: __dirname + '/_template',
			error: ''
		},
		{
			name: 'man',
			path: __dirname + '/../man1/individual.1',
			error: ''
		},
		{
			name: 'libfile',
			path: __dirname + '/_libfile.js',
			error: ''
		}
	];


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

		sys.puts( Color.blue( name + '.1 built.' ) );
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
				sys.puts( Color.blue( name + " built." ) );
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
track = Nodelint.Tracking('Build Process', function( e, results ) {
	if ( e ) {
		error( e );
	}

	// No change to base Nodelint, or libfile
	buildfile( 'nodelint-base', convert( results.template, results.data ) );
	buildfile( 'Nodelint.js', convert( results.libfile, results.data ) );

	// Copy base nodelint manfiles
	copy( __dirname + '/../man1/nodelint-base.1', dist + 'nodelint-base.1');
	copy( __dirname + '/../man1/nodelint.1', dist + 'nodelint.1');

	// Show more information for focues lint binfiles
	var config = JSON.parse( results.data ), use;
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
	buildfile( 'nodelint', convert( results.template, JSON.stringify( config ) ) );

	// Go through each required linter
	Nodelint.each( Nodelint.Linters.linters, function( object, name ) {
		if ( config.only && config.only.indexOf( name ) > -1 ) {
			return;
		}

		config.use = [ name ];
		config['default'] = name;
		buildfile( name, convert( results.template, JSON.stringify( config ) ) );
		buildman( name, results.man, object );
	});
});


// Make dist directory and get the templates
mkdir( dist, function(){
	Nodelint.each( templates, function( object ) {
		track.mark( object.name );
		fs.readFile( object.path, 'utf8', function( e, content ) {
			if ( e ) {
				return track.error( object.error + e );
			}
			
			track.mark( object.name, content );
		});
	});

	// Start the wait process
	track.start();
});
