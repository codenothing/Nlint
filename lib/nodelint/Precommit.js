/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = global.Nodelint,
	Color = Nodelint.Color,
	sys = require('sys'),
	spawn = require('child_process').spawn,
	rjs = /\.js$/;


// Running JSLint only on files that are being committed
Nodelint.Precommit = function( type ) {
	var argv = Nodelint.ARGV();

	// Merge the cli options onto the base options
	Nodelint.extend( true, Nodelint.Options, argv.options );

	// Run the precommit hook
	if ( typeof Nodelint.Precommit[ type ] == 'function' ) {
		Nodelint.Precommit[ type ]();
	}
	else {
		sys.error( Color.boldred( "Nodelint doesn't support pre-commit hook for " + type ) );
		process.exit( 1 );
	}
};


// Add various version control handlers
Nodelint.extend( Nodelint.Precommit, {

	// Git has a special diff command to get the list of files to be committed
	git: function(){
		var git = spawn( 'git', [ 'diff', '--cached', '--name-only', '--diff-filter=ACM' ] ),
			data = { stdout: '', stderr: '' },
			real = [];

		// Read in the response
		Nodelint.each( data, function( val, key ) {
			git[ key ].on( 'data', function( str ) {
				data[ key ] += str;
			});
		});

		// Run JSlint on changed file real
		git.on( 'exit', function( e ) {
			if ( e || data.stderr.length ) {
				sys.puts( Color.boldred( e || data.stderr ) );
				process.exit( 1 );
			}

			data.stdout.trim().split("\n").forEach(function( file ) {
				if ( rjs.exec( ( file || '' ).trim() ) ) {
					real.push( file );
				}
			});

			// Exit gracefully if no files are to be linted
			if ( real.length ) {
				Nodelint( real, Nodelint.Precommit.Results );
			}
			else {
				process.exit( 0 );
			}
		});
	},

	// SVN has to be used in conjunction with svnlook, of which the changed
	// files are passed in as cli arguments
	svn: function(){
		var Files = Nodelint.ARGV(), real = [];

		Files.forEach(function( file ) {
			if ( rjs.exec( ( file || '' ).trim() ) ) {
				real.push( file );
			}
		});

		// Exit gracefully if no files are to be linted
		if ( real.length ) {
			Nodelint( real, Nodelint.Precommit.Results );
		}
		else {
			process.exit( 0 );
		}
	},

	// Running JSLint on the entire project (or dirs/files specified)
	All: function(){
		var argv = Nodelint.ARGV();

		// Merge the cli options onto the base options
		Nodelint.extend( true, Nodelint.Options, argv.options );

		// If no paths were passed, then assume the whole project needs to be linted
		if ( ! argv.files.length ) {
			argv.files = [ process.cwd() ];
		}

		// Run JSLint
		Nodelint( argv.files, Nodelint.Precommit.Results );
	},

	// Handling response from all pre-commit methods
	Results: function( e, results ) {
		if ( e ) {
			sys.error( Color.boldred( e.message || e ) );
			process.exit( 1 );
		}
		else if ( results.errors.length ) {
			// Output as error
			sys.error( results.stderr );

			// Terrible hack to make sure buffers flush 
			setTimeout(function(){
				process.exit( 1 );
			}, Nodelint.Options.nodelint[ 'buffer-wait' ] );
		}
		else {
			process.exit( 0 );
		}
	}

});
