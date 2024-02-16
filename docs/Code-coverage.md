# Code Coverage

Testing tools offer developers control over the quality of the products they release. Code coverage is **a testing metric** that can provide reliable information for verifying, scaling, and improving their application over time.

## Metrics
Common metrics include:

* Function coverage: how many of your defined functions have been called
* Statement coverage: the number of statements that have been successfully executed in your program
* Path coverage: how many paths of the control structures in your program (if statements or loops) have been executed
* Condition coverage: how many Boolean expressions have been validated inside your program
* Line coverage: how many lines of your program have been executed

## Best Practice
Best practice is to establish what percentage of coverage is acceptable for your project before releasing any new changes in production.

## Tools for coverage

Istanbul: The most famous JS tool for code coverage. Supporting unit tests, server-side functional tests, and browser tests. And it’s all for free!

Blanket: No more mantained.

jscoverage: Written purely in JavaScript, this free tool is an ideal companion for verifying code coverage both on the browser and server-side of your application.

https://about.codecov.io/blog/the-best-code-coverage-tools-by-programming-language/

## Install

    npm i nyc --save-dev

Add to package.json scripts:

    "test-with-coverage": "nyc --reporter=text --check-coverage --lines 50 --per-file mocha --recursive *.test.js"

Package.json should be:

    
  "scripts": {
    "test": "mocha --recursive --timeout 3000 test/*.test.js test/entity-rel/*.test.js",
    "test-with-coverage": "nyc --reporter=text --check-coverage --lines 50 --per-file mocha --recursive --timeout 3000 test/*.test.js test/entity-rel/*.test.js",
    "start": "node src/test.js"
  },

## How to use
Run for entire project:

    npm run test-with-coverage

Use: 
    npx nyc --reporter=text --check-coverage --lines 90 --per-file mocha test/entity-rel/compareHelper.test.js

Fail if the code coverage of at least one file is below 90%:

    nyc --check-coverage --lines 90 --per-file

    ~/Projects/normal (nyc) $ npx nyc --reporter=text --check-coverage --lines 90 --per-file mocha test/entity-rel/compareHelper.test.js

    CompareHelper test
        compareColumns method
        ✔ same record
        ✔ name differs

    2 passing (7ms)

    ERROR: Coverage for lines (16.12%) does not meet threshold (90%) for Projects\normal\src\orm\CompareHelper.js
    ------------------|---------|----------|---------|---------|-------------------
    File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
    ------------------|---------|----------|---------|---------|-------------------
    All files         |      16 |     7.31 |   10.52 |   16.12 | 
    CompareHelper.js  |      16 |     7.31 |   10.52 |   16.12 | 37-39,64-285     
    ------------------|---------|----------|---------|---------|-------------------


    https://stackoverflow.com/questions/16633246/code-coverage-with-mocha

### JS Coverage


https://github.com/fishbar/jscoverage
