const hre = require('hardhat');

async function main() {
    console.log('🚀 Deploying remaining contracts to Sepolia...\n');

    const [deployer] = await hre.ethers.getSigners();
    console.log('Deployer address:', deployer.address);
    console.log('Deployer balance:', hre.ethers.utils.formatEther(await deployer.getBalance()), 'ETH\n');

    const MockToken = await hre.ethers.getContractFactory('MockToken');

    // Deploy only PROJ Token for testing
    console.log('Deploying PROJ Token...');
    const projToken = await MockToken.deploy('Project Token', 'PROJ', hre.ethers.utils.parseEther('10000000'));
    await projToken.deployed();
    console.log('✅ PROJ Token:', projToken.address);

    // Deploy Vesting Contract
    console.log('\nDeploying TokenVesting Contract...');
    const TokenVesting = await hre.ethers.getContractFactory('TokenVesting');
    const vesting = await TokenVesting.deploy();
    await vesting.deployed();
    console.log('✅ TokenVesting:', vesting.address);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 DEPLOYMENT COMPLETE');
    console.log('='.repeat(60));
    console.log('VESTING_CONTRACT_ADDRESS=' + vesting.address);
    console.log('PROJ_TOKEN_ADDRESS=' + projToken.address);
    console.log('='.repeat(60));
    console.log('\n⚠️  Remember to update these addresses in:');
    console.log('   src/app/lib/constants/contract.constant.ts');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });
