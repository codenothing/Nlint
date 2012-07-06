var Nodelint = global.Nodelint,
	fs = require( 'fs' ),
	rshebang = /^\#\!.*/,
	Linters = [];


function LinterWrapper( settings ) {
	var self = this;

	if ( ! ( self instanceof LinterWrapper ) ) {
		return new LinterWrapper( settings );
	}

	settings = settings || {};
	self.realname = settings.name || '';
	self.lname = self.realname.toLowerCase();
	self.match = settings.match || self.lname;
	self.priority = settings.priority || 0.5;
	self.added = Date.now();
}

LinterWrapper.prototype = {

	isMatch: function( path ) {
		var self = this;

		if ( Nodelint.isString( self.match ) ) {
			return path.length - self.match.length > 0 &&
				path.substr( path.length - self.match.length, self.match.length ) == self.match;
		}
		else if ( Nodelint.isRegExp( self.match ) ) {
			return !!( self.match.exec( path ) );
		}
		else if ( Nodelint.isFunction( self.match ) ) {
			return self.match( path );
		}
		else {
			return false;
		}
	},

	render: function( path, settings, callback ) {
		var self = this;

		fs.readFile( path, 'utf8', function( e, contents ) {
			if ( e ) {
				return callback( e );
			}

			// Remove the posible shebang line for node files
			contents = contents.replace( rshebang, '' );

			// Only pass through linter if the file exists
			if ( contents.length ) {
				self.lint( path, contents, settings, callback );
			}
			else {
				callback();
			}
		});
	},

	lint: function( path, contents, settings, callback ) {
		throw new Error( "Linter Not Setup for '" + this.realname + "'" );
	}

};


// Expose
Nodelint.LinterWrapper = LinterWrapper;
Nodelint.Linters = Linters;
Nodelint.Linter = function( settings, handle ) {
	// Convert pure function handle into object
	if ( Nodelint.isFunction( handle ) ) {
		handle = { lint: handle };
	}

	// Generate linter and attach to list
	var wrapper = new LinterWrapper( settings );
	Nodelint.extend( wrapper, handle );
	Linters.push( wrapper );

	// Sort linters
	Nodelint.Linters = Linters = Linters.sort(function( a, b ) {
		return a.priority == b.priority ? a.added < b.added : a.priority < b.priority;
	});
};
