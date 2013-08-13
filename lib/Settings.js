var Nlint = global.Nlint;

function Settings( defaults, nlint ) {
	var self = this;

	if ( ! ( self instanceof Settings ) ) {
		return new Settings( defaults, nlint );
	}

	self.nlint = nlint;
	self.reset();

	if ( Nlint.isObject( defaults ) ) {
		self.update( defaults );
	}
}

Settings.prototype = {

	// Updates options
	update: function( settings, root ) {
		var self = this, list = [];
		root = root || process.cwd();
		settings = settings || {};

		// Clean out parent settings
		if ( settings.reset === true ) {
			self.reset();
		}

		// Forking
		if ( settings.hasOwnProperty( 'fork' ) ) {
			self.fork = parseInt( settings.fork, 10 );
		}

		// Adding linters
		if ( settings[ 'add-linter' ] ) {
			self._addLinters( settings[ 'add-linter' ], root );
		}

		// Only allowing subset of linters
		if ( settings.use ) {
			if ( Nlint.isString( settings.use ) ) {
				if ( settings.use == '*' ) {
					self._use = null;
				}
				else {
					self._use = settings.use.toLowerCase().split( ' ' );
				}
			}
			else if ( Nlint.isArray( settings.use ) ) {
				self._use = [];

				settings.use.forEach(function( use ) {
					self._use.push( use.toLowerCase() );
				});
			}
		}

		// Linters contains a list of linter specific options
		if ( Nlint.isObject( settings.linters ) ) {
			Nlint.extend( true, self._linters, settings.linters );
		}
		else if ( settings.linters === null ) {
			self._linters = {};
		}

		// Ignore paths
		if ( settings.ignore ) {
			// Allow only a string path to be set on ignore
			if ( Nlint.isString( settings.ignore ) ) {
				list = [ settings.ignore ];
			}
			else if ( Nlint.isArray( settings.ignore ) ) {
				list = settings.ignore;
			}

			list.forEach(function( match ) {
				if ( match ) {
					self._ignore.push( new Nlint.MatchPath( match, root ) );
				}
			});
		}
	},

	// Resets all settings, DOES NOT implement project wide defaults
	reset: function(){
		var self = this;

		self.fork = 0;
		self._use = null;
		self._ignore = [];
		self._linters = {};
	},

	// Adding linters
	_addLinters: function( paths, root ) {
		if ( ! Nlint.isArray( paths ) ) {
			paths = [ paths ];
		}

		// Require each additional linter
		paths.forEach(function( path ) {
			Nlint.Linter(
				Nlint.normalizePath( path, root )
			);
		});
	},

	// Checks if linter is valid
	use: function( name ) {
		var self = this;

		return self._use ? self._use.indexOf( name ) !== -1 : true;
	},

	// Pulls linter specific options
	linters: function( name ) {
		var self = this;

		return self._linters[ name ] || {};
	},

	// Checks to see if path should be ignored
	ignore: function( path ) {
		var self = this, hasMatch = false;

		Nlint.each( self._ignore, function( match ) {
			if ( match.isMatch( path, self, self.nlint ) ) {
				hasMatch = true;
				return false;
			}
		});

		return hasMatch;
	}

};

// Expose
Nlint.Settings = Settings;
