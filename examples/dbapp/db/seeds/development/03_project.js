/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('project_t').del()
  await knex('project_t').insert([
    {id: 1, name: 'Arance Attese', id_user: 1},
    {id: 2, name: 'Bogus Bumpers', id_user: 2},
    {id: 3, name: 'Collision Core', id_user: 3},
    {id: 4, name: 'American Alt', id_user: 1},
  ]);
};
