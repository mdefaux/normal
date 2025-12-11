/**Adds a project_user table to link users and projects in a many-to-many relationship
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
    return knex.schema.createTable('project_user', function(table) {
        table.increments('id').primary();
        table.integer('project_id').unsigned().notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('project_id').references('id').inTable('project_t').onDelete('CASCADE');
        table.foreign('user_id').references('id').inTable('user_t').onDelete('CASCADE');
        
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
    return knex.schema.dropTable('project_user');
};
