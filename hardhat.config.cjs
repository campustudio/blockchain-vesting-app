require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
    solidity: {
        version: '0.8.20',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 11155111,
        },
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || '',
    },
};
