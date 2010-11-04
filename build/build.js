/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var sys = require('sys'),
	fs = require('fs'),
	lintpath = __dirname.replace( /build\/?/, '' ),
	config = {},
	Templates = {
		// JSlint binfile
		jslint: [
			"#! /usr/bin/env node\n",
			"global._NodelintOptions = { nodelint: { jslint: '#{jslint}', verbose: true, 'show-passed': true } };\n",
			"require('" + lintpath + "').cli();"
		].join(''),

		// Nodelint binfile
		Nodelint: [
			"#! /usr/bin/env node\n",
			"global._NodelintOptions = { nodelint: { jslint: '#{jslint}' } };\n",
			"modules.exports = require('" + lintpath + "');"
		].join('')
	};


// Build the binfiles
fs.readFile( __dirname + '/.config', 'utf8', function( e, data ) {
	if ( e ) {
		sys.error( e );
		process.exit( 1 );
	}

	config = JSON.parse( data );
	[ 'jslint', 'Nodelint' ].forEach(function( name ){
		fs.writeFile( __dirname + '/' + name, Templates[ name ].replace( /#\{jslint\}/, config.jslint || '' ), 'utf8', function( e ) {
			if ( e ) {
				sys.error( e );
				process.exit( 1 );
			}

			fs.chmod( __dirname + '/' + name, 0755, function( e ) {
				if ( e ) {
					sys.error( e );
					process.exit( 1 );
				}
				else {
					sys.puts( name + " built." );
				}
			});
		});
	});
});
