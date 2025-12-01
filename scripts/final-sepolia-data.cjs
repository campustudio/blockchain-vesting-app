const hre = require('hardhat');

async function main() {
    console.log('🚀 Creating final batch of diverse test data on Sepolia...\n');

    const VESTING_ADDRESS = '0x50DD7096fAB68990Ef61430FF8b6a25D0054A857';
    const PROJ_TOKEN_ADDRESS = '0x334ea69ed935F5c46D777506c83262DBAD59931A';

    const [deployer] = await hre.ethers.getSigners();
    console.log('Account:', deployer.address);

    const vesting = await hre.ethers.getContractAt('TokenVesting', VESTING_ADDRESS);
    const projToken = await hre.ethers.getContractAt('MockToken', PROJ_TOKEN_ADDRESS);

    const beneficiary = deployer.address;
    const now = Math.floor(Date.now() / 1000);

    console.log('\n📝 Creating diverse schedules...\n');

    const schedules = [
        // Active - started 90 days ago, 2 weeks cliff (passed), 1 year duration
        {
            amount: '2000000',
            start: now - 90 * 24 * 60 * 60,
            cliff: 1209600, // 14 days
            duration: 31536000, // 1 year
            desc: 'Active PROJ (90 days vesting, 2 week cliff passed)',
        },
        // Pending - 2 month cliff, 18 month duration
        {
            amount: '3500000',
            start: now,
            cliff: 5184000, // 60 days
            duration: 46656000, // 540 days (18 months)
            desc: 'Pending PROJ (2 month cliff, 18 month vesting)',
        },
        // Active - started 120 days ago, no cliff, 6 month duration (already 4 months in)
        {
            amount: '800000',
            start: now - 120 * 24 * 60 * 60,
            cliff: 0,
            duration: 15552000, // 180 days (6 months)
            desc: 'Active PROJ (4 months vested, 2 months remaining)',
        },
        // Pending - 1 week cliff, 3 month duration (will be active soon for testing)
        {
            amount: '50000',
            start: now,
            cliff: 604800, // 7 days
            duration: 7776000, // 90 days (3 months)
            desc: 'Pending PROJ (1 week cliff, 3 month vesting)',
        },
        // Active - started 45 days ago, 1 month cliff (passed), 2 year duration
        {
            amount: '5000000',
            start: now - 45 * 24 * 60 * 60,
            cliff: 2592000, // 30 days
            duration: 63072000, // 730 days (2 years)
            desc: 'Active PROJ (cliff just passed, long vesting)',
        },
    ];

    for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];
        console.log(`[${i + 1}/${schedules.length}] Creating: ${schedule.desc}`);

        const amount = hre.ethers.utils.parseEther(schedule.amount);

        let tx = await projToken.approve(VESTING_ADDRESS, amount);
        await tx.wait();

        tx = await vesting.createVestingSchedule(
            beneficiary,
            PROJ_TOKEN_ADDRESS,
            amount,
            schedule.start,
            schedule.cliff,
            schedule.duration,
            true,
        );
        await tx.wait();
        console.log(`✅ Created: ${schedule.amount} PROJ\n`);
    }

    console.log('='.repeat(70));
    console.log('📊 FINAL TEST DATA SUMMARY');
    console.log('='.repeat(70));
    console.log('Total new schedules created: 5');
    console.log('\nExpected totals (including previous):');
    console.log('  • Total Schedules: ~10');
    console.log('  • Active Schedules: ~5 (with claimable tokens)');
    console.log('  • Pending Schedules: ~5 (waiting for cliff)');
    console.log('  • Total Locked: ~12+ Million PROJ tokens');
    console.log('='.repeat(70));
    console.log('\n🔗 View on Etherscan:');
    console.log(`https://sepolia.etherscan.io/address/${VESTING_ADDRESS}`);
    console.log('\n✅ Ready for Vercel deployment!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    });
