module.exports = {
	compilers: {
    solc: {
      version: "^0.6.0",
      parser: "solcjs", 
      settings: {
        optimizer: {
          enabled: false,
        },
      }
    }
  }
};
