# FiveringsDB - Node Edition (aka EmeraldDB)

## Prerequisites:
To run the application you need:
* Node version 26 or higher (pinned to 26.13.1 via Volta, `.nvmrc` and `.node-version`)
* Yarn 4 (pinned to 4.18.1 via Volta and `packageManager` in `package.json`)
* A local Postgres database, e.g. from `docker compose up -d` (Postgres 18, user `postgres`, password `password`, port 5432; the data stays in a Docker volume until `docker compose down -v`)

## Set Up:

### Install Node and Yarn
With [Volta](https://volta.sh), which picks up the pinned versions in the project:
```volta install node yarn```

Without Volta, use Corepack (Node 25+ doesn't ship it anymore):
```npm install -g corepack && corepack enable```


### Install backend packages
```yarn install```

### Install frontend packages
```cd client```
```yarn install```

### Copy Environment File
Copy '.env.template' from the root of the project and paste it exactly there as '.env'
Adjust the environment variables to use your local Postgres database, and set `BETA_URL` to the beta instance you want to import packs from (with a trailing slash)
If you want to access Admin features (such as importing data) as well as the deckbuilder, you will need an Auth0 instance that you can authenticate with. Insert your Client ID and Auth0 Domain in the .env file 

## Start the application
1. To migrate your database to the latest schema, run ```yarn migrate:latest```
2. In the project root, run ```yarn start:server:dev``` to start the backend on port 8080
3. In the 'client' folder, run ```yarn start``` to start the frontend on port 3000

## How to Import Data
Packs are imported from the beta instance configured in `BETA_URL`, one pack at a time.
1. Log into the application once to create your user in the database (requires Auth0 setup)
2. In the 'roles' column of the 'users' table, enter ```data_admin``` for your user and save those changes
3. You should be able to access the Admin page of the application now
4. The pack's cycle has to exist first. If it doesn't, create it on the Admin page under Manage Cycles And Packs, with the same ID as on beta
5. Enter the pack ID under "Import A Pack From BETA". This imports the pack, its cards, their pack entries and the cards' traits. Formats aren't part of the import and are maintained on the Admin page


