const hre = require('hardhat');

async function main() {
    console.log('🚀 Starting deployment...\n');

    const [deployer] = await hre.ethers.getSigners();
    console.log('Deployer address:', deployer.address);
    console.log('Deployer balance:', hre.ethers.utils.formatEther(await deployer.getBalance()), 'ETH\n');

    const MockToken = await hre.ethers.getContractFactory('MockToken');

    // Deploy PROJ Token
    console.log('Deploying PROJ Token...');
    const projToken = await MockToken.deploy('Project Token', 'PROJ', hre.ethers.utils.parseEther('10000000'));
    await projToken.deployed();
    console.log('✅ PROJ Token:', projToken.address);

    // Deploy TEAM Token
    console.log('Deploying TEAM Token...');
    const teamToken = await MockToken.deploy('Team Token', 'TEAM', hre.ethers.utils.parseEther('5000000'));
    await teamToken.deployed();
    console.log('✅ TEAM Token:', teamToken.address);

    // Deploy EARLY Token
    console.log('Deploying EARLY Token...');
    const earlyToken = await MockToken.deploy('Early Investor Token', 'EARLY', hre.ethers.utils.parseEther('20000000'));
    await earlyToken.deployed();
    console.log('✅ EARLY Token:', earlyToken.address);

    // Deploy ADVISOR Token
    console.log('Deploying ADVISOR Token...');
    const advisorToken = await MockToken.deploy('Advisor Token', 'ADVISOR', hre.ethers.utils.parseEther('1000000'));
    await advisorToken.deployed();
    console.log('✅ ADVISOR Token:', advisorToken.address);

    // Deploy SEED Token
    console.log('Deploying SEED Token...');
    const seedToken = await MockToken.deploy('Seed Investor Token', 'SEED', hre.ethers.utils.parseEther('10000000'));
    await seedToken.deployed();
    console.log('✅ SEED Token:', seedToken.address);

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
    console.log('TEAM_TOKEN_ADDRESS=' + teamToken.address);
    console.log('EARLY_TOKEN_ADDRESS=' + earlyToken.address);
    console.log('ADVISOR_TOKEN_ADDRESS=' + advisorToken.address);
    console.log('SEED_TOKEN_ADDRESS=' + seedToken.address);
    console.log('='.repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });
