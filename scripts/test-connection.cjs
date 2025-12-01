const hre = require('hardhat');

async function main() {
    console.log('🔍 Testing Sepolia connection...\n');

    const [signer] = await hre.ethers.getSigners();
    const balance = await signer.getBalance();

    console.log('✅ Connected to Sepolia');
    console.log('Account:', signer.address);
    console.log('Balance:', hre.ethers.utils.formatEther(balance), 'ETH');

    if (balance.lt(hre.ethers.utils.parseEther('0.05'))) {
        console.log('\n⚠️  Warning: Balance is low. You may need more test ETH.');
    } else {
        console.log('\n✅ Balance is sufficient for deployment!');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    });
