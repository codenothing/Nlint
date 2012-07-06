var Nodelint = global.Nodelint;


function Settings( defaults, nodelint ) {
	var self = this;

	if ( ! ( self instanceof Settings ) ) {
		return new Settings( defaults, nodelint );
	}

	self.nodelint = nodelint;
	self._ignore = [];
	self._linter = [];
	self._special = [];
	self._linters = {};

	if ( Nodelint.isObject( defaults ) ) {
		self.update( defaults );
	}
}

Settings.prototype = {

	// Updates options
	update: function( settings, root ) {
		var self = this, list = [];
		root = root || process.cwd();

		// Only allowing subset of linters
		if ( settings.use ) {
			if ( Nodelint.isString( settings.use ) ) {
				self._use = settings.use.toLowerCase().split( ' ' );
			}
			else if ( Nodelint.isArray( settings.use ) ) {
				self._use = [];

				settings.use.forEach(function( use ) {
					self.use.push( use.toLowerCase() );
				});
			}
		}
		else if ( settings.use === null ) {
			self._use = null;
		}

		// Linters contains a list of linter specific options
		if ( Nodelint.isObject( settings.linters ) ) {
			Nodelint.extend( true, self._linters, settings.linters );
		}
		else if ( settings.linters === null ) {
			self._linters = {};
		}

		// Cycle through each option and build their lists
		[ 'ignore', 'linter', 'special' ].forEach(function( name ) {
			var list = self[ '_' + name ] || [];

			list.push.apply( list, self._listMaker( name, settings[ name ], root ) );
			self[ '_' + name ] = list.sort(function( a, b ) {
				return a.priority == b.priority ? a.added < b.added : a.priority < b.priority;
			});
		});
	},

	// Generates sorted list of objects
	_listMaker: function( name, rules, root ) {
		var self = this, list = [];

		// Convert object into array
		if ( Nodelint.isObject( rules ) ) {
			Nodelint.each( rules, function( value, path ) {
				var addition = {
					match: path,
					priority: 0.5,
					added: Date.now()
				};

				addition[ name ] = value;
				list.push( addition );
			});

			rules = list;
		}

		// If rules isn't an array, then reject it
		if ( ! Nodelint.isArray( rules ) ) {
			return [];
		}

		// Cycle through each object and normalize them
		list = [];
		rules.forEach(function( object ) {
			if ( ! object ) {
				throw "Undefined Rule For '" + name + "' in " + root;
			}
			else if ( ! Nodelint.isObject( object ) ) {
				object = { match: object };
			}
			else if ( ! object.match || ! object[ name ] ) {
				throw "Invalid Rule For '" + name + "' in " + root;
			}

			// If string matching, prefix the entry to the root directory,
			// and see if it should be converted to regex
			var match = object.match;
			if ( Nodelint.isString( match ) ) {
				match = Nodelint.normalizePath( root + '/' + match );

				// If path matches a directory, or has a global match '*' character, then regex it
				if ( match[ match.length - 1 ] == '/' || match.indexOf( '*' ) !== -1 ) {
					match = Nodelint.regexPath( match );
				}

				// Reassign changes
				object.match = match;
			}

			// Normalize
			object = Nodelint.extend( true, {}, object, {
				priority: object.priority || 0.5,
				added: object.added || Date.now(),
				isString: Nodelint.isString( object.match ),
				isRegExp: Nodelint.isRegExp( object.match ),
				isFunction: Nodelint.isFunction( object.match ),
				isMatch: function( path ) {
					return ( object.isString && path == object.match ) ||
						( object.isRegExp && object.match.exec( path ) ) ||
						( object.isFunction && object.match( path, object, self, self.nodelint ) );
				}
			});

			// Re-add object
			list.push( object );
		});

		return list;
	},

	// Checks if linter is valid
	use: function( name ) {
		var self = this;

		return self._use ? self._use.indexOf( name ) !== -1 : true;
	},

	// Pulls linter specific specials
	linters: function( name ) {
		var self = this;

		return self._linters[ name ] || {};
	},

	// Checks to see if path should be ignored
	ignore: function( path ) {
		var self = this, hasMatch = false;

		Nodelint.each( self._ignore, function( match ) {
			if ( match.isMatch( path ) ) {
				hasMatch = true;
				return false;
			}
		});

		return hasMatch;
	},

	// Checks to see if a special linter is designated for the path
	linter: function( path ) {
		var self = this, linter = null;

		Nodelint.each( self._ignore, function( match ) {
			if ( match.isMatch( path ) ) {
				linter = match.linter;
				return false;
			}
		});

		return linter;
	},

	// Checks for any special options on the path
	special: function( path ) {
		var self = this, object = {}, hasMatch = false;

		self._special.forEach(function( match ) {
			if ( match.isMatch( path ) ) {
				hasMatch = true;
				object = Nodelint.extend( true, object, match.special );
			}
		});

		return hasMatch ? object : null;
	}

};


Nodelint.Settings = Settings;
