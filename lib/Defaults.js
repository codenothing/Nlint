Nodelint.Defaults = {

	Settings: {

		use: '*',

		linters: {

			csslint: {},
			jslint: {},
			jshint: {},
			jsonlint: {}

		}

	},

	argv: [
		
		{
			name: 'use',
			short: 'u',
			type: 'csv',
			description: 'Defines the linters to use on directory or file',
			example: "'nlint --use=jshint,csslint' or 'nlint -u jshint,csslint'"
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
