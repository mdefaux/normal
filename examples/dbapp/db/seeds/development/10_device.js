
const data = require('../../data/device.json');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('device').del()
  await knex('device').insert(
    data
  //   [
  //   { serialnumber: "SN001", ip_address: "192.168.1.1", hostname: "Device1", site_id: 1, partnumber_id: 1 },
  //   { serialnumber: "SN002", ip_address: "192.168.1.2", hostname: "Device2", site_id: 2, partnumber_id: 2 },
  //   { serialnumber: "SN003", ip_address: "192.168.1.3", hostname: "Device3", site_id: 3, partnumber_id: 3 },
  //   { serialnumber: "SN004", ip_address: "192.168.1.4", hostname: "Device4", site_id: 4, partnumber_id: 4 },
  //   { serialnumber: "SN005", ip_address: "192.168.1.5", hostname: "Device5", site_id: 4, partnumber_id: null },
  //   { serialnumber: "SN006", ip_address: "192.168.1.6", hostname: "Device6", site_id: null, partnumber_id: null }
  // ]
);
};
