/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
    return knex.schema.createTable( 'project_t', (table) => {
        table.increments( 'id' ),
        table.string( 'name' );
        table.string( 'description' );
        table.integer( 'id_user' ).unsigned()
            .references( "id" ).inTable( "user_t" )
            .onDelete( "SET NULL" ).onUpdate( "CASCADE" );
        table.integer( 'id_customer' ).unsigned()
            .references( "id" ).inTable( "customer" )
            .onDelete( "SET NULL" ).onUpdate( "CASCADE" );
        
        table.date('start_date');  // description
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
    return knex.schema.dropTable( 'project_t' );
};
