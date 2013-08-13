var Nlint = global.Nlint;

function FileResult( path ) {
	var self = this;

	if ( ! ( this instanceof FileResult ) ) {
		return new FileResult( path );
	}

	self.path = path;
	self.passed = false;
	self.errors = [];
	self.warnings = [];
	self.times = [];
}

FileResult.prototype = {

	addResults: function( errors, warnings, times, linter ) {
		var self = this;

		// Add timestamp results
		self.times.push( times );

		// Validate all errors and warnings
		[ errors, warnings ].forEach(function( list ) {
			var type = list === errors ? 'errors' : 'warnings';

			// Nothing returned
			if ( ! list ) {
				return;
			}
			// If an array isn't returned, block it
			else if ( ! Nlint.isArray( list ) ) {
				throw new Error( linter + " didn't return an array for " + type + " [" + self.path + "]" );
			}

			// Validate each individual object
			list.forEach(function( value ) {
				self.validate( value, linter, type );
				self[ type ].push( value );
			});
		});

		// Mark passed state based on # of errors/warnings
		self.passed = self.errors.length === 0 && self.warnings.length === 0;
	},

	// Error/Warning validation
	validate: function( value, linter, type ) {
		var self = this;

		if ( ! value.message ) {
			throw new Error( linter + " didn't return a message for " + type + " [" + self.path + "]" );
		}
		else if ( ! Nlint.isNumber( value.line ) ) {
			throw new Error( linter + " didn't return a line number for " + type + " [" + self.path + "]" );
		}
		else if ( ! Nlint.isNumber( value.character ) ) {
			throw new Error( linter + " didn't return a character number for " + type + " [" + self.path + "]" );
		}
	}

};


// Expose
Nlint.FileResult = FileResult;
