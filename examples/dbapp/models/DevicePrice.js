var store = require( './store' );

const DevicePrice = store.entity( 'DevicePrice', (model) => {
    model.source( 'device' );
    model.string( 'serial_number' );
    model.label( 'serial_number' );
    model.string("ip_address");
  //  model.objectLink( Partnumber ).source( 'partnumber_id' );
  //  model.objectLink( Partnumber ).source( 'device_model_id' );

    model.number("sell_price");
    model.number("buy_price");

    model.number("earnings").calc((tablename) => 
  `  ${tablename}.sell_price - ${tablename}.buy_price  `
    );
} );


module.exports = DevicePrice;