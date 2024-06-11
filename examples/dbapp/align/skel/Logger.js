/** Something that logs...
  * 
  * logger.info()
  * logger.warn()
  * logger.error()
  * logger.critical()
  * 
  */

const {ILogger} = require( 'normaly' );
const Log = require( '../../models/Log' );

const severities = [ 'I', 'W', 'E', 'C' ];

class Logger extends ILogger {

    constructor() {
        this.logLevel = 0;
        this.highestSeverityLevel = 0;
    }

    /**Sets the logging level
     * 
     * @param {String} logLevel a value among 'I', 'W', 'E', 'C'
     */
    setLogLevel( logLevel ) {
        this.logLevel = this.getLevel( logLevel );
    }

    getLevel( charLevel ) {
        const lev = severities.indexOf( charLevel?.toUpperCase() );
        if ( lev === -1 ) {
            throw new Error( `Unknown level '${charLevel}'.`);
        }
        return lev;
    }

    getHighestSeverityLevel() {
        return severities[ this.highestSeverityLevel ];
    }

    log( message, logLevel=0 ) {

        const logLevelIndex = this.getLevel( logLevel );

        if ( this.highestSeverityLevel < logLevelIndex ) {
            this.highestSeverityLevel = logLevelIndex;
        }

        if ( logLevelIndex < this.logLevel ) {

            return;
        }
        
        return Log.insert( {
            severity: severities[ logLevel ],
            what: message,
            // TODO: sets activity type
            activity_type: `align-customer`
        } );
    }
    

    info(message) {
        this.log(message, 'I');
    }
    warn(message) {
        this.log(message, 'W');
    }
    error(message) {
        this.log(message, 'E');
    }
    critical(message) {
        this.log(message, 'C');
    }
}

module.exports = Logger;
