const hre = require('hardhat');

async function main() {
    console.log('🚀 Deploying Optimized TokenVesting to Sepolia...\n');

    const [deployer] = await hre.ethers.getSigners();
    console.log('Deploying with account:', deployer.address);

    const balance = await deployer.getBalance();
    console.log('Account balance:', hre.ethers.utils.formatEther(balance), 'ETH\n');

    // Deploy MockToken (PROJ)
    console.log('📦 Deploying PROJ Token...');
    const MockToken = await hre.ethers.getContractFactory('MockToken');
    const projToken = await MockToken.deploy(
        'Project Token',
        'PROJ',
        hre.ethers.utils.parseEther('1000000000'), // 1 billion tokens
    );
    await projToken.deployed();
    console.log('✅ PROJ Token deployed to:', projToken.address);

    // Deploy Optimized TokenVesting
    console.log('\n📦 Deploying Optimized TokenVesting...');
    const TokenVestingOptimized = await hre.ethers.getContractFactory('TokenVestingOptimized');
    const vesting = await TokenVestingOptimized.deploy();
    await vesting.deployed();
    console.log('✅ Optimized TokenVesting deployed to:', vesting.address);

    // Get deployment gas costs
    const vestingDeployTx = await hre.ethers.provider.getTransactionReceipt(vesting.deployTransaction.hash);
    console.log('   Deployment gas used:', vestingDeployTx.gasUsed.toString());

    console.log('\n' + '='.repeat(70));
    console.log('📋 DEPLOYMENT SUMMARY');
    console.log('='.repeat(70));
    console.log('Network: Sepolia');
    console.log('Deployer:', deployer.address);
    console.log('\nContracts:');
    console.log('  PROJ Token:', projToken.address);
    console.log('  Vesting Contract (Optimized):', vesting.address);
    console.log('\nGas Used:');
    console.log('  Vesting Contract:', vestingDeployTx.gasUsed.toString());
    console.log('='.repeat(70));

    console.log('\n🔗 Verify on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${vesting.address}`);
    console.log(`   https://sepolia.etherscan.io/address/${projToken.address}`);

    console.log('\n📝 Update these addresses in your frontend:');
    console.log('   src/app/lib/constants/contracts.constant.ts');
    console.log('\n   sepolia: {');
    console.log(`     vesting: '${vesting.address}',`);
    console.log(`     mockTokens: {`);
    console.log(`       PROJ: '${projToken.address}',`);
    console.log('     }');
    console.log('   }');

    console.log('\n✅ Deployment complete!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });
