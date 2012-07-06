var Nodelint = global.Nodelint,
	Slice = Array.prototype.slice;

// Tracking Constructor
function Tracking( name, options, callback ) {
	var self = this, i;

	// Force Tracking Instance
	if ( ! ( self instanceof Tracking ) ) {
		return new Tracking( name, options, callback );
	}

	// Allow for no options
	if ( callback === undefined ) {
		callback = options;
		options = {};
	}

	// Instance vars
	options = options || {};
	self.name = name || 'Unnamed Tracker';
	self.callback = callback || Nodelint.noop;
	self.timeout = options.timeout || -1;
	self.markers = options.markers || {};
	self.hold = true;
	self.fin = false;
	self.errord = false;
	self.results = {};
	self._guid = 0;

	// Mark the results for any markers that are already finished
	for ( i in self.markers ) {
		if ( self.markers.hasOwnProperty( i ) && self.markers[ i ] === true ) {
			self.results[ i ] = true;
		}
	}

	// Start the time
	if ( options.autostart ) {
		self.start();
	}
}


Tracking.prototype = {

	// Generic Id generator
	guid: function(){
		var self = this;

		return "Tracking_" + self.name + "_" + ( ++self._guid );
	},

	// Can mark a method as started, or pass in the result
	mark: function( name, result ) {
		var self = this, args = Slice.call( arguments );

		// Allow for custom id generation
		if ( args.length === 0 ) {
			var guid = self.guid();
			self.markers[ guid ] = false;
			return guid;
		}
		else if ( args.length === 1 ) {
			self.markers[ name ] = false;
		}
		else {
			self.markers[ name ] = true;
			self.results[ name ] = result;
			self.check();
		}
	},

	// Remove mark from the list
	unmark: function( name ) {
		var self = this;

		if ( self.markers.hasOwnProperty( name ) ) {
			delete self.markers[ name ];
		}

		if ( self.results.hasOwnProperty( name ) ) {
			delete self.results[ name ];
		}

		// After removing a mark, check to see if all markings are complete
		self.check();
	},

	// Triggers the callback if all marks are complete
	check: function(){
		var self = this, i;

		// Don't rerun if already finished
		if ( self.fin ) {
			return true;
		}
		// Check to make sure there have been no errors/holds
		else if ( self.hold || self.errord ) {
			return false;
		}

		// Check all the markers
		for ( i in self.markers ) {
			if ( self.markers[ i ] === false ) {
				return false;
			}
		}

		// Clear any timer
		if ( self.timeid ) {
			self.timeid = clearTimeout( self.timeid );
		}

		// Inform the creator
		self.callback( null, self.results, self );
		self.callback = Nodelint.noop;

		// Expose passed check
		return ( self.fin = true );
	},

	// Force an error to the callback
	error: function( e ) {
		var self = this;

		if ( e && ! self.fin && ! self.hold ) {
			self.stop();
			self.errord = true;
			self.callback( e, null, self );
			self.callback = Nodelint.noop;
			return e;
		}
		else {
			return false;
		}
	},

	// Checks to see if marks are finished
	isFinished: function( marks ) {
		var self = this, i;

		// Marks are all there
		if ( Nodelint.isString( marks ) ) {
			marks = [ marks ];
		}

		// Check each mark
		i = marks.length;
		while ( i-- ) {
			if ( ! self.markers[ marks[ i ] ] ) {
				return false;
			}
		}

		return true;
	},

	// Force finish the tracking
	finish: function( mark, result ) {
		var self = this, args = Slice.call( arguments );

		if ( args.length == 2 ) {
			self.mark( mark, result );
		}

		self.stop();
		self.fin = true;
		self.callback( null, self.results, self );
		self.callback = Nodelint.noop;
	},

	// Kill the countdown timer
	stop: function(){
		var self = this;

		self.hold = true;
		if ( self.timeid ) {
			self.timeid = clearTimeout( self.timeid );
		}
	},

	// Start the countdown
	start: function(){
		var self = this;

		// Hold checks
		self.hold = false;

		// Make sure we have a timelimit set
		if ( ! self.check() && self.timeout > -1 ) {
			self.timeid = setTimeout(function(){
				self.error( self.name + " Tracking Timeout" );
			}, self.timeout );
		}
	}

};

// Tracking module
Nodelint.Tracking = Tracking;
