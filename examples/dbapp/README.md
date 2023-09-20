# Example application

## Purpose
Create a backend db application that expose some API. It uses a PG docker container and builds a model

## How to test library without publishing

        cd ./route-to-normaly-library
        npm link

        cd ./examples/dbapp
        npm ci
        npm link normaly

On Mac you should run `sudo npm link` command, then normal `npm link normaly`.

Note: `npm link normaly` command must be run every time you launch npm ci on example app.

# Testing

        cd examples/dbapp/
        npm test


# Initial Setup

## DB on docker
Use the command to create container pg-normaly-dbapp exposing port 5433 with "postgre" image.

        docker run --name pg-normaly-dbapp \
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
### Testing DB app

        cd ./examples/dbapp
        npm i -D mocha chai chai-http

        npm ci

        npm test

