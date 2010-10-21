/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
exports.Options = {

	// Default nodelint settings
	nodelint: {

		// If requested, default log file
		'logfile': null

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
		}

	}

};
