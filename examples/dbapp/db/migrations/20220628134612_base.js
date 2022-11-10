/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable( 'user_t', (table) => {
      table.increments( 'id' ),
      table.string( 'name' );
      table.string( 'domain_name' );
      table.string( 'email' );
      table.string( 'telephone' );
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
  return knex.schema.dropTable( 'user_t' );
};
