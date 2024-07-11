
const data = require('../../data/site.json');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('site').del()
  await knex('site').insert( data );
};
