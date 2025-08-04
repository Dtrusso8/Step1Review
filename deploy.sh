#!/bin/bash

# Deployment script for drag-and-drop activities
# This script will commit and push all changes to GitHub

echo "🚀 Starting deployment to GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git remote add origin https://github.com/Dtrusso8/Step1Review.git"
    exit 1
fi

# Add all files
echo "📁 Adding all files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Update drag-and-drop activities - $(date)"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://dtrusso8.github.io/Step1Review/" 