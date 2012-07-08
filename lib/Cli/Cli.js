var Nodelint = global.Nodelint,
	argv = Nodelint.Depends.argv;

// Meta info
argv.version( 'v' + Nodelint.version )
	.info( "Usage: nlint [options] dir\n       nlint [options] file" );


// Interface
function Cli( args ) {
	args = argv.clear().option( Nodelint.Defaults.argv ).run( args );

	if ( ! args.targets.length ) {
		args.targets.push( process.cwd() );
	}

	Nodelint.render( args.targets, args.options );
}

Nodelint.Cli = Cli;
