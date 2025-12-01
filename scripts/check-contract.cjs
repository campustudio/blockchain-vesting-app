const hre = require('hardhat');

async function main() {
    const vestingAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';

    console.log('Checking if contract exists at:', vestingAddress);

    const code = await hre.ethers.provider.getCode(vestingAddress);

    if (code === '0x') {
        console.log('❌ No contract found at this address!');
        console.log('📝 You need to redeploy contracts.');
    } else {
        console.log('✅ Contract exists!');
        console.log('Contract bytecode length:', code.length);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
