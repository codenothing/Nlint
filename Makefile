SH = sh
NODE = node
.PHONY: all test clean


test:
	@$(NODE) autorun.js .
