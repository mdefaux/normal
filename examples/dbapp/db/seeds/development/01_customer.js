const data = require('../../data/customer.json');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('customer').del();
  await knex('customer').insert(
    data
  );
};
