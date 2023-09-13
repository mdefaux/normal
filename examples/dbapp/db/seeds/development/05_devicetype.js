/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('devicetype').del()
  await knex('devicetype').insert([
    { type: "TypeA" },
    { type: "TypeB" },
    { type: "TypeC" }
  ]);
};
