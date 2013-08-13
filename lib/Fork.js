var Nlint = global.Nlint = require( '../' ),
	Slice = Array.prototype.slice,
	linter;

process.on( 'message', function( message ) {
	var linter;

	if ( message.linter && message.path ) {
		linter = Nlint.Linter( message.linter );

		// Ensure linter exists
		if ( ! linter ) {
			throw new Error( "No linter loaded at path [" + message.linter + "]" );
		}

		// Run lint job
		linter.render( message.path, message.settings, function(){
			process.send({
				id: message.id,
				args: Slice.call( arguments )
			});
		});
	}
	else {
		console.error( message );
		throw new Error( "Unknown Fork Message" );
	}
});
