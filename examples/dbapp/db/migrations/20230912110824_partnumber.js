/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("partnumber", function (table) {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.integer("vendor_id").unsigned().references("id").inTable("vendor").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("partnumber");
};
