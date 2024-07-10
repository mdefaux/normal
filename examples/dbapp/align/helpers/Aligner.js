/** Helper procedure that read flow table and launch
  * compareHelper.align( ... ) 
  * - configure buffers size
  * - setup log level
  * - logs procedure finish status
  * 
  */
const Logger = require( './Logger' );
const Flow = require( '../../models/Flow' );

const Aligner = {
    
    /**Runs a flow defined in Flow db table.
     * 
     * @param {*} flowName 
     */
    async run(flowName) {

        try {
            // reads log level from Flow table
            const flowdata = await Flow.select()
                .where(Flow.name.equals(flowName))
                .exec();

            // TODO: handle flow not found -> throws an exception

            const logLevel = flowdata[0].logging_level;
            const logger = new Logger();
            // TODO: checks if loglevel is 'I', 'W', 'E', 'C'
            logger.setLogLevel(logLevel);
            // TODO: sets activity type in Logger (field activity_type in Log table)

            // TODO: handle Flow misconfiguration

            logger.info(`Starting flow '${flowName}'`);

            // TODO: handle exceptions

            // TODO: initialize buffer

            let result = await compareHelper.align( /* TODO */);

            // TODO: compose message
            const message = `Updated , Inserted: , Deleted: ${buffer.deletedCount}`;

            // TODO: write message if there were exceptions

            // TODO: write in flow table even there were exceptions
            await Flow.update(flowdata[0].id, {
                message: message,
                last_exec: new Date(),
                // TODO: verifiy buffer and align result
                updated_rows: buffer.deletedCount,
                inserted_rows: buffer.deletedCount,
                deleted_rows: buffer.deletedCount,
                // TODO: buffer or result ?
                rows_in_warning: buffer.rows_in_warning, // ??????
                severity_status: logger.getHighestSeverityLevel(),
            })

            // TODO: logs only if no exception
            logger.info(`Flow '${flowName}' finished. Result: ${message}`);

            // TODO: logs a critical if there were exception
            // whats happen when no flow is found?
        }
        catch (e) {
            console.error( e.message );
        }
    }
}

module.exports = Aligner;
