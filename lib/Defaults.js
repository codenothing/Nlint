global.Nlint.Defaults = {

	Settings: {

		// Defines which linters to use
		use: '*',

		// Defines the number of forks to use
		fork: require( 'os' ).cpus().length,

		// Linter specific options
		linters: {
			jscs: {
				requireCurlyBraces: [
					"if",
					"else",
					"for",
					"while",
					"do",
					"try",
					"catch"
				],
				requireSpaceAfterKeywords: [
					"if",
					"else",
					"for",
					"while",
					"do",
					"switch",
					"return",
					"try",
					"catch"
				],
				disallowLeftStickedOperators: [
					"?",
					"+",
					"-",
					"/",
					"*",
					"=",
					"==",
					"===",
					"!=",
					"!==",
					">",
					">=",
					"<",
					"<="
				],
				disallowRightStickedOperators: [
					"?",
					"+",
					"/",
					"*",
					":",
					"=",
					"==",
					"===",
					"!=",
					"!==",
					">",
					">=",
					"<",
					"<="
				],
				requireRightStickedOperators: [
					"!"
				],
				requireLeftStickedOperators: [
					","
				],
				disallowImplicitTypeConversion: [
					"string"
				],
				disallowKeywords: [
					"with"
				],
				disallowKeywordsOnNewLine: [
					"else"
				],
				disallowMultipleLineBreaks: true,
				disallowTrailingWhitespace: true,
				requireLineFeedAtFileEnd: true,
				validateJSDoc: {
					checkParamNames: true,
					requireParamTypes: true
				}
			}
		},
	},

	argv: [

		{
			name: 'use',
			short: 'u',
			type: 'csv',
			description: 'Defines the linters to use on directory or file. Defaults to all ("*")',
			example: "'nlint --use=jshint,csslint' or 'nlint -u jshint,csslint'"
		},

		{
			name: 'fork',
			short: 'f',
			type: 'int',
			description: 'Defines whether to use a forked process for each linter. Defaults to 4',
			example: "'nlint --fork=4' or 'nlint -f'"
		},

		{
			name: 'ignore',
			short: 'i',
			type: 'list,path',
			description: 'Defines files or directories to ignore',
			example: "'nlint --ignore=/path/to/file' or 'nlint -i /path/to/dir/'"
		},

		{
			name: 'add-linter',
			short: 'l',
			type: 'list,path',
			description: 'Defines scripts that add linters to use',
			example: "'nlint --add-linter=/path/to/file' or 'nlint -l /path/to/file'"
		}

	]

};
