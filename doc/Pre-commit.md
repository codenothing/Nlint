GIT Pre-Commit
--------------

If you are using git, add the follwing line to your .git/hooks/pre-commit file

	node /path/to/Nodelint/index.js --Nodelint-pre-commit .

or if you added the .Nodelint.js shortcut to your home directory

	node ~/.Nodelint.js --Nodelint-pre-commit .

This will send your entire project through JSLINT, and block the commit if any errors arise. Which also means
you will need to have .lintignore file(s) to block linting of files that you know will fail.  
  
If you have yet to create a pre-commit hook, just convert the pre-commit.sample file to pre-commit, and remove
everything but the first line with the shebang telling what env to use.


SVN Pre-Commit
--------------

SVN is very simliar to git, just differen't paths. You will need to add the following line to your PATH_TO_REPOS/project/hooks/pre-commit file

	node /path/to/Nodelint/index.js --Nodelint-pre-commit .

or if you added the .Nodelint.js shortcut to your home directory

	node ~/.Nodelint.js --Nodelint-pre-commit .

This will run your svn project through JSLINT, and block the commit if errors are found. Don't forget to have your .lintignore file(s) setup
if you know that one isn't going to pass.
  
If you have yet to create a pre-commit hook, just convert the pre-commit.tmpl file to pre-commit, and remove
everything but the first line with the shebang telling what env to use. Also, it will need to be executable.


Recommendation
--------------

Download the Nodelint src, and add it as a tool to your project. Both svn and git set the current working directory to your repo root,
so if you put Nodelint in a path like "myproject/tools/Nodelint", you can add the following which will work the same for everyone.

	node tools/Nodelint.index.js --Nodelint-pre-commit .

And now you and your team are all on the same page as to what errors have to be cleaned before they can be committed.
