global.MUnit = require( 'MUnit' );
global.Nodelint = require( '../' );

// Defaults
MUnit.extend( MUnit.Defaults.Settings, {
	stopOnFail: true,
	timeout: 5000
});

// Render all tests
MUnit.render( __dirname + '/../test/' );
