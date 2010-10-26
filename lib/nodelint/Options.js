/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
global.Nodelint.Options = {

	// Default nodelint settings
	nodelint: {

		// If requested, default log file
		'logfile': null,

		// Path to custom JSLINT file
		'jslint': null,

		// Forcing CLI from Nodelint init
		'Nodelint-cli': false,

		// For build process
		'Nodelint-pre-commmit': false

	},

	// Default jslint settings
	jslint: {
	},

	// Shortcuts for nodelint settings
	shortcuts: {

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
		}

	}

};
