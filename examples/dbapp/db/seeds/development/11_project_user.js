/** Adds seeding data for project_user table
 *  @param { import("knex").Knex } knex
 *  @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('project_user').del();
    // Inserts seed entries
    await knex('project_user').insert([
        {id: 1, project_id: 1, user_id: 1},
        {id: 2, project_id: 1, user_id: 2},
        {id: 3, project_id: 2, user_id: 1},
        {id: 4, project_id: 3, user_id: 3},
    ]);
}
