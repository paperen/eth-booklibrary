module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
  	  port: 8545,
  	  network_id: "*"
    },
	  production: {
      host: "119.29.55.45",
      port: 30303,
      network_id: 123,
      gas: 1000000
    }
  }
};
