Nodelint(1) -- JSLint with Node
===============================

Nodelint is a tool that runs designated files through the JSLint parser to check for
syntax errors. It can be used on the command line, as a pre-commit hook, or incorporated
into your build process.

## Usage

Nodelint \[options] file.js [file2.js dir dir2]

## Options


### -l [FILE], --logfile=[FILE]

Define a logfile to output results to.

### -j FILE, --jslint=FILE

Define a custom jslint file to use.

### -b TIME, --buffer-wait=TIME

Define the number of milliseconds to wait for buffer output to finish before killing the process. Usefull for pre-commit hooks

### -v, --verbose

Verbose mode. Outputs processing information like what directory is currently being read, or what file is currently being linted.
