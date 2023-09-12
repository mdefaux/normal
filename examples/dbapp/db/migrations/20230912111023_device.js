/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("device", function (table) {
        table.increments("id").primary();
        table.string("serialnumber").notNullable();
        table.string("ip_address");
        table.string("hostname");
        table.integer("site_id").unsigned().references("id").inTable("site").onDelete("CASCADE");
        table.integer("partnumber_id").unsigned().references("id").inTable("partnumber").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("device");
};
