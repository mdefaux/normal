# Example application

## TODO
Create a db application that uses a PG docker container and builds a model

## How to test library without publishing

        cd ./route-to-normalize-library
        npm link

        cd ./examples/dbapp
        npm link normalize

On Mac you should run `sudo npm link` command, then normal `npm link normalize`.

## DB on docker
Use the command:
Il comando per creare il container pg-normalize-dbapp con immagine "postgre".

        docker run --name pg-normalize-dbapp \
            -p 5433:5432 \
            -e POSTGRES_USER=test-user -e POSTGRES_PASSWORD=test -e POSTGRES_DB=test-db \
            -e "TZ=UTC-2" \
            -d postgres

## How to Install

        cd examples/dbapp/
        npm ci

## Knex


        knex init

This will create a knexfile.js:


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

## test

