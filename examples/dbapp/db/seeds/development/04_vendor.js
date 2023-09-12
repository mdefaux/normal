/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('vendor').del()
  await knex('vendor').insert([
    { name: "VendorX" },
    { name: "VendorY" },
    { name: "VendorZ" }
  ]);
};
