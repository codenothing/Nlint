/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint;

Nodelint.Cli = function( options ) {
	// Extend predefined options
	Nodelint.extend( true, Nodelint.Options, options || {} );

	// Initial options
	var argv = Nodelint.ARGV( Nodelint.Options );

	// First check for help command
	if ( argv.options.help ) {
		Nodelint.Help( argv.targets[ 0 ] );
	}
	// Running cli module directly instead of through proxy script
	else if ( argv.options[ 'Nodelint-cli' ] || Nodelint.Options[ 'Nodelint-cli' ] ) {
		// Run based on the command line arguments
		Nodelint( argv.targets, argv.options, function( e, results ) {
			if ( e ) {
				Nodelint.error( e );
			}
			else {
				Nodelint.leave( results.count.errors.length ? 1 : 0, results.output );
			}
		});
	}
	// For precommits: jslinting entire project
	else if ( argv.options[ 'Nodelint-pre-commit' ] || Nodelint.Options[ 'Nodelint-pre-commit' ] ) {
		Nodelint.Precommit( argv.options[ 'Nodelint-pre-commit' ] || Nodelint.Options[ 'Nodelint-pre-commit' ] );
	}
	// For precommits: jslinting only changed files
	else if ( argv.options[ 'Nodelint-pre-commit-all'] || Nodelint.Options[ 'Nodelint-pre-commit-all'] ) {
		Nodelint.Precommit.All();
	}
};
