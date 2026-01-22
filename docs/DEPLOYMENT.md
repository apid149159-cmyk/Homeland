# Deployment Guide for Homeland Event

## 1. Build for Production

To create a production-ready build, run:

```bash
npm run build
```

This will generate a `dist` folder containing:
- `index.html` (Entry point)
- `assets/` (Compiled JavaScript and CSS)

## 2. Preview Production Build

Before deploying, you can test the production build locally:

```bash
npm run preview
```

## 3. Deployment Options

### Option A: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts.

### Option B: Netlify
1. Drag and drop the `dist` folder to the Netlify Drop zone.

### Option C: GitHub Pages
1. Push code to GitHub.
2. Configure GitHub Actions to deploy the `dist` folder.

### Option D: Firebase Hosting (Required for .web.app domain) -> **CURRENTLY CONFIGURED**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize/Link Project:
   - Create a project named "**Homelandevent**" at [Firebase Console](https://console.firebase.google.com/)
   - Run `firebase use --add` and select your project.
4. Deploy:
   ```bash
   npm run build
   firebase deploy
   ```
   *Note: `vite.config.ts` and `firebase.json` are already configured for this.*

## 4. Environment Variables
Ensure your hosting provider has the following environment variables set:
- `GEMINI_API_KEY`: Your Google Gemini API Key

## 5. Troubleshooting
- **White Screen**: Check console for errors. Ensure `base` path in vite config matches your hosting path.
- **API Errors**: Verify `GEMINI_API_KEY` is set correctly in the hosting provider's dashboard.
