#
# Nodelint [VERSION]
# [DATE]
# A fork of tav's nodelint (http://github.com/tav/nodelint)
# Corey Hart @ http://www.codenothing.com
#
.PHONY: all test clean


all:
	@node build/build.js

install:
	@node build/install.js

test: test-add test-use-jslint test-use-jsonlint
	@node build/test.js

test-use-jslint:
	@node build/test-use.js jslint

test-use-jsonlint:
	@node build/test-use.js jsonlint

test-add:
	@node build/test-add.js
