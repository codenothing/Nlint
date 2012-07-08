Nodelint.Defaults = {

	linters: {

		csslint: {},
		jslint: {},
		jshint: {},
		jsonlint: {}

	},

	argv: [
		
		{
			name: 'use',
			short: 'u',
			type: 'csv',
			description: 'Defines the linters to use on directory or file',
			example: "'stroke --use=jshint,csslint' or 'stroke -u jshint,csslint'"
		},
		
		{
			name: 'ignore',
			short: 'i',
			type: 'list,path',
			description: 'Defines files or directories to ignore',
			example: "'stroke --ignore=/path/to/file' or 'stroke -i /path/to/dir/'"
		}

	]
		
};
