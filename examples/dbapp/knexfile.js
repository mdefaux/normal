// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'postgresql',
      connection: {
        host: "localhost",
        port: 5433,
        database: "test-db",
        user: "test-user",
        password: "test"
      },
      pool: {
        min: 2,
        max: 100
      },
      acquireConnectionTimeout: 60000,
      multipleStatements: true,
      migrations: {
        directory: __dirname + "/db/migrations"
      },
      seeds: {
        directory: __dirname + "/db/seeds/development"
      }
  },

};
