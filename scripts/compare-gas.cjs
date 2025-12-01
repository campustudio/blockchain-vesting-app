const hre = require('hardhat');

async function main() {
    console.log('⚡ Gas Comparison: Original vs Optimized TokenVesting\n');
    console.log('='.repeat(80));

    const [deployer] = await hre.ethers.getSigners();
    console.log('Deployer:', deployer.address);

    // Deploy MockToken
    console.log('\n📦 Deploying MockToken...');
    const MockToken = await hre.ethers.getContractFactory('MockToken');
    const token = await MockToken.deploy('Test Token', 'TEST', hre.ethers.utils.parseEther('1000000000'));
    await token.deployed();
    console.log('✅ MockToken deployed:', token.address);

    // Deploy Original TokenVesting
    console.log('\n📦 Deploying Original TokenVesting...');
    const TokenVesting = await hre.ethers.getContractFactory('TokenVesting');
    const originalVesting = await TokenVesting.deploy();
    await originalVesting.deployed();
    const originalDeployTx = await hre.ethers.provider.getTransactionReceipt(originalVesting.deployTransaction.hash);
    console.log('✅ Original TokenVesting deployed:', originalVesting.address);
    console.log('   Deployment gas:', originalDeployTx.gasUsed.toString());

    // Deploy Optimized TokenVesting
    console.log('\n📦 Deploying Optimized TokenVesting...');
    const TokenVestingOptimized = await hre.ethers.getContractFactory('TokenVestingOptimized');
    const optimizedVesting = await TokenVestingOptimized.deploy();
    await optimizedVesting.deployed();
    const optimizedDeployTx = await hre.ethers.provider.getTransactionReceipt(optimizedVesting.deployTransaction.hash);
    console.log('✅ Optimized TokenVesting deployed:', optimizedVesting.address);
    console.log('   Deployment gas:', optimizedDeployTx.gasUsed.toString());

    console.log('\n' + '='.repeat(80));
    console.log('GAS COMPARISON RESULTS');
    console.log('='.repeat(80));

    const results = {
        deployment: {
            original: originalDeployTx.gasUsed,
            optimized: optimizedDeployTx.gasUsed,
        },
        operations: [],
    };

    // Test 1: Create Single Vesting Schedule
    console.log('\n🧪 Test 1: Create Single Vesting Schedule');
    console.log('-'.repeat(80));

    const amount = hre.ethers.utils.parseEther('1000000');
    const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
    const cliff = 30 * 24 * 60 * 60; // 30 days
    const duration = 365 * 24 * 60 * 60; // 1 year

    // Approve tokens for both contracts
    await token.approve(originalVesting.address, amount);
    await token.approve(optimizedVesting.address, amount);

    // Original: Create schedule
    const tx1 = await originalVesting.createVestingSchedule(
        deployer.address,
        token.address,
        amount,
        startTime,
        cliff,
        duration,
        true,
    );
    const receipt1 = await tx1.wait();
    console.log('Original - Create Schedule Gas:', receipt1.gasUsed.toString());

    // Optimized: Create schedule
    const tx2 = await optimizedVesting.createVestingSchedule(
        deployer.address,
        token.address,
        amount,
        startTime,
        cliff,
        duration,
        true,
    );
    const receipt2 = await tx2.wait();
    console.log('Optimized - Create Schedule Gas:', receipt2.gasUsed.toString());

    const createSavings = receipt1.gasUsed.sub(receipt2.gasUsed);
    const createSavingsPercent = createSavings.mul(10000).div(receipt1.gasUsed).toNumber() / 100;
    console.log('💰 Savings:', createSavings.toString(), `(${createSavingsPercent.toFixed(2)}%)`);

    results.operations.push({
        name: 'Create Schedule',
        original: receipt1.gasUsed,
        optimized: receipt2.gasUsed,
        savings: createSavings,
        savingsPercent: createSavingsPercent,
    });

    // Test 2: Compute Releasable Amount
    console.log('\n🧪 Test 2: Compute Releasable Amount (View Function)');
    console.log('-'.repeat(80));

    const scheduleIds1 = await originalVesting.getBeneficiarySchedules(deployer.address);
    const scheduleIds2 = await optimizedVesting.getBeneficiarySchedules(deployer.address);

    const gas1 = await originalVesting.estimateGas.computeReleasableAmount(scheduleIds1[0]);
    console.log('Original - Compute Gas:', gas1.toString());

    const gas2 = await optimizedVesting.estimateGas.computeReleasableAmount(scheduleIds2[0]);
    console.log('Optimized - Compute Gas:', gas2.toString());

    const computeSavings = gas1.sub(gas2);
    const computeSavingsPercent = computeSavings.mul(10000).div(gas1).toNumber() / 100;
    console.log('💰 Savings:', computeSavings.toString(), `(${computeSavingsPercent.toFixed(2)}%)`);

    // Test 3: Batch Create (Optimized Only)
    console.log('\n🧪 Test 3: Batch Create 5 Schedules (Optimized Only)');
    console.log('-'.repeat(80));

    const beneficiaries = Array(5).fill(deployer.address);
    const amounts = Array(5).fill(amount);

    await token.approve(optimizedVesting.address, amount.mul(5));

    const batchTx = await optimizedVesting.batchCreateVestingSchedules(
        beneficiaries,
        token.address,
        amounts,
        startTime + 1000,
        cliff,
        duration,
        true,
    );
    const batchReceipt = await batchTx.wait();
    console.log('Batch Create 5 Schedules Gas:', batchReceipt.gasUsed.toString());

    // Compare with 5 individual creates (estimate)
    const estimatedIndividual = receipt1.gasUsed.mul(5);
    const batchSavings = estimatedIndividual.sub(batchReceipt.gasUsed);
    const batchSavingsPercent = batchSavings.mul(10000).div(estimatedIndividual).toNumber() / 100;

    console.log('Estimated Individual Creates (5x):', estimatedIndividual.toString());
    console.log('💰 Batch Savings:', batchSavings.toString(), `(${batchSavingsPercent.toFixed(2)}%)`);

    results.operations.push({
        name: 'Batch Create (5)',
        original: estimatedIndividual,
        optimized: batchReceipt.gasUsed,
        savings: batchSavings,
        savingsPercent: batchSavingsPercent,
    });

    // Test 4: Get Vesting Info (Optimized Only - New Feature)
    console.log('\n🧪 Test 4: Get Vesting Info (Enhanced Query - Optimized Only)');
    console.log('-'.repeat(80));

    const infoGas = await optimizedVesting.estimateGas.getVestingInfo(scheduleIds2[0]);
    console.log('Get Vesting Info Gas:', infoGas.toString());
    console.log('✨ This single call replaces multiple view calls in the original version');

    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(80));

    console.log('\n📋 Deployment Gas:');
    console.log(`   Original:  ${results.deployment.original.toString().padStart(10)} gas`);
    console.log(`   Optimized: ${results.deployment.optimized.toString().padStart(10)} gas`);
    const deployDiff = results.deployment.original.sub(results.deployment.optimized);
    const deployPercent = deployDiff.mul(10000).div(results.deployment.original).toNumber() / 100;
    console.log(`   Savings:   ${deployDiff.toString().padStart(10)} gas (${deployPercent.toFixed(2)}%)`);

    console.log('\n📋 Operation Gas Comparison:');
    console.log('┌─────────────────────────┬────────────┬────────────┬────────────┬──────────┐');
    console.log('│ Operation               │ Original   │ Optimized  │ Savings    │ % Saved  │');
    console.log('├─────────────────────────┼────────────┼────────────┼────────────┼──────────┤');

    results.operations.forEach((op) => {
        console.log(
            `│ ${op.name.padEnd(23)} │ ` +
                `${op.original.toString().padStart(10)} │ ` +
                `${op.optimized.toString().padStart(10)} │ ` +
                `${op.savings.toString().padStart(10)} │ ` +
                `${op.savingsPercent.toFixed(2).padStart(7)}% │`,
        );
    });

    console.log('└─────────────────────────┴────────────┴────────────┴────────────┴──────────┘');

    // Real-world cost comparison
    console.log('\n💰 Real-World Cost Impact (at $2,000 ETH, 50 gwei):');
    console.log('-'.repeat(80));

    const ethPrice = 2000;
    const gasPrice = 50; // gwei

    console.log('\nExample: Creating 100 Vesting Schedules');

    const individualCost = receipt1.gasUsed.mul(100).mul(gasPrice).div(1e9);
    const individualUSD = individualCost.mul(ethPrice).div(1e18);
    console.log(
        `   Individual Creates (100x): ${hre.ethers.utils.formatEther(individualCost)} ETH ($${individualUSD
            .toNumber()
            .toFixed(2)})`,
    );

    const batchCount = 20; // 100 schedules / 5 per batch
    const batchCost = batchReceipt.gasUsed.mul(batchCount).mul(gasPrice).div(1e9);
    const batchUSD = batchCost.mul(ethPrice).div(1e18);
    console.log(
        `   Batch Creates (20 batches): ${hre.ethers.utils.formatEther(batchCost)} ETH ($${batchUSD
            .toNumber()
            .toFixed(2)})`,
    );

    const totalSavings = individualCost.sub(batchCost);
    const totalSavingsUSD = individualUSD.sub(batchUSD);
    console.log(
        `   💰 Total Savings: ${hre.ethers.utils.formatEther(totalSavings)} ETH ($${totalSavingsUSD
            .toNumber()
            .toFixed(2)})`,
    );

    console.log('\n' + '='.repeat(80));
    console.log('✅ Gas comparison complete!');
    console.log('='.repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
