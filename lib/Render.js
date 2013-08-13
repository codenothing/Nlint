var Nlint = global.Nlint,
	separator = "\n------------------------------------\n";

function Render( dir, options ) {
	var self = this;

	if ( ! ( self instanceof Render ) ) {
		return new Render( dir, options );
	}

	self.start = Date.now();
	self.lint = new Nlint( dir, options, self.finished.bind( self ) );
	self.lint.on( 'progress', self._progress.bind( self ) );
}

Render.prototype = {

	_progress: function( file ) {
		file = file ? "Completed " + file : "";

		// Setup
		var self = this,
			count = self.lint.fileComplete,
			total = self.lint.fileCount,
			perc = parseInt( count / total * 100, 10 ),
			max = process.stdout.columns,
			string = "\rRendering... " + perc + "%[" + count + "/" + total + "] ",
			fileLength = ( string + ( file || '' ) ).length,
			padding = "";

		// Add file path if there is enough space
		if ( fileLength < max ) {
			string += file || '';
		}

		// Add any extra padding required to fill out the rest of the row
		if ( string.length < max ) {
			string += ( new Array( max - string.length ) ).join( " " );
		}

		process.stdout.write( string );
	},

	finished: function( e ) {
		var self = this,
			passed = false,
			warn = false,
			error = false;

		// Add final progress marker to clear out the file completed ticker
		self._progress();

		// Skip past progress bar
		console.log( "\n" );

		if ( e ) {
			Nlint.Color.red( "\n\nFatal Error\n" );
			console.error( e );
			if ( e.stack ) {
				console.error( e.stack );
			}

			process.exit( 1 );
			return;
		}

		// Prints out nodelint files used, and ignored paths
		self.meta();

		// Tally up results
		self.lint.results.forEach(function( result ) {
			passed = result.passed || passed;
			warn = result.warnings.length > 0 || warn;
			error = result.errors.length > 0 || error;
		});

		// Passed results
		if ( passed ) {
			self.passed();
		}

		// Warnings
		if ( warn ) {
			self.warnings();
		}

		// Errors
		if ( error ) {
			self.errors();
		}

		// Final totals
		self.totals();

		// Exiting with error when they are found
		if ( error ) {
			process.exit( 1 );
		}
	},

	meta: function(){
		var self = this;

		self.lint.nodelints.forEach(function( path ) {
			console.log( 'Using Nlint File ' + path );
		});

		self.lint.ignored.forEach(function( path ) {
			Nlint.Color.yellow( "Ignored " + path );
		});
	},

	passed: function(){
		var self = this;

		self.lint.results.forEach(function( result ) {
			if ( ! result.passed ) {
				return;
			}

			var times = "";
			result.times.forEach(function( time ) {
				if ( times.length ) {
					times += ", ";
				}
				times += time.name + " [Read: " + ( time.read - time.start ) + "ms,Lint: " + ( time.lint - time.start ) + "ms]";
			});
			Nlint.Color.green( "Passed " + result.path + "\n\t" + times );
		});
	},

	warnings: function(){
		var self = this;

		self.lint.results.forEach(function( result ) {
			if ( ! result.warnings.length ) {
				return;
			}

			result.warnings.reverse().forEach(function( warn ) {
				console.log( separator );
				Nlint.Color.yellow( '[WARNING] ' + result.path );
				console.log( 'Line: ' + warn.line );
				console.log( 'Character: ' + warn.character );
				console.log( warn.message );

				if ( warn.evidence ) {
					console.log( warn.evidence );
				}
			});
		});
	},

	errors: function(){
		var self = this;

		self.lint.results.forEach(function( result ) {
			if ( ! result.errors.length ) {
				return;
			}

			result.errors.reverse().forEach(function( error ) {
				console.log( separator );
				Nlint.Color.red( '[ERROR] ' + result.path );
				console.log( 'Line: ' + error.line );
				console.log( 'Character: ' + error.character );
				console.log( error.message );

				if ( error.evidence ) {
					console.log( error.evidence );
				}
			});
		});
	},

	totals: function(){
		var self = this,
			errors = 0,
			warnings = 0,
			output = "Total Files: " + self.lint.fileCount + "\n",
			color;

		// Tally up the totals
		self.lint.results.forEach(function( result ) {
			errors += result.errors.length;
			warnings += result.warnings.length;
		});

		// Add tallys
		output += [
			"Total Errors: " + errors,
			"Total Warnings: " + warnings,
			"Time: " + ( Date.now() - self.start ) + "ms"
		].join( "\n" );

		// Final Overall Color
		color = errors > 0 ? 'red' :
			warnings > 0 ? 'yellow' :
			'green';

		// Print final
		console.log( separator );
		Nlint.Color[ color ]( "\n\n" + output + "\n\n" );
	}

};


Nlint.render = Render;
