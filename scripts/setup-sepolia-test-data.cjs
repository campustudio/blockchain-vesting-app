const hre = require('hardhat');

async function main() {
    console.log('🚀 Setting up test vesting schedules on Sepolia...\n');

    // Sepolia Contract addresses
    const VESTING_ADDRESS = '0x50DD7096fAB68990Ef61430FF8b6a25D0054A857';
    const PROJ_TOKEN_ADDRESS = '0x334ea69ed935F5c46D777506c83262DBAD59931A';

    const [deployer] = await hre.ethers.getSigners();
    console.log('Setting up with account:', deployer.address);

    // Get contract instances
    const vesting = await hre.ethers.getContractAt('TokenVesting', VESTING_ADDRESS);
    const projToken = await hre.ethers.getContractAt('MockToken', PROJ_TOKEN_ADDRESS);

    // Beneficiary address (using deployer for testing)
    const beneficiary = deployer.address;

    console.log('\n📝 Creating vesting schedules...\n');

    // 1. Pending PROJ Token Vesting (500K tokens, 1 year duration, 3 month cliff)
    const projAmount = hre.ethers.utils.parseEther('500000');
    console.log('Approving PROJ tokens...');
    const approveTx = await projToken.approve(VESTING_ADDRESS, projAmount);
    await approveTx.wait();
    console.log('✅ Approval confirmed');

    console.log('Creating PROJ vesting schedule (PENDING - 3 month cliff)...');
    const now = Math.floor(Date.now() / 1000);
    const createTx = await vesting.createVestingSchedule(
        beneficiary,
        PROJ_TOKEN_ADDRESS,
        projAmount,
        now,
        7776000, // 90 days cliff
        31536000, // 365 days duration
        true, // revocable
    );
    await createTx.wait();
    console.log('✅ PROJ vesting schedule created');

    console.log('\n📋 Test data setup complete!');
    console.log('='.repeat(60));
    console.log('Beneficiary:', beneficiary);
    console.log('Vesting Contract:', VESTING_ADDRESS);
    console.log('PROJ Token:', PROJ_TOKEN_ADDRESS);
    console.log('Total schedules created: 1');
    console.log('- 1 pending PROJ (3 month cliff, 1 year duration)');
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
