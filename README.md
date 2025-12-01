# 🔒 Blockchain Vesting Platform

> **A professional token vesting schedule management platform with modern UI and Web3 integration**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://blockchain-vesting-app-ihvy.vercel.app)
[![Angular](https://img.shields.io/badge/Angular-16-red)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38bdf8)](https://tailwindcss.com/)

## 🎯 Quick Start for Reviewers

**📖 [View Complete Demo Guide](./DEMO_GUIDE.md)** - Step-by-step instructions for testing the application

**Live Demo:** [https://blockchain-vesting-app-ihvy.vercel.app](https://blockchain-vesting-app-ihvy.vercel.app)

**Quick Test (3 steps):**

1. Install [MetaMask](https://metamask.io/download/) browser extension
2. Switch to **Sepolia testnet** in MetaMask
3. Click "Connect Wallet" on the demo site

---

## 📋 About

A demonstration web application showcasing token vesting schedule management with a clean, professional interface. This project demonstrates understanding of token economics, financial calculations, and modern Web3 development practices.

### What is Token Vesting?

Token vesting is a mechanism used in blockchain projects to distribute tokens over time rather than all at once. Common use cases:

- **Team & Advisors**: Long-term commitment incentives
- **Investors**: Preventing immediate token dumps
- **Community**: Fair and controlled distribution

### Platform Capabilities

- 📊 **Dashboard**: Real-time statistics and overview
- 📅 **Schedule Management**: Track multiple vesting agreements
- 💰 **Claim Interface**: Interactive token claiming
- 📈 **Progress Tracking**: Visual timeline and progress bars
- 🔍 **Filtering**: Status-based schedule filtering
- 🌓 **Dark Mode**: Full dark theme support

---

## ✨ Features

### 📊 **Dashboard**

- Overview of all vesting schedules
- Real-time statistics (Total Locked, Claimable, Claimed)
- Visual progress indicators
- Status-based categorization (Active, Pending, Completed)

### 📅 **Vesting Schedules**

- Detailed list of all vesting agreements
- Interactive claim functionality
- Progress tracking with timeline visualization
- Filter by status

### 🎨 **User Experience**

- Modern, responsive design
- Dark mode support
- Smooth animations and transitions
- Mobile-friendly interface

### 🔧 **Technical Features**

- TypeScript type safety
- RxJS reactive state management
- Modular component architecture
- Comprehensive utility functions
- Mock data for demonstration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/blockchain-vesting-app.git
cd blockchain-vesting-app

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:4200` to see the application.

### Build for Production

```bash
# Create production build
npm run build

# Output will be in dist/blockchain-vesting-app/
```

---

## 📐 Architecture

### Project Structure

```
src/app/
├── lib/
│   ├── interfaces/
│   │   └── vesting.interface.ts      # TypeScript type definitions
│   ├── services/
│   │   └── vesting/
│   │       └── vesting.service.ts    # Business logic & state management
│   ├── utils/
│   │   └── vesting.util.ts           # Calculation utilities
│   └── constants/
│       └── mock-data.constant.ts     # Demo data
│
└── pages/
    └── vesting/
        ├── dashboard/                 # Overview dashboard
        ├── schedules/                 # Detailed schedules list
        └── index.ts                   # Routing configuration
```

### Design Patterns

- **Service Layer**: Centralized business logic and state management
- **Reactive State**: RxJS BehaviorSubjects for real-time updates
- **Standalone Components**: Modern Angular 16 pattern
- **Utility Functions**: Pure functions for calculations
- **Type Safety**: Comprehensive TypeScript interfaces

---

## 🎯 Core Algorithms

### 1. **Vesting Calculation**

```typescript
// Calculate vested amount based on time elapsed
const vestedAmount = (totalAmount * timeElapsed) / totalDuration;
const claimableAmount = vestedAmount - alreadyClaimed;
```

### 2. **Cliff Period**

A initial period where no tokens vest:

```typescript
if (currentTime < startTime + cliffPeriod) {
  return 0; // No tokens vested during cliff
}
```

### 3. **Linear Vesting**

Tokens vest linearly over time after the cliff:

```
Total: 1,000,000 tokens
Duration: 24 months
Vesting rate: ~41,667 tokens/month
```

### 4. **Status Management**

- **Pending**: Vesting hasn't started yet
- **Active**: Currently vesting
- **Completed**: Fully vested
- **Revoked**: Cancelled by admin

---

## 🛠️ Technology Stack

| Technology          | Purpose                                       |
| ------------------- | --------------------------------------------- |
| **Angular 16**      | Frontend framework with standalone components |
| **TypeScript 5.0**  | Type-safe development                         |
| **RxJS 7.8**        | Reactive state management                     |
| **TailwindCSS 3.3** | Utility-first styling                         |
| **ethers.js 5**     | Ethereum blockchain interaction               |
| **Iconify**         | Modern icon system                            |

---

## 🔄 Future Enhancements

### ✅ Completed: Blockchain Integration

- [x] Connected to Sepolia testnet
- [x] Deployed vesting smart contract
- [x] Read real on-chain data
- [x] Execute actual claim transactions
- [x] Multi-account support
- [x] Network switching detection

### Phase 2: Advanced Features

- [ ] Multi-token support
- [ ] CSV export of vesting data
- [ ] Email notifications for claims
- [ ] Admin dashboard for creating vesting schedules
- [ ] Revocation functionality

---

## 📝 Live Test Data on Sepolia

The application is connected to real smart contracts deployed on Sepolia testnet:

**Smart Contracts:**

- **Vesting Contract:** `0x50DD7096fAB68990Ef61430FF8b6a25D0054A857`
- **PROJ Token:** `0x334ea69ed935F5c46D777506c83262DBAD59931A`

**Test Account:** `0x006Ac68Ea58Ea14cEd038bE25350A44929ADbAda`

**Sample Vesting Schedules (~10 schedules):**

| Token | Status  | Total Amount | Cliff | Duration | Notes                 |
| ----- | ------- | ------------ | ----- | -------- | --------------------- |
| PROJ  | Active  | 250,000      | None  | 1yr      | Started 30 days ago   |
| PROJ  | Pending | 500,000      | 3mo   | 1yr      | Waiting for cliff     |
| PROJ  | Active  | 750,000      | 1mo   | 1yr      | Cliff passed, vesting |
| PROJ  | Pending | 1,000,000    | 6mo   | 2yr      | Long-term vesting     |
| PROJ  | Active  | 2,000,000    | 2wk   | 1yr      | 90 days into vesting  |
| ...   | ...     | ...          | ...   | ...      | More test scenarios   |

**View on Etherscan:**

- [Vesting Contract](https://sepolia.etherscan.io/address/0x50DD7096fAB68990Ef61430FF8b6a25D0054A857)

---

## 🧪 Testing

### Manual Testing Checklist

- [x] All routes accessible
- [x] Statistics calculate correctly
- [x] Progress bars display accurately
- [x] Claim functionality works
- [x] Filters apply properly
- [x] Dark mode toggles
- [x] Mobile responsive
- [x] Error states display
- [x] Success messages show
- [x] Loading states visible

### Future Automated Testing

- Unit tests for calculation utilities
- Service integration tests
- Component rendering tests
- E2E user flow tests

---

## 📊 Project Metrics

- **TypeScript Files**: ~15 files
- **Lines of Code**: ~2,500 lines
- **Components**: 2 main components
- **Services**: 1 core service
- **Utility Functions**: 7 functions
- **Bundle Size**: < 500KB (gzipped)

---

## 🎓 Learning Resources

- [Token Vesting Explained](https://www.investopedia.com/terms/v/vesting.asp)
- [Smart Contract Vesting Patterns](https://docs.openzeppelin.com/contracts/4.x/api/finance#VestingWallet)
- [Angular Best Practices](https://angular.io/guide/styleguide)
- [ethers.js Documentation](https://docs.ethers.org/)

---

## 📄 License

MIT License - feel free to use this project as a reference or starting point for your own vesting platform.

---

## 👤 Author

Created as a demonstration of Web3 development capabilities and understanding of token economics.

**Portfolio Projects:**

- [MetaMask Integration Test](../angular-test) - Basic wallet connection
- [Vesting Platform](.) - Advanced token management (this project)

---

## � Key Takeaways

This project demonstrates:

### Technical Skills

- Complex state management with RxJS
- Advanced TypeScript usage and type safety
- Reactive programming patterns
- Component architecture design
- Financial calculations with BigInt

### Business Understanding

- Token economics and vesting mechanisms
- User experience for financial interfaces
- Data visualization best practices
- Status-based workflow design

### Development Practices

- Clean code principles
- Comprehensive documentation
- Git workflow and deployment
- ESLint configuration compliance

**Note**: This is a demonstration project deployed on Sepolia testnet. For production use on mainnet, it would require:

- Security audits
- Gas optimization
- Enhanced error handling
- Mainnet deployment
- Admin controls

---

## 📞 Contact

If you have questions about the implementation or design decisions, please feel free to reach out!
