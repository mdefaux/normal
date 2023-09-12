/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('project').del()
  await knex('project').insert([
    { name: "Project 1 for Customer A", customer_id: 1 },
    { name: "Project 1 for Customer B", customer_id: 2 },
    { name: "Project 2 for Customer A", customer_id: 1 }
  ]);
};
