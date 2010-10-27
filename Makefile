#
# Nodelint [VERSION]
# [DATE]
# A fork of tav's nodelint (http://github.com/tav/nodelint)
# Corey Hart @ http://www.codenothing.com
#
SH = sh
NODE = node
.PHONY: all test clean


test:
	@$(NODE) cli.js -vpw .
