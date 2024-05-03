

/**Flow table stores information 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
    return knex.schema.createTable("flow", function(table) {
        table.increments(),
        table.string("name").notNullable(),                // name of the flow
        table.string("severity_status", 1).defaultTo("I"), // I=Info, W=Warning, E=Error, C=Critical
        table.text("message"),
        table.integer("updated_rows"),                     // 
        table.integer("inserted_rows"),                    // 
        table.integer("deleted_rows"),                     // 
        // table.integer("rows_processed"),
        table.integer("rows_in_warning"),
        table.integer("threshold_insert"),                 // 
        table.integer("threshold_delete"),                 // 
        table.string("logging_level", 1).defaultTo("E"),   // I=Info, W=Warning, E=Error, C=Critical

        table.timestamp("last_exec").defaultTo(knex.fn.now()),
        table.timestamp("next_exec")

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
    return knex.schema.dropTableIfExists("flow");
};
