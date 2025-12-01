# 🔗 Blockchain Integration Guide

## 📋 Overview

This guide covers the integration of real blockchain functionality into the Vesting Platform, replacing mock data with actual smart contracts on Sepolia testnet.

---

## 🏗️ Smart Contracts

### TokenVesting.sol

Main vesting contract that manages token vesting schedules.

**Key Features**:

- Linear vesting with cliff period support
- Multiple vesting schedules per beneficiary
- Revocable vesting support
- ERC20 token compatible
- Owner-controlled schedule creation

**Core Functions**:

- `createVestingSchedule()` - Create new vesting schedule
- `release()` - Claim vested tokens
- `revoke()` - Revoke vesting (if revocable)
- `computeReleasableAmount()` - Calculate claimable amount
- `getBeneficiarySchedules()` - Get all schedules for a user

### MockToken.sol

Simple ERC20 token for testing purposes.

**Features**:

- Standard ERC20 implementation
- Mintable by owner
- Used for creating test tokens (PROJ, TEAM, EARLY, ADVISOR, SEED)

---

## 🚀 Deployment Steps

### 1. Setup Environment

Create `.env` file:

```bash
cp .env.example .env
```

Fill in your values:

```bash
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ Security Warning**: Never commit `.env` file or expose private keys!

### 2. Get Test ETH

Get Sepolia ETH from faucets:

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

### 3. Compile Contracts

```bash
npx hardhat compile
```

Expected output:

```
Compiled 5 Solidity files successfully
```

### 4. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Expected output:

```
Deploying contracts with the account: 0x...
Account balance: ...

📝 Deploying Mock Tokens...
✅ PROJ Token deployed to: 0x...
✅ TEAM Token deployed to: 0x...
✅ EARLY Token deployed to: 0x...
✅ ADVISOR Token deployed to: 0x...
✅ SEED Token deployed to: 0x...

📝 Deploying TokenVesting Contract...
✅ TokenVesting deployed to: 0x...

📋 Deployment Summary:
============================================================
TokenVesting:   0x...
PROJ Token:     0x...
TEAM Token:     0x...
EARLY Token:    0x...
ADVISOR Token:  0x...
SEED Token:     0x...
============================================================
```

### 5. Save Contract Addresses

Update `.env` with deployed addresses:

```bash
VESTING_CONTRACT_ADDRESS=0x...
PROJ_TOKEN_ADDRESS=0x...
TEAM_TOKEN_ADDRESS=0x...
EARLY_TOKEN_ADDRESS=0x...
ADVISOR_TOKEN_ADDRESS=0x...
SEED_TOKEN_ADDRESS=0x...
```

### 6. Verify Contracts (Optional)

```bash
npx hardhat verify --network sepolia VESTING_CONTRACT_ADDRESS

npx hardhat verify --network sepolia PROJ_TOKEN_ADDRESS "Project Token" "PROJ" "10000000000000000000000000"
```

---

## 🔄 Frontend Integration

### 1. Update Environment Variables

Add to `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  sepoliaRpcUrl: 'https://rpc.sepolia.org',
  vestingContractAddress: '0x...',
  tokenAddresses: {
    PROJ: '0x...',
    TEAM: '0x...',
    EARLY: '0x...',
    ADVISOR: '0x...',
    SEED: '0x...',
  },
  chainId: 11155111, // Sepolia
};
```

### 2. Create Contract ABIs

Copy ABIs from `artifacts/contracts/`:

```bash
mkdir -p src/app/lib/contracts/abis
cp artifacts/contracts/TokenVesting.sol/TokenVesting.json src/app/lib/contracts/abis/
cp artifacts/contracts/MockToken.sol/MockToken.json src/app/lib/contracts/abis/
```

### 3. Update Web3 Service

Modify `src/app/lib/services/web3/web3.service.ts` to:

- Connect to Sepolia
- Interact with TokenVesting contract
- Read vesting schedules from blockchain
- Execute claim transactions

### 4. Update Vesting Service

Modify `src/app/lib/services/vesting/vesting.service.ts` to:

- Fetch schedules from smart contract
- Calculate releasable amounts from on-chain data
- Submit claim transactions
- Listen for blockchain events

---

## 📝 Create Vesting Schedules

After deployment, create vesting schedules using Hardhat console:

```bash
npx hardhat console --network sepolia
```

```javascript
const vestingAddr = 'YOUR_VESTING_CONTRACT_ADDRESS';
const projTokenAddr = 'YOUR_PROJ_TOKEN_ADDRESS';

const TokenVesting = await ethers.getContractFactory('TokenVesting');
const vesting = TokenVesting.attach(vestingAddr);

const MockToken = await ethers.getContractFactory('MockToken');
const projToken = MockToken.attach(projTokenAddr);

// Approve vesting contract to spend tokens
await projToken.approve(vestingAddr, ethers.parseEther('1000000'));

// Create vesting schedule
const beneficiary = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const amount = ethers.parseEther('1000000'); // 1M tokens
const startTime = Math.floor(Date.now() / 1000) - 180 * 24 * 60 * 60; // 6 months ago
const cliff = 180 * 24 * 60 * 60; // 6 months
const duration = 730 * 24 * 60 * 60; // 24 months

await vesting.createVestingSchedule(
  beneficiary,
  projTokenAddr,
  amount,
  startTime,
  cliff,
  duration,
  true, // revocable
);
```

---

## 🧪 Testing

### Local Testing with Hardhat Network

```bash
# Start local node
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run scripts/deploy.ts --network localhost
```

### Test Contract Functions

Create `test/TokenVesting.test.ts`:

```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('TokenVesting', function () {
  it('Should create vesting schedule', async function () {
    // ... test code
  });

  it('Should release tokens after cliff', async function () {
    // ... test code
  });

  it('Should calculate correct releasable amount', async function () {
    // ... test code
  });
});
```

Run tests:

```bash
npx hardhat test
```

---

## 🔍 Verification

### Check Contract on Etherscan

Visit: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

Verify:

- ✅ Contract is deployed
- ✅ Source code is verified
- ✅ Transactions are visible
- ✅ Token balances are correct

### Check Wallet Connection

1. Open app: http://localhost:4200
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Switch to Sepolia network
5. Check wallet address displays correctly

### Check Vesting Data

1. Navigate to /vesting/dashboard
2. Verify schedules load from blockchain
3. Check amounts match contract data
4. Verify progress calculations
5. Test claim functionality

---

## 🐛 Troubleshooting

### "Insufficient funds" Error

- Get more Sepolia ETH from faucets
- Check wallet balance: `npx hardhat run scripts/checkBalance.ts --network sepolia`

### "Network mismatch" Error

- Switch MetaMask to Sepolia network
- Check frontend environment.chainId = 11155111

### "No schedules found" Error

- Verify contract address in .env
- Check schedules were created for your wallet address
- Confirm wallet is connected

### "Transaction failed" Error

- Check gas price settings
- Verify token approvals
- Check contract has sufficient tokens
- Review transaction on Sepolia Etherscan

---

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Sepolia Testnet Info](https://sepolia.dev/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

---

## ✅ Integration Checklist

### Smart Contracts

- [x] TokenVesting.sol created
- [x] MockToken.sol created
- [x] Hardhat configured
- [x] Deploy script created
- [ ] Contracts deployed to Sepolia
- [ ] Contracts verified on Etherscan
- [ ] Vesting schedules created

### Frontend

- [ ] Environment variables configured
- [ ] Contract ABIs imported
- [ ] Web3Service updated for blockchain
- [ ] VestingService reads from contract
- [ ] Claim transactions working
- [ ] Event listeners implemented
- [ ] Error handling added

### Testing

- [ ] Local Hardhat tests pass
- [ ] Sepolia testnet deployment successful
- [ ] Frontend connects to MetaMask
- [ ] Vesting data loads correctly
- [ ] Claim transactions execute
- [ ] UI updates after transactions

---

## 🎉 Next Steps

1. **Deploy contracts to Sepolia**
2. **Create test vesting schedules**
3. **Update frontend to read from blockchain**
4. **Test end-to-end flow**
5. **Add transaction history**
6. **Implement event listeners**
7. **Enhance error handling**
8. **Add loading states**

---

**Ready to deploy? Let's go! 🚀**
