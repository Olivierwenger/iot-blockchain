# iot-blockchain
truffle project with iot contract and test

## Usage
1. Be sure to have truffle installed: https://github.com/trufflesuite/truffle
2. You need to have an Ethereum client to use it, I used Ganache http://truffleframework.com/ganache/
3. compile the contract `truffle compile`
4. launch the ethereum client with 10 accounts, each one should have some Ether to communicate with the contract
5. launch the test with `truffle test`

## known issues
* After editing the contract you might have some problems with `truffle compile` because truffle think that you already compiled the files. To resolve this, delete the "build" directory and recompile.
* Ganache tend to crash with error: "Lost heartbeat from server process!" with my version (1.0.1)
