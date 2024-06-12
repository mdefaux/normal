# Align Case Study

This folder contains a case study for align procedure: an external data source (a json file) is aligned with data on DB.
Two entity are involved:
* CustomerSource: reads the source data from the json
* Customer: entity for the db data

Aligner helper reads the table Flow throught Flow entity and runs a job by name

Logger is an implementation of ILogger that writes on Log table the message coming from align procedure.



## Files

|       |      |
|-------|------|
| `Aligner.js` | Helper procedure that read flow table and launch `compareHelper.align( ... ) ` |
| `Customer.data.json` | json file with 1000 sample row for the Customer table |
| `Customer.js` | Customer entity, that specifies to load data from json file  |

