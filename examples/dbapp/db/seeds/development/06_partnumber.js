/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('partnumber').del()
  await knex('partnumber').insert([
    { name: "PN001", description: "Part A", type_id: 1, vendor_id: 1 },
    { name: "PN002", description: "Part B", type_id: 2, vendor_id: 2 },
    { name: "PN003", description: "Part C", type_id: 1, vendor_id: 1 },
    { name: "PN004", description: "Part D", type_id: 3, vendor_id: 3 },
    { name: "PN005", description: "Part E", type_id: 2, vendor_id: 2 }
  ]);
};
