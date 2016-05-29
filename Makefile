test:
	env PORT="7697" @NODE_ENV=test ./node_modules/.bin/mocha --reporter spec tests/*.js

test-cover:
	istanbul cover _mocha tests/* --report lcovonly -- -R spec \
	&& cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js \
	&& rm -rf ./coverage

.PHONY: test
