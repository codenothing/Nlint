/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
module.exports = {

	// If requested, default log file
	'logfile': null,

	// Path to custom JSLINT file
	'jslint': null,

	// How long to wait for buffers to finish flushing before exiting
	'buffer-wait': 400,

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
	'Nodelint-pre-commmit': false,
	'Nodelint-pre-commmit-all': false,



	// Default jslint settings
	_jslint: {},

	// Shortcuts for nodelint settings
	_shortcuts: {

		// Shortcut for logfile, expecting next argument to be path to logfile
		'l': {
			'long': 'logfile',
			'expect': true,
			'default': null
		},

		// Shortcut for jslint, expecting next argument to be path to custom jslint
		'j': {
			'long': 'jslint',
			'expect': true,
			'default': null
		},

		// Shortcutt for buffer-wait time
		'b': {
			'long': 'buffer-wait',
			'expect': true,
			'default': 400
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
