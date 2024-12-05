require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    baseSepolia: {
        url: "https://sepolia.base.org",
        accounts: [""],
        chainId: 84532,
    },
},
etherscan: {
    apiKey: {
      baseSepolia:""
    },
  },
};
