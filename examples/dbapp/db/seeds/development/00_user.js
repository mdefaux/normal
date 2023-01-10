/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('user_t').del()
  await knex('user_t').insert([
    {id: 1, name: 'Aaron Arancioni', domain_name: 'aarancioni', email: 'aa@foo.it', telephone: '+39-11111-111' },
    {id: 2, name: 'Bill Bianchi', domain_name: 'bbianchi', email: 'bb@foo.it'},
    {id: 3, name: 'Chen Ciani', domain_name: 'cciani', email: 'cc@foo.it', telephone: '+39-11111-222'}
  ]);
};
