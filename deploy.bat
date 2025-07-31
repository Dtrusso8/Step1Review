@echo off
echo 🚀 Starting deployment to GitHub...

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git remote add origin https://github.com/Dtrusso8/Step1Review.git
    pause
    exit /b 1
)

REM Add all files
echo 📁 Adding all files...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Update drag-and-drop activities - %date% %time%"

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main

echo ✅ Deployment complete!
echo 🌐 Your app should be available at: https://dtrusso8.github.io/Step1Review/
pause 