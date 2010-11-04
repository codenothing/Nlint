/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var sys = require('sys'),
	fs = require('fs'),
	config = {};

fs.readFile( __dirname + '/.config', 'utf8', function( e, data ) {
	if ( e ) {
		sys.error( e );
		process.exit( 1 );
	}

	config = JSON.parse( data );
	[ 'jslint', 'Nodelint' ].forEach(function( file ) {
		fs.rename( __dirname + '/' + file, ( config.prefix || process.installPrefix ) + '/bin/' + file, function( e ) {
			if ( e ) {
				sys.error( e );
				process.exit( 1 );
			}

			sys.puts( 'Installed ' + ( config.prefix || process.installPrefix ) + '/bin/' + file );
		});
	});
});
