const store = require("../models/store");

const Vendor = store.entity( 'Vendor', (model) => {
    model.source( 'vendor' );
    model.string( 'name' );
    model.label( 'name' );
} );
const Partnumber = store.entity( 'Partnumber', (model) => {
    model.source( 'partnumber' );
    // model.string( 'name' );
    // model.label( 'name' );
    model.string("part_number");
    model.label("part_number");
    
    model.string( 'description' );
    model.string('vendor');
    model.objectLink( Vendor ).source( 'vendor_id' ).rename("vendor_foreign");
} );
const Device = store.entity( 'Device', (model) => {
    model.source( 'device' );
    model.string( 'serial_number' );
    model.label( 'serial_number' );
    model.string("ip_address");
  //  model.objectLink( Partnumber ).source( 'partnumber_id' );
    model.objectLink( Partnumber ).source( 'device_model_id' );

    model.number("sell_price");
    model.number("buy_price");

    model.number("earnings").calc((tablename) => 
    `${tablename}.sell_price - ${tablename}.buy_price`
    );
} );

module.exports = {
    Vendor: Vendor,
    Partnumber: Partnumber,
    Device: Device
}
