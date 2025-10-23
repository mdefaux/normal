# Example Backend DB application

## Purpose
Create a backend db application that expose some API. It uses a PG docker container and builds a *Normaly* model

## How to test library without publishing

```sh
cd ./route-to-normaly-library
npm link

cd ./examples/dbapp
npm ci
npm link normaly
```

On Mac you should run `sudo npm link` command, then normal `npm link normaly`.

Note: `npm link normaly` command must be run every time you launch npm ci on example app.

## DB container
Ensure pg-normaly-dbapp is running. If not run the npm script:

```sh
npm run createdb
```

See details at [Create DB on docker](#create-db-on-docker)

## Testing

```sh
cd ./examples/dbapp/
npm test
```

## Seeding DB

```sh
knex migrate:rollback
knex migrate:latest
knex seed:run
```

Or

```sh
knex migrate:rollback && knex migrate:latest && knex seed:run 
```

Or

```sh
npm run dbseed
```

## Testing trouble shooting

### Error: connect ECONNREFUSED 127.0.0.1:5433
"before all" hook in "{root}":
     Error: connect ECONNREFUSED 127.0.0.1:5433

The pg db container was not started.
Note: if you don't have a container named `pg-normalize-dbapp` read [Create DB on docker](#create-db-on-docker)


# Initial Setup
HOW THE DBAPP EXAMPLE WAS INITIALIZED

## Create DB on docker
Use the command to create container pg-normaly-dbapp exposing port 5433 with "postgre" image.

```sh
docker run --name pg-normaly-dbapp \
        -p 5433:5432 \
        -e POSTGRES_USER=test-user -e POSTGRES_PASSWORD=test -e POSTGRES_DB=test-db \
        -e "TZ=UTC-2" \
        -d postgres

```

## How to Install

        cd examples/dbapp/
        npm ci

## Knex

```sh
knex init
```

This will create a knexfile.js:


```js
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
```

## test
### Testing DB app

```sh
cd ./examples/dbapp
npm i -D mocha chai chai-http

npm ci

npm test
```
