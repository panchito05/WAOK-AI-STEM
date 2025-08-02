#!/bin/bash

# Firebase App Hosting Deployment Script
echo "🚀 Starting Firebase App Hosting deployment..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first."
    exit 1
fi

# Set project
echo "📁 Setting Firebase project..."
firebase use waok-ai-stem

# Build the application
echo "🔨 Building the application..."
npm run build

# Deploy to Firebase App Hosting
echo "🚀 Deploying to Firebase App Hosting..."
firebase deploy --only apphosting

echo "✅ Deployment complete!"
echo "🌐 Visit your app at: https://waok-ai-stem--waok-ai-stem.us-central1.hosted.app"