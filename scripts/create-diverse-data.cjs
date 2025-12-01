const hre = require('hardhat');

async function main() {
    console.log('🚀 Creating DIVERSE test vesting schedules on Sepolia...\n');

    const VESTING_ADDRESS = '0x186FBa7B212C5aCCAe3f264178f28922080Bf5a5';
    const PROJ_TOKEN_ADDRESS = '0x10FDc7A86a2EB3864b18e26B5a204134DD85Cb1c';

    const [deployer] = await hre.ethers.getSigners();
    console.log('Account:', deployer.address);

    const vesting = await hre.ethers.getContractAt('TokenVestingOptimized', VESTING_ADDRESS);
    const projToken = await hre.ethers.getContractAt('MockToken', PROJ_TOKEN_ADDRESS);

    const beneficiary = deployer.address;
    const now = Math.floor(Date.now() / 1000);

    console.log('\n📝 Creating 12 diverse vesting schedules...\n');

    const schedules = [
        // 1. Active - Started 90 days ago, no cliff, 1 year (75% vested)
        {
            amount: '500000',
            start: now - 90 * 24 * 60 * 60,
            cliff: 0,
            duration: 365 * 24 * 60 * 60,
            desc: 'ACTIVE: 75% vested (90/365 days)',
        },
        // 2. Active - Started 180 days ago, 1 month cliff, 1 year (cliff passed, 50% vested)
        {
            amount: '1000000',
            start: now - 180 * 24 * 60 * 60,
            cliff: 30 * 24 * 60 * 60,
            duration: 365 * 24 * 60 * 60,
            desc: 'ACTIVE: 50% vested (180/365 days, cliff passed)',
        },
        // 3. Active - Started 30 days ago, 1 week cliff, 6 months (cliff passed, early stage)
        {
            amount: '250000',
            start: now - 30 * 24 * 60 * 60,
            cliff: 7 * 24 * 60 * 60,
            duration: 180 * 24 * 60 * 60,
            desc: 'ACTIVE: 17% vested (30/180 days)',
        },
        // 4. Completed - Started 400 days ago, 3 months cliff, 1 year (100% vested)
        {
            amount: '2000000',
            start: now - 400 * 24 * 60 * 60,
            cliff: 90 * 24 * 60 * 60,
            duration: 365 * 24 * 60 * 60,
            desc: 'COMPLETED: 100% vested (fully unlocked)',
        },
        // 5. Pending - Starts in 15 days, 1 month cliff, 1 year
        {
            amount: '750000',
            start: now + 15 * 24 * 60 * 60,
            cliff: 30 * 24 * 60 * 60,
            duration: 365 * 24 * 60 * 60,
            desc: 'PENDING: Starts in 15 days',
        },
        // 6. Pending - Starts in 7 days, 2 weeks cliff, 6 months
        {
            amount: '300000',
            start: now + 7 * 24 * 60 * 60,
            cliff: 14 * 24 * 60 * 60,
            duration: 180 * 24 * 60 * 60,
            desc: 'PENDING: Starts in 7 days',
        },
        // 7. Active - Started 60 days ago, no cliff, 3 months (67% vested)
        {
            amount: '450000',
            start: now - 60 * 24 * 60 * 60,
            cliff: 0,
            duration: 90 * 24 * 60 * 60,
            desc: 'ACTIVE: 67% vested (60/90 days)',
        },
        // 8. Active - Started 300 days ago, 6 months cliff, 2 years (25% vested)
        {
            amount: '5000000',
            start: now - 300 * 24 * 60 * 60,
            cliff: 180 * 24 * 60 * 60,
            duration: 730 * 24 * 60 * 60,
            desc: 'ACTIVE: Long-term vest (300/730 days)',
        },
        // 9. Active - Started 45 days ago, 1 month cliff, 1 year (cliff just passed)
        {
            amount: '800000',
            start: now - 45 * 24 * 60 * 60,
            cliff: 30 * 24 * 60 * 60,
            duration: 365 * 24 * 60 * 60,
            desc: 'ACTIVE: Cliff just passed (45 days)',
        },
        // 10. Active - Started 200 days ago, 2 months cliff, 1 year (55% vested)
        {
            amount: '1500000',
            start: now - 200 * 24 * 60 * 60,
            cliff: 60 * 24 * 60 * 60,
            duration: 365 * 24 * 60 * 60,
            desc: 'ACTIVE: 55% vested (200/365 days)',
        },
        // 11. Active - Started 15 days ago, no cliff, 1 month (50% vested)
        {
            amount: '100000',
            start: now - 15 * 24 * 60 * 60,
            cliff: 0,
            duration: 30 * 24 * 60 * 60,
            desc: 'ACTIVE: Fast vest (15/30 days)',
        },
        // 12. Pending - Starts in 30 days, 3 months cliff, 2 years
        {
            amount: '3000000',
            start: now + 30 * 24 * 60 * 60,
            cliff: 90 * 24 * 60 * 60,
            duration: 730 * 24 * 60 * 60,
            desc: 'PENDING: Future vest (starts in 30 days)',
        },
    ];

    let totalAmount = hre.ethers.BigNumber.from(0);
    for (const schedule of schedules) {
        totalAmount = totalAmount.add(hre.ethers.utils.parseEther(schedule.amount));
    }

    console.log('Total tokens needed:', hre.ethers.utils.formatEther(totalAmount), 'PROJ\n');

    // Approve total amount
    console.log('💰 Approving tokens...');
    const approveTx = await projToken.approve(VESTING_ADDRESS, totalAmount);
    await approveTx.wait();
    console.log('✅ Approved\n');

    // Create schedules individually to show progress
    let successCount = 0;
    for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];
        console.log(`[${i + 1}/${schedules.length}] Creating: ${schedule.desc}`);
        console.log(`   Amount: ${schedule.amount} PROJ`);

        try {
            const amount = hre.ethers.utils.parseEther(schedule.amount);

            const tx = await vesting.createVestingSchedule(
                beneficiary,
                PROJ_TOKEN_ADDRESS,
                amount,
                schedule.start,
                schedule.cliff,
                schedule.duration,
                true,
            );

            await tx.wait();
            successCount++;
            console.log(`   ✅ Created\n`);
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}\n`);
        }
    }

    console.log('='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`Successfully created: ${successCount}/${schedules.length} schedules`);
    console.log('Total locked:', hre.ethers.utils.formatEther(totalAmount), 'PROJ');
    console.log('\nExpected distribution:');
    console.log('  • Pending: ~3 schedules (not started yet)');
    console.log('  • Active: ~8 schedules (currently vesting)');
    console.log('  • Completed: ~1 schedule (fully vested)');
    console.log('='.repeat(70));

    console.log('\n🔗 View on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${VESTING_ADDRESS}`);

    console.log('\n✅ Diverse test data created!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    });
