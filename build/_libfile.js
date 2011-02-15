/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = require('#{path}'), config = #{config};
Nodelint.extend( true, Nodelint.Options, config, global._NodelintOptions || {} ) );
module.exports = Nodelint;
