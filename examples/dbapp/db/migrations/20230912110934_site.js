/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("site", function (table) {
        table.increments("id").primary();
        table.string("address").notNullable();
        table.integer("project_id").unsigned().references("id").inTable("project").onDelete("CASCADE");
        table.integer("customer_id").unsigned().references("id").inTable("customer").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("site");
};
