# @lz/backend

LayerZero Monitoring Backend - responsible for data indexing, transforming and aggregation. Exposes a REST API for frontend consumption.

## Setup

### Dependencies

To run or develop the backend you need to install and build its dependencies. You can do it by running the following commands in the repository root:

```
yarn
yarn build
```

### Database

After the nodejs dependencies have been installed you should also install a Postgres database (v14). The recommended way is through docker using the commands below.

```
docker run -d --name=lzmonitoring_postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:14
docker exec -it lzmonitoring_postgres psql -U postgres -c 'CREATE DATABASE local'
docker exec -it lzmonitoring_postgres psql -U postgres -c 'CREATE DATABASE test'
```

If you restart your system running `docker start lzmonitoring_postgres` will bring the database back online.

Alternatively you can simply run `./scripts/start_db.sh` which will always do what's needed.

### Environment variables

Once you have everything, create a `.env` file with the following contents:

```bash
LOCAL_DB_URL=postgresql://postgres:password@localhost:5432/local
TEST_DB_URL=postgresql://postgres:password@localhost:5432/test
```

> Those are bare minimum environment variables. No modules will be enabled, no indexer will be running.

Please inspect `.env.example` file for all the available environment variables.

### Booting discovery submodule

By default all supported chains are not running submodules and are not visible to the frontend.
If you want to run the indexing logic and start gathering on-chain data, you need to supply environment variables with configuration for given module.

Once again, please inspect `.env.example` file for all the available environment variables.

### Booting backend

To run **development** with auto-restarts please run:

```bash
yarn start:dev
```

To run **production** please run:

```bash
yarn build
```

and then

```bash
yarn start
```

## Concepts

To explore core concepts and rationales please navigate to the [INFRA.md](INFRA.md)
