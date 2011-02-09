/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
global.Nodelint.Options = {

	// Show help log
	'help': false,

	// If requested, default log file
	'logfile': null,

	// Special encodings to check for
	'encodings': null,

	// Only use a set of linters
	'use': null,

	// More lint modules
	'add': null,

	// Prevent color wrapping of output
	'no-color': false,

	// Display processing info to the terminal
	'verbose': false,

	// Show files that passes JSLINT in output
	'show-passed': false,

	// Show files that were ignored with .lintignore
	'show-ignored': false,

	// Show files that were ignored with .lintignore
	'show-missing': false,

	// Display warnings during processing to the terminal
	'show-warnings': false,


	// Forcing CLI from Nodelint init
	'Nodelint-cli': false,

	// For build process
	'Nodelint-pre-commit': false,
	'Nodelint-pre-commit-all': false,


	// Options that are expecting to be paths
	_paths: {
		'logfile': true
	},

	// Special argument handling
	_special: {

		// Encodings is a comma separated list of values
		'encodings': function( value, options ) {
			return ( value || '' ).split(',');
		},

		// Focused linters are a comma separated list of values
		'use': function( value, options ) {
			return ( value || '' ).split(',');
		},

		// Added linters is a comma separated list of paths to modules
		'add': function( value, options ) {
			var parts = [];

			( value || '' ).split(',').forEach(function( path ) {
				parts.push( Nodelint.normalize( path.trim() ) );
			});

			return path;
		}

	},

	// Shortcuts for nodelint settings
	_shortcuts: {

		// Help log
		'h': {
			'long': 'help',
			'expect': false,
			'default': true
		},

		// Shortcut for logfile, expecting next argument to be path to logfile
		'l': {
			'long': 'logfile',
			'expect': true,
			'default': null
		},

		// Shortcut for encodings list
		'e': {
			'long': 'encodings',
			'expect': true,
			'default': null
		},

		// Shortcut for encodings list
		'u': {
			'long': 'use',
			'expect': true,
			'default': null
		},

		// Adding more linter modules
		'a': {
			'long': 'add',
			'expect': true,
			'default': null
		},

		// Shortcut for no-color, prevent color wrapping of output
		'c': {
			'long': 'no-color',
			'expect': false,
			'default': true
		},

		// Shortcut for verbose mode
		'v': {
			'long': 'verbose',
			'expect': false,
			'default': true
		},

		// Shortcut for displaying files that passed
		'p': {
			'long': 'show-passed',
			'expect': false,
			'default': true
		},

		// Shortcut for displaying files that were ignored
		'i': {
			'long': 'show-ignored',
			'expect': false,
			'default': true
		},

		// Shortcut for displaying files that were missing
		'm': {
			'long': 'show-missing',
			'expect': false,
			'default': true
		},

		// Shortcut for displaying errors
		'w': {
			'long': 'show-warnings',
			'expect': false,
			'default': true
		}

	}

};
