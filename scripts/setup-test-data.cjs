const hre = require('hardhat');

async function main() {
    console.log('🚀 Setting up test vesting schedules...\n');

    // Contract addresses from deployment
    const VESTING_ADDRESS = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';
    const PROJ_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const TEAM_TOKEN_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

    const [deployer] = await hre.ethers.getSigners();
    console.log('Setting up with account:', deployer.address);

    // Get contract instances
    const vesting = await hre.ethers.getContractAt('TokenVesting', VESTING_ADDRESS);
    const projToken = await hre.ethers.getContractAt('MockToken', PROJ_TOKEN_ADDRESS);
    const teamToken = await hre.ethers.getContractAt('MockToken', TEAM_TOKEN_ADDRESS);

    // Beneficiary address (using deployer for testing)
    const beneficiary = deployer.address;

    console.log('\n📝 Creating vesting schedules...\n');

    // 1. Project Token Vesting (500K tokens, 1 year duration, 3 month cliff)
    const projAmount = hre.ethers.utils.parseEther('500000');
    console.log('Approving PROJ tokens...');
    await projToken.approve(VESTING_ADDRESS, projAmount);

    console.log('Creating PROJ vesting schedule...');
    const now = Math.floor(Date.now() / 1000);
    const tx1 = await vesting.createVestingSchedule(
        beneficiary,
        PROJ_TOKEN_ADDRESS,
        projAmount,
        now,
        7776000, // 90 days cliff
        31536000, // 365 days duration
        true, // revocable
    );
    await tx1.wait();
    console.log('✅ PROJ vesting schedule created');

    // 2. Team Token Vesting (250K tokens, 2 year duration, 6 month cliff)
    const teamAmount = hre.ethers.utils.parseEther('250000');
    console.log('\nApproving TEAM tokens...');
    await teamToken.approve(VESTING_ADDRESS, teamAmount);

    console.log('Creating TEAM vesting schedule...');
    const tx2 = await vesting.createVestingSchedule(
        beneficiary,
        TEAM_TOKEN_ADDRESS,
        teamAmount,
        now,
        15552000, // 180 days cliff
        63072000, // 730 days duration
        true, // revocable
    );
    await tx2.wait();
    console.log('✅ TEAM vesting schedule created');

    // 3. Active Project Token (already past cliff, 100K tokens, started 4 months ago)
    const activeAmount = hre.ethers.utils.parseEther('100000');
    console.log('\nApproving active PROJ tokens...');
    await projToken.approve(VESTING_ADDRESS, activeAmount);

    console.log('Creating active PROJ vesting schedule...');
    const fourMonthsAgo = now - 120 * 24 * 60 * 60; // 4 months ago
    const tx3 = await vesting.createVestingSchedule(
        beneficiary,
        PROJ_TOKEN_ADDRESS,
        activeAmount,
        fourMonthsAgo,
        7776000, // 90 days cliff (already passed)
        31536000, // 365 days duration
        false, // not revocable
    );
    await tx3.wait();
    console.log('✅ Active PROJ vesting schedule created');

    console.log('\n📋 Test data setup complete!');
    console.log('='.repeat(60));
    console.log('Beneficiary:', beneficiary);
    console.log('Total schedules created: 3');
    console.log('- 1 pending PROJ (3 month cliff)');
    console.log('- 1 pending TEAM (6 month cliff)');
    console.log('- 1 active PROJ (claimable now)');
    console.log('='.repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });
