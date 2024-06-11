/**
 * 
 */

class ILogger {

    info(message) {
     //   console.log(message);
    }
    warn(message) {
      //  console.warn(message);
    }
    error(message) {
     //   console.error(message);
    }
    critical(message) {
      //  console.error(message);
    }
}

exports.ILogger = ILogger;
// TODO: change into
// module.exports = ILogger;
