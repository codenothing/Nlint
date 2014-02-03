var _Nlint = global.Nlint;

// Globalizing so that all libs use the same Nlint object
// Global object will be removed by end of script
global.Nlint = module.exports = require( './lib/Nlint.js' );
global.Nlint.version = require( './package.json' ).version;

// Libs are assumed to be prefixed to the lib directory
[

	// Core
	'Defaults.js',
	'FileResult.js',
	'MatchPath.js',
	'Settings.js',
	'Util.js',
	'Linter.js',
	'Render.js',

	// Cli Tools
	'Cli.js',
	'Color.js'

].forEach(function( file ) {
	require( './lib/' + file );
});


// Remove Stroke from global scope
global.Nlint = _Nlint;
