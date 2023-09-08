# @lzmonitoring/backend

lzmonitoring backend server.

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

Once you have everything, create a `.env` file with the following contents:

```
LOCAL_DB_URL=postgresql://postgres:password@localhost:5432/local
TEST_DB_URL=postgresql://postgres:password@localhost:5432/test
```
