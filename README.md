# LayerZero Monitoring Dashboard

The LayerZero Monitoring Dashboard - web application that provides easy way of inspecting most up-to-date configuration of core protocol contracts, inspecting all changes made to the core contracts' configuration in the past and peeking into queued multisig transactions that may affect protocol.

## Packages

The project is split into three packages:

- [`@lz/backend`](packages/backend/README.md) - Backend application that provides API for the frontend. Responsible for data extraction and transformation from the blockchain.
- [`@lz/frontend`](packages/frontend/README.md) - Frontend application that provides UI for the user. Responsible for combining data from backend and 3rd part services such as Safe Transaction Service.
- [`@lz/libs`](packages/libs/README.md) - Shared code between backend and frontend. API contracts, interfaces & other utilities.

## Installation

> Before proceeding with development, make sure you have workspace's dependencies installed. To do so, run:

```bash
yarn install
```

## Infrastructure

If you need to inspect deployments, edit configuration or make changes to the core project pipeline:

- **Backend** deployments are handled by automated Heroku's deployments - [LayerZero Monitoring Backend](https://dashboard.heroku.com/apps/lz-monitoring)
- **Frontend** deployments are handled by automated Vercel deployments - [LayerZero Monitoring Frontend](https://vercel.com/l2beat/lz-monitoring-frontend)
