<div align = "center">

[![GitHub contributors](https://img.shields.io/github/contributors/MCalenda/FundMeNow?style=for-the-badge)](https://GitHub.com/MCalenda/FundMeNow/graphs/contributors)
[![GitHub issues](https://img.shields.io/github/issues/MCalenda/FundMeNow?style=for-the-badge)](https://GitHub.com/MCalenda/FundMeNow/issues)
[![GitHub forks](https://img.shields.io/github/forks/MCalenda/FundMeNow?style=for-the-badge)](https://GitHub.com/MCalenda/FundMeNow/fork)

[![Travis CI](https://img.shields.io/travis/com/MCalenda/FundMeNow?label=Travis%20CI&style=for-the-badge)](https://app.travis-ci.com/github/MCalenda/FundMeNow)

</div>

## Introduction

**FundMeNow** is a decentralized crowdfunding platform based on Ethereum blockchain developed using Truffle and ReactJS for the _Data Security_ course at [@Unisa](https://unisa.it). User accounts can create projects in order to raise funds (ETH) for multiple purposes. The platform is based on the _All-or-Nothing_ model, which means that the project owner can withdraw the funds only if the campaign is successful, otherwise the funds are withdrawable by the funder whom can still fund the campaign after the deadline has passed, and the target has not been reached.

<div align=center>

![Cover](/public/cover.png)

</div>

## Programming languages and technologies

<div align= "center">

![JavaScript Badge](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000&style=for-the-badge)
![Solidity Badge](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=fff&style=for-the-badge)

![Truffle Badge](https://img.shields.io/badge/-truffle%20suite-5A444B?style=for-the-badge)
![Ganache Badge](https://img.shields.io/badge/-ganache-E4A664?style=for-the-badge)
![Ethereum Badge](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=fff&style=for-the-badge)

![Web3.js Badge](https://img.shields.io/badge/Web3.js-F16822?logo=web3dotjs&logoColor=fff&style=for-the-badge)
![React Badge](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=for-the-badge)
![Mocha Badge](https://img.shields.io/badge/Mocha-8D6748?logo=mocha&logoColor=fff&style=for-the-badge)

</div>

## Installation 

The project is divided into two main folders: `client` and `contracts`. The former contains the ReactJS application, while the latter contains the Solidity smart contracts. The `migrations` folder contains the migration scripts for the smart contracts.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14.17.0)
- [Truffle](https://www.trufflesuite.com/truffle) (v5.3.10)
- [Ganache](https://www.trufflesuite.com/ganache)
- [MetaMask](https://metamask.io/) (v9.5.0)

### Installation

1. Install NPM packages.
   ```sh
   npm install
   ```
2. Run the local blockchain using Ganache, the default port is `8545`.

   ```sh
   ganache-cli
   ```

   Optionally: run the blockchain with the reccomended prameters using the provided script, this will launch the blockchain in deterministic mode saving the db in the `./ganache_db` folder.

   ```sh
   chmod +x ./scripts/run_ganache.sh
   ./scripts/run_ganache.sh
   ```

3. Migrate the smart contracts.
   ```sh
   truffle migrate
   ```
4. Run the ReactJS application, the default port is `3000`.
   ```sh
   npm start
   ```

In order to use FundMeNow is required to have MetaMask wallet (or similar) connected to ganache, we suggest to use the chrome extension.

## License

Distributed under the MIT License. See `LICENSE` for more information.
