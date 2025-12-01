# 🚀 Deployment Guide

## Quick Deploy to Vercel

### Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Project pushed to GitHub

---

## Step-by-Step Deployment

### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "feat: complete vesting platform implementation"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/blockchain-vesting-app.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy on Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect Angular configuration
5. Verify settings:
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/blockchain-vesting-app/browser`
6. Click "Deploy"
7. Wait 2-3 minutes for deployment to complete
8. Your app will be live at: `https://blockchain-vesting-app.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? blockchain-vesting-app
# - Directory? ./ (press Enter)
# - Want to override settings? No

# For production deployment
vercel --prod
```

---

## Vercel Configuration

The project includes a `vercel.json` file with optimal settings:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/blockchain-vesting-app/browser",
  "framework": "angular",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration ensures:

- ✅ Correct build output directory
- ✅ SPA routing works properly
- ✅ All routes redirect to index.html

---

## Post-Deployment

### Update README with Live Demo URL

After deployment, update `README.md`:

```markdown
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://YOUR-APP.vercel.app)
```

### Test the Deployment

1. **Homepage**: Visit the live URL
2. **Navigation**: Click "Vesting Platform Demo"
3. **Dashboard**: Verify statistics display correctly
4. **Schedules**: Navigate to schedules page
5. **Claim**: Test the claim functionality
6. **Dark Mode**: Toggle theme and verify
7. **Mobile**: Test on mobile devices

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push

# Vercel will automatically detect and deploy
# - Preview deployments for feature branches
# - Production deployment for main branch
```

---

## Custom Domain (Optional)

### Add Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `vesting.yourdomain.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

---

## Environment Variables

If you add real blockchain integration later:

1. Go to Project Settings → Environment Variables
2. Add variables:
   ```
   NEXT_PUBLIC_INFURA_KEY=your_key
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   ```
3. Redeploy to apply changes

---

## Troubleshooting

### Build Fails

**Error**: `Cannot find module '@angular/core'`
**Solution**:

```bash
npm install
npm run build
```

**Error**: `Output directory not found`
**Solution**: Update `vercel.json` output path

### Routing Issues

**Problem**: 404 on page refresh
**Solution**: Ensure `vercel.json` has proper rewrites configuration

### Slow Build Times

**Issue**: Build takes > 5 minutes
**Solutions**:

- Reduce unused dependencies
- Enable build caching
- Check for circular dependencies

---

## Performance Optimization

### Before Deploying to Production

```bash
# Check bundle size
npm run build
ls -lh dist/blockchain-vesting-app/browser

# Run production build locally
npm run build
npx http-server dist/blockchain-vesting-app/browser
```

### Lighthouse Audit

After deployment, run Lighthouse:

1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Generate report
4. Target scores:
   - Performance: 90+
   - Accessibility: 100
   - Best Practices: 90+
   - SEO: 90+

---

## Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] README.md is updated
- [ ] vercel.json is configured
- [ ] All routes work in development
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Build succeeds locally
- [ ] Deployed to Vercel
- [ ] Live URL works
- [ ] All pages accessible
- [ ] Claim functionality tested

---

## Share with Interviewer

When ready to share:

```markdown
# Vesting Platform Demo

🔗 **Live Demo**: https://blockchain-vesting-app.vercel.app
📂 **Source Code**: https://github.com/YOUR_USERNAME/blockchain-vesting-app

## Quick Tour

1. Visit the live demo
2. Click "Vesting Platform Demo" on homepage
3. Explore the Dashboard
4. Navigate to Schedules
5. Try the Claim functionality

## Technical Highlights

- Angular 16 with standalone components
- RxJS reactive state management
- Complex vesting calculations
- Modern UI with TailwindCSS
- Mock data demonstrating various scenarios
```

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [Vercel Angular Template](https://vercel.com/templates/angular)

---

**🎉 Your vesting platform is now live and ready to impress!**
