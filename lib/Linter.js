var Nlint = global.Nlint,
	fs = require( 'fs' ),
	Slice = Array.prototype.slice,
	rshebang = /^\#\!.*/,
	guid = 0;


function Linter( path ) {
	var self = this, result, settings,
		current = Nlint.Linters.filter(function( linter ) {
			return linter.path === path;
		});

	// Found existing linter
	if ( current.length > 0 ) {
		return current[ 0 ];
	}
	// Path must be defined
	else if ( ! Nlint.isString( path ) || ! path.length ) {
		throw new Error( "Linter path not defined" );
	}
	// Force linter instance
	else if ( ! ( self instanceof Linter ) ) {
		return new Linter( path );
	}

	// Settings are found on module.exports of the linter file
	result = Nlint.require( path );
	settings = result.result;

	// Linter checking
	if ( result.error ) {
		throw result.error;
	}
	else if ( ! settings ) {
		throw new Error( "No exports found on path [" + path + "]" );
	}
	else if ( ! Nlint.isFunction( settings.render ) ) {
		throw new Error( "Render not set on linter [" + path + "]" );
	}

	// Internals
	self.path = path;
	self.name = settings.name || '';
	self.lname = self.name.toLowerCase();
	self.defaults = settings.defaults || {};
	self.match = settings.match || self.lname;
	self.runner = settings.render;

	// Stash match type
	if ( Nlint.isString( self.match ) ) {
		self.matchType = Linter.MATCH_TYPE_STRING;
	}
	else if ( Nlint.isRegExp( self.match ) ) {
		self.matchType = Linter.MATCH_TYPE_REGEX;
	}
	else if ( Nlint.isFunction( self.match ) ) {
		self.matchType = Linter.MATCH_TYPE_FUNC;
	}
	else {
		throw new Error( "Match has to be of type string, regex, or function on linter [" + path + "]" );
	}

	// Attach linter to watch list
	Nlint.Linters.push( self );

	// Create default object namespace
	Nlint.Defaults.Settings.linters[ self.lname ] = self.defaults;
}

Linter.prototype = {

	// Path Matching
	isMatch: function( path, settings, nlint ) {
		var self = this;

		if ( self.matchType == Linter.MATCH_TYPE_STRING ) {
			return path.split( '.' ).pop() === self.match;
		}
		else if ( self.matchType == Linter.MATCH_TYPE_REGEX ) {
			return !!( self.match.exec( path ) );
		}
		else if ( self.matchType == Linter.MATCH_TYPE_FUNC ) {
			return self.match( path, settings, nlint );
		}
		else {
			return false;
		}
	},

	// Running linter on file path
	render: function( path, settings, callback ) {
		var self = this,
			times = {
				start: Date.now(),
				name: self.name
			};

		fs.readFile( path, 'utf8', function( e, contents ) {
			times.read = Date.now();

			// File error
			if ( e ) {
				return callback( e );
			}

			// Remove possible env declaration (nodejs files)
			contents = ( contents || '' ).replace( rshebang, '' );

			// There is content to analyze
			if ( contents.length ) {
				self.runner( path, contents, settings, function(){
					times.lint = Date.now();

					var args = Slice.call( arguments );
					args[ 3 ] = times;

					callback.apply( callback, args );
				});
			}
			else {
				times.lint = Date.now();
				callback( null, null, null, times );
			}
		});
	}

};


// Constants
Linter.MATCH_TYPE_STRING = 'MATCH_TYPE_STRING';
Linter.MATCH_TYPE_REGEX = 'MATCH_TYPE_REGEX';
Linter.MATCH_TYPE_FUNC = 'MATCH_TYPE_FUNC';
Linter.LINTER_DIR = __dirname + '/linters/';


// Expose
Nlint.Linters = [];
Nlint.Linter = Linter;


// Predefined linters
[
	Linter.LINTER_DIR + 'jshint.js',
	Linter.LINTER_DIR + 'csslint.js',
	Linter.LINTER_DIR + 'jsonlint.js',

].forEach( Linter );
