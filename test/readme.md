# Unit Test

launch with:

    npm test

or with coverage:

    npm run test-with-coverage

Example output:

    
  CompareHelper test
    compareColumns method
      ✔ same record
      ✔ name differs
      ✔ field not found in destination
    compareChunk test
      ✔ template_test
    compare test
      ✔ compare test
    align test
      ✔ align test

  CompareSorted test
    ✔ compareSorted test
    ✔ compareSorted test, source with more records
    ✔ compareSorted test, dest with more records
    ✔ compareSorted test paging,  source with more record than dest
    ✔ compareSorted test paging,  dest with more record than source


  11 passing (26ms)

    ------------------|---------|----------|---------|---------|-----------------------------------------------
    File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
    ------------------|---------|----------|---------|---------|-----------------------------------------------
    All files         |   89.88 |    75.52 |   86.95 |   90.68 | 
    CompareHelper.js |   89.88 |    75.52 |   86.95 |   90.68 | 57-59,123,220-224,385-387,395,414,420,440,467
    ------------------|---------|----------|---------|---------|-----------------------------------------------

