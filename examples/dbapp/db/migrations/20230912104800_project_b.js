exports.up = function(knex) {
  return knex.schema.createTable("project", function(table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("customer_id").unsigned().references("id").inTable("customer").onDelete("CASCADE");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("project");
};
