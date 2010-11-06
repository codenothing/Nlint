/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var sys = require('sys'),
	fs = require('fs'),
	path = require('path'),
	root = __dirname.replace( /\/build\/?/, '' ),
	dist = root + '/dist/',
	Templates = {
		// JSlint binfile
		jslint: [
			"#! /usr/bin/env node\n",
			"global._NodelintOptions = #{config};\n",
			"require('" + root + "').Cli();"
		].join(''),

		// Nodelint binfile
		Nodelint: [
			"#! /usr/bin/env node\n",
			"global._NodelintOptions = #{config};\n",
			"modules.exports = require('" + root + "');"
		].join('')
	};


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


// Building binfiles
function buildfile( name, config ) {
	fs.writeFile( dist + name, Templates[ name ].replace( /#\{config\}/, config || 'null' ), 'utf8', function( e ) {
		if ( e ) {
			sys.error( e );
			process.exit( 1 );
		}

		fs.chmod( dist + name, 0755, function( e ) {
			if ( e ) {
				sys.error( e );
				process.exit( 1 );
			}
			else {
				sys.puts( name + " built." );
			}
		});
	});
}


// Make dist directory and build the binfiles
mkdir( dist, function(){
	fs.readFile( dist + '.config', 'utf8', function( e, data ) {
		if ( e ) {
			sys.error( e );
			process.exit( 1 );
		}

		// No change to Nodelint
		buildfile( 'Nodelint', data );

		// Show more information for jslint binfile
		var config = JSON.parse( data );
		config.verbose = true;
		config[ 'show-passed' ] = true;
		buildfile( 'jslint', JSON.stringify( config ) );
	});
});
