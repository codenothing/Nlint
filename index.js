var _Nodelint = global.Nodelint;

// Globalizing so that all libs use the same Nodelint object
// Global object will be removed by end of script
global.Nodelint = module.exports = require( './lib/Nodelint.js' );

// Libs are assumed to be prefixed to the lib directory
[

	// Core
	'Defaults.js',
	'Depends.js',
	'Settings.js',
	'Util.js',
	'Tracking.js',
	'Linter.js',
	'Render.js',

	// Pre-shipped linters
	'linters/jslint.js',
	'linters/jshint.js',
	'linters/jsonlint.js',
	'linters/csslint.js',

	// Command line interface
	'Cli/Cli.js',
	'Cli/Color.js',
	'Cli/ARGV.js'

].forEach(function( file ) {
	require( './lib/' + file );
});

// Remove Stroke from global scope
global.Nodelint = _Nodelint;
