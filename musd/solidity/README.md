# musd Contracts

Smart contracts powering MUSD

## Development

### Installation

This project uses [pnpm](https://pnpm.io/) as a package manager ([installation documentation](https://pnpm.io/installation)).

To install dependencies run:

```bash
pnpm install
```

Install slither locally

```bash
brew install slither
```

### Testing

```bash
$ pnpm test
```

```bash
slither .
```

### Environment Setup

This project uses [dotenv-safer](https://github.com/vincentvella/dotenv-safer),
which provides environment variable checking. If there is a field in
`.env.example` but not `.env`, execution will halt early with an error.

Both `pnpm run deploy` and `pnpm test` will automatically create a blank `.env`
from the `.env.example` template, if `.env` does not exist.

To do this manually:

```bash
$ pnpm run prepare:env
```

### Deploying

We deploy our contracts with
[hardhat-deploy](https://www.npmjs.com/package/hardhat-deploy) via

```bash
$ pnpm run deploy [--network <network>]
```

Check the `"networks"` entry of `hardhat.config.ts` for supported networks.

Deploying to real chains will require configuring the `.env` environment,
detailed in `.env.example`.

#### Examples:

**In-Memory Hardhat** (great for development)

```bash
pnpm run deploy
```

**matsnet**

To deploy contracts on Sepolia run:

```bash
$ pnpm run deploy --network matsnet
```
