# Example application

        cd ./route-to-normalize-library
        npm link

        cd ./examples/dbapp
        npm link normalize

## TODO
Create a db application that uses a PG docker container and builds a model

## DB on docker
Use the command:
Il comando per creare il container pg-normalize-dbapp con immagine "postgre".

        docker run --name pg-normalize-dbapp \
            -p 5433:5432 \
            -e POSTGRES_USER=test-user -e POSTGRES_PASSWORD=test -e POSTGRES_DB=test-db \
            -e "TZ=UTC-2" \
            -d postgres


## Knex

        knex init

Create knexfile.js:

        