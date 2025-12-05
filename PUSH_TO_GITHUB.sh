#!/bin/bash

# Push Universal Flashcards PWA to GitHub
# Repository: https://github.com/MasoudSade/Universal-Flashcard-App-Public-PWA

echo "🚀 Pushing PWA v3.3.0 to GitHub..."

# Navigate to PWA folder
cd "$(dirname "$0")"

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📁 Adding files..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "Initial commit: Universal Flashcards PWA v3.3.0

Features:
- Mobile-responsive design (v3.3)
- Hybrid cloud-master architecture (v3.1)
- Unrestricted category management (v3.2)
- Offline support with service worker
- Touch-friendly interface (44px+ touch targets)
- iOS Safari optimizations (no zoom)
- Multi-language TTS support
- Firebase cloud sync
- PWA installable on mobile devices

Technical:
- No horizontal scroll on any device
- Responsive breakpoints (768px, 480px, 360px)
- Landscape orientation support
- Service worker caching
- Manifest.json configured
- All PWA icons included"

# Add remote if not exists
if ! git remote | grep -q "origin"; then
    echo "🔗 Adding remote repository..."
    git remote add origin https://github.com/MasoudSade/Universal-Flashcard-App-Public-PWA.git
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo ""
echo "✅ PWA deployed successfully!"
echo "🌐 Your PWA will be available at:"
echo "   https://MasoudSade.github.io/Universal-Flashcard-App-Public-PWA/flashcard.html"
echo ""
echo "📱 Now enable GitHub Pages:"
echo "   1. Go to: https://github.com/MasoudSade/Universal-Flashcard-App-Public-PWA/settings/pages"
echo "   2. Source: main branch, / (root)"
echo "   3. Click Save"
echo "   4. Wait 1-2 minutes"
echo ""
echo "🎉 Done!"
