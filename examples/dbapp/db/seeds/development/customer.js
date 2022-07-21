const data = require('../../data.json');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('customer').del();
  await knex('customer').insert(
    data.slice(0,10)
  );
};
