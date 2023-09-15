const store = require("../models/store");

const Vendor = store.entity( 'Vendor', (model) => {
    model.source( 'vendor' );
    model.string( 'name' );
    model.label( 'name' );
} );
const Partnumber = store.entity( 'Partnumber', (model) => {
    model.source( 'partnumber' );
    model.string( 'name' );
    model.label( 'name' );
    model.string( 'description' );
    model.objectLink( Vendor ).source( 'vendor_id' );
} );
const Device = store.entity( 'Device', (model) => {
    model.source( 'device' );
    model.string( 'serialnumber' );
    model.label( 'serialnumber' );
    model.objectLink( Partnumber ).source( 'partnumber_id' );
} );

module.exports = {
    Vendor: Vendor,
    Partnumber: Partnumber,
    Device: Device
}
