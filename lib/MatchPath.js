var Nlint = global.Nlint;

function MatchPath( match, root ) {
	var self = this;

	// Force MatchPath instance
	if ( ! ( self instanceof MatchPath ) ) {
		return new MatchPath( match, root );
	}

	// If string matching, prefix the entry to the root directory,
	// and see if it should be converted to regex
	if ( Nlint.isString( match ) ) {
		match = Nlint.normalizePath( match, root || process.cwd() );

		// If path has a global match '*' character, then regex it
		if ( match.indexOf( '*' ) !== -1 ) {
			match = Nlint.regexPath( match );
		}
	}

	self.match = match;
	self.isDirectory = Nlint.isString( match ) && match[ match.length - 1 ] == '/';
	self.isString = Nlint.isString( match );
	self.isRegExp = Nlint.isRegExp( match );
	self.isFunction = Nlint.isFunction( match );
}

MatchPath.prototype = {

	isMatch: function( path, settings, nlint ) {
		var self = this;

		return ( self.isDirectory && path.indexOf( self.match ) === 0 ) ||
			( self.isString && path === self.match ) ||
			( self.isRegExp && !!self.match.exec( path ) ) ||
			( self.isFunction && self.match( path, self, settings, nlint ) );
	}

};


// Expose
Nlint.MatchPath = MatchPath;
