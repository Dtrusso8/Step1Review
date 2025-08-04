# Deployment Instructions

## Quick Setup for GitHub Pages

### 1. Create a GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `drag-and-drop-activities`
3. Make it public (required for GitHub Pages)

### 2. Initialize Git and Connect to GitHub
```bash
# Initialize git in your project folder
git init

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit"

# Push to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"

### 4. Deploy Updates
Whenever you make changes, run one of these:

**On Windows:**
```bash
deploy.bat
```

**On Mac/Linux:**
```bash
./deploy.sh
```

**Or manually:**
```bash
git add .
git commit -m "Update activities"
git push origin main
```

### 5. Your App URL
Your app will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## Adding New Activities

1. **Add your activity folder** to `Activities/`
2. **Update `activities.json`** to include the new activity
3. **Run the deployment script** to push changes

## Troubleshooting

- **If GitHub Pages isn't working**: Check that your repository is public
- **If activities don't show up**: Make sure `activities.json` is updated and committed
- **If images don't load**: Check that file paths in `activities.json` are correct 