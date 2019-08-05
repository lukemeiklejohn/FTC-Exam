const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '807fb6ba0f2c44f3b30a85fe7e342d0a';
let mnemonic = require('./mnemonic');

module.exports = {
  
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },

    rinkeby: {
      provider: new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraApikey}`),
      network_id: '4',
      // gas: 7000000, // default = 4712388
      // gasPrice: 6000000000 // default = 100 gwei = 100000000000
    },
  },

  mocha: {
  },

  compilers: {
    solc: {
    }
  }
}
