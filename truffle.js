module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },
  mocha: {
    timeout: 0, // used to have no timeout for test
  }
};

// with ganache-cli
// ganache-cli -l 300000000 -p 7545 -g 1 --db blockchain