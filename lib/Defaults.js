Nodelint.Defaults = {

	linters: {

		csslint: {},
		jslint: {},
		jshint: {},
		jsonlint: {}

	},

	argv: {
		
		full: {

			use: {
				type: 'list'
			},

			ignore: {
				type: 'list,path'
			}

		},

		shorthand: {
			u: 'use',
			i: 'ignore'
		}

	}

};
