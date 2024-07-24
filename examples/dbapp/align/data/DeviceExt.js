/**Setups askeleton Entity that takes data form a json file
 * 
 */
var store = require( './store' );
const data = require('./device.ext.json');

// sets a data storage named as desiderd table
const dataStorage = store.data( "device", data ); 

// setups an entity that has storage set to point to "Device" data
const DeviceExt = store.entity( 'DeviceExt', (model) => {

    model.source( 'device' );

    model.string( 'serial_number' );
    model.label( 'serial_number' );
    model.string( 'ip_address' );
    model.string( 'device_model_id' );
    model.string( 'site_id' );
    model.string( 'customer_id' );

    // tells model that data is taken from dataStorage previously declared
    model.storageData( dataStorage );
} );

module.exports = DeviceExt;
