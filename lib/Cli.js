var Nlint = global.Nlint,
	argv = require( 'argv' );

// Meta info


// Interface
function Cli( args ) {
	args = argv.clear()
		.version( 'v' + Nlint.version )
		.info( "Usage: nlint [options] dir\n       nlint [options] file" )
		.option( Nlint.Defaults.argv )
		.run( args );

	if ( ! args.targets.length ) {
		args.targets.push( process.cwd() );
	}

	Nlint.render( args.targets, args.options );
}

Nlint.Cli = Cli;
