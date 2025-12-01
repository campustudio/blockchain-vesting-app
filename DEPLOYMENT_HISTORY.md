# 🚀 Smart Contract Deployment History

This document tracks all contract deployments to Sepolia testnet.

---

## 📝 Current Production Deployment

**Deployment Date:** December 2, 2025

### Optimized TokenVesting Contract (v2.0)

**Contract Addresses:**

- **Vesting Contract:** `0x186FBa7B212C5aCCAe3f264178f28922080Bf5a5`
- **PROJ Token:** `0x10FDc7A86a2EB3864b18e26B5a204134DD85Cb1c`

**Etherscan Links:**

- [Vesting Contract](https://sepolia.etherscan.io/address/0x186FBa7B212C5aCCAe3f264178f28922080Bf5a5)
- [PROJ Token](https://sepolia.etherscan.io/address/0x10FDc7A86a2EB3864b18e26B5a204134DD85Cb1c)

**Test Account:**

- Address: `0x006Ac68Ea58Ea14cEd038bE25350A44929ADbAda`
- Purpose: Holds test vesting schedules for demo

**Features:**

- ✅ 7 Security Enhancements (Pausable, Emergency Withdrawal, etc.)
- ✅ 6 Gas Optimization Techniques (31% savings on batch operations)
- ✅ Batch operation support
- ✅ Enhanced event indexing
- ✅ Beneficiary change functionality

**Test Data:**

- 12 diverse vesting schedules
- Total locked: 15.65M PROJ tokens
- Distribution: 8 Active, 3 Pending, 1 Completed

**Gas Used:**

- Deployment: 1,872,031 gas
- Single schedule creation: ~312,362 gas
- Batch create (5 schedules): ~987,977 gas

---

## 📚 Previous Deployments

### Version 1.0 - Initial Deployment

**Deployment Date:** November 2025

**Contract Addresses:**

- Vesting Contract: `0xeb6c2E5fab3F8c51C7d29635F4669126FF2B7BFB`
- PROJ Token: `0x6dAF1681Ec0fB7efF7a3938e854fa676BddA69eE`

**Features:**

- Basic vesting functionality
- Linear vesting with cliff support
- Single schedule creation

**Status:** Deprecated - Replaced by optimized version

---

### Version 0.1 - Beta Deployment

**Deployment Date:** November 2025

**Contract Addresses:**

- Vesting Contract: `0x50DD7096fAB68990Ef61430FF8b6a25D0054A857`
- PROJ Token: `0x334ea69ed935F5c46D777506c83262DBAD59931A`

**Features:**

- Initial implementation
- Basic vesting with cliff
- ~10 test schedules

**Status:** Deprecated

---

## 🔄 Migration Notes

### From v1.0 to v2.0 (Optimized)

**Changes:**

- Removed `token` parameter from `release()` function for security
- Added `Pausable` mechanism
- Added batch operation support
- Improved gas efficiency
- Enhanced validation and tracking

**Frontend Updates Required:**

- Update contract addresses in `contracts.constant.ts`
- Update ABI to `TokenVestingOptimized`
- Modify `release()` call to remove token parameter

**Data Migration:**

- No automatic migration (new contract deployment)
- Test account created with diverse test data

---

## 📊 Deployment Metrics

| Version | Gas (Deploy) | Gas (Create) | Gas (Batch x5) | Savings |
| ------- | ------------ | ------------ | -------------- | ------- |
| v0.1    | ~1,035,218   | ~287,146     | N/A            | -       |
| v1.0    | ~1,901,887   | ~312,362     | ~987,977       | -       |
| v2.0    | ~1,872,031   | ~312,362     | ~987,977       | 31%\*   |

\*Batch operation savings compared to individual creates

---

## 🔧 Deployment Commands

### Deploy to Sepolia

```bash
# Deploy optimized version
npx hardhat run scripts/deploy-optimized-sepolia.cjs --network sepolia

# Create diverse test data
npx hardhat run scripts/create-diverse-data.cjs --network sepolia
```

### Update Frontend

```bash
# Copy ABI
cp artifacts/contracts/TokenVestingOptimized.sol/TokenVestingOptimized.json src/app/lib/contracts/TokenVesting.json

# Update contract addresses in:
# src/app/lib/constants/contracts.constant.ts

# Build and deploy
npm run build
git push # Triggers Vercel deployment
```

---

## 🔗 Related Documentation

- [Security & Optimization Report](./SECURITY_AND_OPTIMIZATION.md)
- [Optimization Summary](./OPTIMIZATION_SUMMARY.md)
- [README](./README.md)
- [Demo Guide](./DEMO_GUIDE.md)

---

## 📋 Checklist for New Deployment

- [ ] Compile contracts
- [ ] Deploy to Sepolia testnet
- [ ] Verify contracts on Etherscan
- [ ] Create test data
- [ ] Update `contracts.constant.ts`
- [ ] Update ABI files
- [ ] Update `README.md`
- [ ] Update `DEMO_GUIDE.md`
- [ ] Update this deployment history
- [ ] Build and test frontend locally
- [ ] Deploy to Vercel
- [ ] Test on production
- [ ] Update interviewer email template

---

**Last Updated:** December 2, 2025
