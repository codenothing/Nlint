Nodelint.Precommit
==================

Nodelint has the ability to act like a pre-commit hook for supported version control systems. Currently it only supports
Git and SVN, but there are future plans to add in mercurial, bazaar, and any others that are requested(and doable).


GIT Pre-Commit
--------------

If you are using git, add the follwing line to your .git/hooks/pre-commit file

	node /path/to/Nodelint/index.js --Nodelint-pre-commit=git

Or, if you have installed Nodelint using npm, you can use the following

	Nodelint --Nodelint-pre-commit=git

This will run JSLint on all files that are going to be committed, and block the transaction if any errors
are found. If you want to lint your entire project on every commit, add the following instead.

	// Normal Installation
	node /path/to/Nodelint/index.js --Nodelint-pre-commit-all

	// NPM Installation
	Nodelint --Nodelint-pre-commit-all

Just remember to set your .lintignore file(s) to block linting of files you know will fail.  
  
If you have yet to create a pre-commit hook, just move the pre-commit.sample file to pre-commit, and remove
everything but the first line with the shebang telling what env to use.


SVN Pre-Commit
--------------

If you are using svn, add the following to your PATH_TO_REPOS/project/hooks/pre-commit file

	node /path/to/Nodelint/index.js --Nodelint-pre-commit=svn $(svnlook changed --transaction $2 $1 | cut -c8-)

Or, if you have installed Nodelint using npm, you can use the following

	Nodelint --Nodelint-pre-commit=svn $(svnlook changed --transaction $2 $1 | cut -c8-)

This will run JSLint on all files that are going to be committed, and block the transaction if any errors
are found. If you want to lint your entire project on every commit, add the following instead.

	// Normal Installation
	node /path/to/Nodelint/index.js --Nodelint-pre-commit-all

	// NPM Installation
	Nodelint --Nodelint-pre-commit-all

Just remember to set your .lintignore file(s) to block linting of files you know will fail.  
  
If you have yet to create a pre-commit hook, just move the pre-commit.tmpl file to pre-commit, and remove
everything but the first line with the shebang telling what env to use. Also, it will need to be executable.


Buffers
-------

If you run Nodelint on a large project that produces many errors, you may run into half finished report problem. This 
happens because node exits before it's buffers finish writing, and cause weirdness with the terminal. If you experience this,
just increase the buffer wait time, which is currently defaulted to 400 milliseconds.

	node /path/to/Nodelint/index.js --Nodelint-pre-commit=git -b 1500

The above will increase wait time to 1.5 seconds, a bit extreme, but will cover the time it takes for buffers to finish.


Recommendation
--------------

Download the Nodelint src, and add it as a tool to your project. Both svn and git set the current working directory to your repo root,
so if you put Nodelint in a path like "myproject/tools/Nodelint", and can use a variation of the above methods

	node tools/Nodelint.index.js --Nodelint-pre-commit=git

And now you and your team are all on the same page as to what errors have to be cleaned before they can be committed.
