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
1. Update `vite.config.ts` to include your repository base URL:
   ```ts
   export default defineConfig({
     base: '/repository-name/', 
     // ...
   })
   ```
2. Push code to GitHub.
3. Configure GitHub Actions to deploy the `dist` folder.

## 4. Environment Variables
Ensure your hosting provider has the following environment variables set:
- `GEMINI_API_KEY`: Your Google Gemini API Key

## 5. Troubleshooting
- **White Screen**: Check console for errors. Ensure `base` path in vite config matches your hosting path.
- **API Errors**: Verify `GEMINI_API_KEY` is set correctly in the hosting provider's dashboard.
