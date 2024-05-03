/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
    return knex.schema.createTable("log", function(table) {
        table.increments(),
        table.string("severity", 1).defaultTo("I"), // I=Info, W=Warning, E=Error, C=Critical
        table.text("what").notNullable(),           // what
        table.integer("id_user"),                   // 
        table.timestamp("log_date").defaultTo(knex.fn.now()),
        table.string("activity_type");              // the name of the procedure/module
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
    return knex.schema.dropTableIfExists("log");
};
