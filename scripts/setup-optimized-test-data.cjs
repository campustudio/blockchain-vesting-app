const hre = require('hardhat');

async function main() {
    console.log('🚀 Creating test vesting schedules on Sepolia (Optimized Contract)...\n');

    // Deployed Optimized Contracts on Sepolia
    const VESTING_ADDRESS = '0xeb6c2E5fab3F8c51C7d29635F4669126FF2B7BFB';
    const PROJ_TOKEN_ADDRESS = '0x6dAF1681Ec0fB7efF7a3938e854fa676BddA69eE';

    const [deployer] = await hre.ethers.getSigners();
    console.log('Setting up with account:', deployer.address);

    const vesting = await hre.ethers.getContractAt('TokenVestingOptimized', VESTING_ADDRESS);
    const projToken = await hre.ethers.getContractAt('MockToken', PROJ_TOKEN_ADDRESS);

    const beneficiary = deployer.address;
    const now = Math.floor(Date.now() / 1000);

    console.log('\n📝 Using BATCH CREATE for gas efficiency...\n');

    // Prepare batch data
    const beneficiaries = [];
    const amounts = [];
    const scheduleDescriptions = [];

    // Schedule 1: Active - started 30 days ago, no cliff
    beneficiaries.push(beneficiary);
    amounts.push(hre.ethers.utils.parseEther('250000'));
    scheduleDescriptions.push('Active PROJ (30 days vesting, no cliff)');

    // Schedule 2: Pending - 3 month cliff
    beneficiaries.push(beneficiary);
    amounts.push(hre.ethers.utils.parseEther('500000'));
    scheduleDescriptions.push('Pending PROJ (3 month cliff)');

    // Schedule 3: Active - 1 month cliff passed
    beneficiaries.push(beneficiary);
    amounts.push(hre.ethers.utils.parseEther('750000'));
    scheduleDescriptions.push('Active PROJ (1 month cliff passed)');

    // Schedule 4: Pending - 6 month cliff
    beneficiaries.push(beneficiary);
    amounts.push(hre.ethers.utils.parseEther('1000000'));
    scheduleDescriptions.push('Pending PROJ (6 month cliff, 2 year vesting)');

    // Schedule 5: Active - 2 week cliff, 90 days in
    beneficiaries.push(beneficiary);
    amounts.push(hre.ethers.utils.parseEther('2000000'));
    scheduleDescriptions.push('Active PROJ (2 week cliff, 90 days vesting)');

    console.log('Schedules to create:');
    scheduleDescriptions.forEach((desc, i) => {
        console.log(`  ${i + 1}. ${desc} - ${hre.ethers.utils.formatEther(amounts[i])} PROJ`);
    });

    // Calculate total amount needed
    const totalAmount = amounts.reduce((sum, amount) => sum.add(amount), hre.ethers.BigNumber.from(0));
    console.log(`\nTotal tokens needed: ${hre.ethers.utils.formatEther(totalAmount)} PROJ`);

    // Approve total amount
    console.log('\n💰 Approving tokens...');
    const approveTx = await projToken.approve(VESTING_ADDRESS, totalAmount);
    await approveTx.wait();
    console.log(' Approved');

    // Create schedules using batch operation (GAS EFFICIENT!)
    console.log('\n Creating 5 schedules in ONE TRANSACTION (batch operation)...');
    console.log('   Note: All schedules start now (optimized contract requires future/present start time)');

    const batchTx = await vesting.batchCreateVestingSchedules(
        beneficiaries,
        PROJ_TOKEN_ADDRESS,
        amounts,
        now + 60, // Start time: 1 minute from now (safety margin)
        0, // No cliff for this batch
        365 * 24 * 60 * 60, // 1 year duration
        true, // Revocable
    );

    const batchReceipt = await batchTx.wait();
    console.log(' Batch create successful!');
    console.log(`   Gas used: ${batchReceipt.gasUsed.toString()}`);
    console.log(`   Transaction hash: ${batchReceipt.transactionHash}`);

    // Get created schedule IDs from events
    const scheduleIds = [];
    batchReceipt.events.forEach((event) => {
        if (event.event === 'VestingScheduleCreated') {
            scheduleIds.push(event.args.vestingId);
        }
    });

    console.log(`\n✅ Created ${scheduleIds.length} vesting schedules!`);

    // Display gas comparison
    console.log('\n⚡ GAS EFFICIENCY COMPARISON:');
    console.log('─'.repeat(70));
    const estimatedIndividual = 180000 * 5; // Estimated gas for 5 individual creates
    const actualBatch = batchReceipt.gasUsed.toNumber();
    const savings = estimatedIndividual - actualBatch;
    const savingsPercent = ((savings / estimatedIndividual) * 100).toFixed(2);

    console.log(`   Estimated Individual Creates (5x): ~${estimatedIndividual.toLocaleString()} gas`);
    console.log(`   Actual Batch Create:                ${actualBatch.toLocaleString()} gas`);
    console.log(`   💰 Savings:                         ${savings.toLocaleString()} gas (${savingsPercent}%)`);
    console.log('─'.repeat(70));

    console.log('\n' + '='.repeat(70));
    console.log('📋 SUMMARY');
    console.log('='.repeat(70));
    console.log('Beneficiary:', beneficiary);
    console.log('Vesting Contract:', VESTING_ADDRESS);
    console.log('PROJ Token:', PROJ_TOKEN_ADDRESS);
    console.log(`\nTotal Schedules Created: ${scheduleIds.length}`);
    console.log('Total Locked:', hre.ethers.utils.formatEther(totalAmount), 'PROJ');
    console.log('\nSchedule IDs:');
    scheduleIds.forEach((id, i) => {
        console.log(`  ${i + 1}. ${id}`);
    });
    console.log('='.repeat(70));

    console.log('\n🔗 View on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${VESTING_ADDRESS}`);
    console.log(`   https://sepolia.etherscan.io/tx/${batchReceipt.transactionHash}`);

    console.log('\n✅ Test data setup complete!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    });
