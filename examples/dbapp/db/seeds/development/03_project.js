/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('project_t').del()
  await knex('project_t').insert([
    {id: 1, name: 'Arance Attese', id_user: 1, start_date: '2023-01-23'},
    {id: 2, name: 'Bogus Bumpers', id_user: 2},
    {id: 3, name: 'Collision Core', id_user: 3, start_date: '2023-03-31'},
    {id: 4, name: 'American Alt', id_user: 1},
    {id: 5, name: 'Bingo Bawanga', id_user: 1},
  ]);
};
