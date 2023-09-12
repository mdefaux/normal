/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('site').del()
  await knex('site').insert([
    { name: "Site 1 for Project 1", project_id: 1 },
    { name: "Site 1 for Project 1", project_id: 2 },
    { name: "Site 2 for Project 1", project_id: 1 },
    { name: "Site 1 for Project 2", project_id: 3 }
  ]);
};
