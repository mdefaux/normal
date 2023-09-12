/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('partnumber').del()
  await knex('partnumber').insert([
    { name: "PN001", vendor_id: 1 },
    { name: "PN002", vendor_id: 2 },
    { name: "PN003", vendor_id: 1 },
    { name: "PN004", vendor_id: 3 },
    { name: "PN005", vendor_id: 2 }
  ]);
};
