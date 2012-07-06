var Nodelint = global.Nodelint,
	Slice = Array.prototype.slice,
	colors = {
		'bold' : [1, 22],
		'italic' : [3, 23],
		'underline' : [4, 24],
		'inverse' : [7, 27],
		'white' : [37, 39],
		'gray' : [90, 39],
		'black' : [30, 39],
		'blue' : [34, 39],
		'cyan' : [36, 39],
		'green' : [32, 39],
		'magenta' : [35, 39],
		'red' : [31, 39],
		'yellow' : [33, 39]
	};

// Root logger
function Color(){
	var args = Slice.call( arguments ), color, message;

	// The first argument belongs to the color code,
	if ( Nodelint.isArray( args[ 0 ] ) ) {
		color = args.shift();
	}

	// Combine args into single message string
	// TODO: use inspection
	message = args.join( ' ' );

	// Print out colored log if passed
	if ( Nodelint.isArray( color ) ) {
		return "\033[" + color[ 0 ] + "m" + message + "\033[" + color[ 1 ] + "m";
	}
	else {
		return message;
	}
}


// Create shortcut functions for each color code
Color.get = {};
Nodelint.each( colors, function( value, name ) {
	Color.get[ name ] = function(){
		var args = Slice.call( arguments );
		args.unshift( value );
		return Color.apply( this, args );
	};

	Color[ name ] = function(){
		console.log( Color.get[ name ].apply( Color.get, arguments ) );
	};
});

// Plain output
Color.plain = Color[ 'default' ] = function(){
	console.log.apply( console.log, Slice.call( arguments ) );
};


// Expose color
Color.colors = colors;
Nodelint.Color = Color;
