var Nodelint = global.Nodelint;

function Cli( args ) {
	var argv = Nodelint.Cli.ARGV( Nodelint.Defaults.argv, args || process.argv.slice( 2 ) );

	if ( ! argv.targets.length ) {
		argv.targets.push( process.cwd() );
	}

	Nodelint.render( argv.targets, argv.args );
}

Nodelint.Cli = Cli;
