var Nodelint = global.Nodelint,
	separator = "\n------------------------------------\n";

function Render( dir, options ) {
	var self = this;

	if ( ! ( self instanceof Render ) ) {
		return new Render( dir, options );
	}

	self.lint = new Nodelint( dir, options, self.finished.bind( self ) );
	self.lint.on( 'output', console.log.bind( console ) );
}

Render.prototype = {

	finished: function( e ) {
		var self = this;

		if ( e ) {
			Nodelint.Color.red( "\n\nFatal Error\n" );
			console.error( e );
			if ( e.stack ) {
				console.error( e.stack );
			}

			process.exit( 1 );
			return;
		}

		self.passed();
		self.warnings();
		self.errors();
		self.totals();
	},

	warnings: function(){
		var self = this;

		if ( ! self.lint.warnings.length ) {
			return;
		}

		self.lint.warnings.forEach(function( warn ) {
			self.hasWarning = true;
			console.log( separator );
			Nodelint.Color.yellow( '[WARNING] ' + warn.path );
			console.log( 'Line: ' + warn.line );
			console.log( 'Character: ' + warn.character );
			console.log( warn.message );

			if ( warn.evidence ) {
				console.log( warn.evidence );
			}
		});
	},

	errors: function(){
		var self = this;

		if ( ! self.lint.errors.length ) {
			return;
		}

		self.lint.errors.forEach(function( error ) {
			self.hasError = true;
			console.log( separator );
			Nodelint.Color.red( '[ERROR] ' + error.path );
			console.log( 'Line: ' + error.line );
			console.log( 'Character: ' + error.character );
			console.log( error.message );

			if ( error.evidence ) {
				console.log( error.evidence );
			}
		});
	},

	passed: function(){
		var self = this;

		if ( ! self.lint.passed.length ) {
			return;
		}

		self.lint.passed.forEach(function( file ) {
			Nodelint.Color.green( 'Passed ' + file );
		});
	},

	totals: function(){
		var self = this,

			output = [
				'Total Files: ' + self.lint.fileCount,
				'Total Errors: ' + self.lint.errors.length,
				'Total Warnings: ' + self.lint.warnings.length
			].join( "\n" ),

			color = self.hasError ? 'red' :
				self.hasWarning ? 'yellow' :
				'green';

		console.log( separator );
		Nodelint.Color[ color ]( "\n\n" + output + "\n\n" );
	}

};


Nodelint.render = Render;
