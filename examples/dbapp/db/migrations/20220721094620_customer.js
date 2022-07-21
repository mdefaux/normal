/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable( 'customer', (table) => {
        table.increments( 'id' ),
        table.string( 'name' );
        table.string( 'address' );
        table.string( 'email' );
        table.string( 'reference' );
        table.string( 'telephone' );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

    return knex.schema.dropTable( 'customer' );
};
