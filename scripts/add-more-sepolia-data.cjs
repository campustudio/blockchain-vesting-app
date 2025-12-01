const hre = require('hardhat');

async function main() {
    console.log('🚀 Adding more test vesting schedules to Sepolia...\n');

    // Sepolia Contract addresses
    const VESTING_ADDRESS = '0x50DD7096fAB68990Ef61430FF8b6a25D0054A857';
    const PROJ_TOKEN_ADDRESS = '0x334ea69ed935F5c46D777506c83262DBAD59931A';

    const [deployer] = await hre.ethers.getSigners();
    console.log('Setting up with account:', deployer.address);

    // Get contract instances
    const vesting = await hre.ethers.getContractAt('TokenVesting', VESTING_ADDRESS);
    const projToken = await hre.ethers.getContractAt('MockToken', PROJ_TOKEN_ADDRESS);

    const beneficiary = deployer.address;
    const now = Math.floor(Date.now() / 1000);

    console.log('\n📝 Creating additional vesting schedules...\n');

    // Schedule 2: Active PROJ (started 30 days ago, no cliff, 1 year duration)
    // This one should be claimable immediately
    console.log('Creating Schedule 2: Active PROJ (no cliff, claimable now)...');
    const amount2 = hre.ethers.utils.parseEther('250000');
    const start2 = now - 30 * 24 * 60 * 60; // Started 30 days ago

    let tx = await projToken.approve(VESTING_ADDRESS, amount2);
    await tx.wait();

    tx = await vesting.createVestingSchedule(
        beneficiary,
        PROJ_TOKEN_ADDRESS,
        amount2,
        start2,
        0, // No cliff
        31536000, // 365 days duration
        true, // revocable
    );
    await tx.wait();
    console.log('✅ Active PROJ schedule created (should be claimable)');

    // Schedule 3: Pending PROJ (6 month cliff, 2 year duration)
    console.log('\nCreating Schedule 3: Pending PROJ (6 month cliff)...');
    const amount3 = hre.ethers.utils.parseEther('1000000');

    tx = await projToken.approve(VESTING_ADDRESS, amount3);
    await tx.wait();

    tx = await vesting.createVestingSchedule(
        beneficiary,
        PROJ_TOKEN_ADDRESS,
        amount3,
        now,
        15552000, // 180 days (6 months) cliff
        63072000, // 730 days (2 years) duration
        true,
    );
    await tx.wait();
    console.log('✅ Pending PROJ schedule created (6 month cliff)');

    // Schedule 4: Active PROJ (started 60 days ago, 1 month cliff already passed)
    console.log('\nCreating Schedule 4: Active PROJ (cliff passed, vesting)...');
    const amount4 = hre.ethers.utils.parseEther('750000');
    const start4 = now - 60 * 24 * 60 * 60; // Started 60 days ago

    tx = await projToken.approve(VESTING_ADDRESS, amount4);
    await tx.wait();

    tx = await vesting.createVestingSchedule(
        beneficiary,
        PROJ_TOKEN_ADDRESS,
        amount4,
        start4,
        2592000, // 30 days cliff (already passed)
        31536000, // 365 days duration
        true,
    );
    await tx.wait();
    console.log('✅ Active PROJ schedule created (cliff passed)');

    // Schedule 5: Pending PROJ (short cliff - 1 month, for easy testing)
    console.log('\nCreating Schedule 5: Pending PROJ (1 month cliff)...');
    const amount5 = hre.ethers.utils.parseEther('100000');

    tx = await projToken.approve(VESTING_ADDRESS, amount5);
    await tx.wait();

    tx = await vesting.createVestingSchedule(
        beneficiary,
        PROJ_TOKEN_ADDRESS,
        amount5,
        now,
        2592000, // 30 days (1 month) cliff
        15552000, // 180 days (6 months) duration
        true,
    );
    await tx.wait();
    console.log('✅ Pending PROJ schedule created (1 month cliff)');

    console.log('\n📋 Test data setup complete!');
    console.log('='.repeat(60));
    console.log('Beneficiary:', beneficiary);
    console.log('Vesting Contract:', VESTING_ADDRESS);
    console.log('PROJ Token:', PROJ_TOKEN_ADDRESS);
    console.log('\n📊 Total schedules created: 4 additional schedules');
    console.log('Summary:');
    console.log('  - Schedule 2: 250K PROJ - Active (no cliff, started 30 days ago)');
    console.log('  - Schedule 3: 1M PROJ - Pending (6 month cliff)');
    console.log('  - Schedule 4: 750K PROJ - Active (cliff passed, vesting)');
    console.log('  - Schedule 5: 100K PROJ - Pending (1 month cliff)');
    console.log('='.repeat(60));
    console.log('\n🔗 View on Etherscan:');
    console.log(`https://sepolia.etherscan.io/address/${VESTING_ADDRESS}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    });
