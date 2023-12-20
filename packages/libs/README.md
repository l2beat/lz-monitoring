# @lz/libs

Set of reusable code components for the Layer Zero monitoring dashboard.
Mostly consists of:

- Interfaces and API contracts
- Utilities,
- Value Objects,
- Value Registries,
- 3rd party adapters and clients.

## Usage

Any change to this packages should be followed by the package rebuilding. This package is core dependency of the dashboard.
Even tough we are using yarn workspaces, we need built version of the package.

To build the package run:

```bash
yarn build
```
