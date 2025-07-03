#!/bin/bash

# Ice Calendar Worker Deployment Script
# This script helps deploy the Cloudflare Worker with proper configuration

set -e

echo "🧊 Ice Calendar Worker Deployment"
echo "================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

# Check if user is logged in
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run:"
    echo "   wrangler login"
    exit 1
fi

echo "✅ Authenticated with Cloudflare"

# Check if KV namespace exists
echo "🗄️  Checking KV namespace configuration..."
KV_ID=$(grep -o 'id = "[^"]*"' wrangler.toml | head -1 | cut -d'"' -f2)

if [ "$KV_ID" = "your-kv-namespace-id" ]; then
    echo "⚠️  KV namespace not configured. Creating..."
    
    echo "Creating production KV namespace..."
    wrangler kv:namespace create "CALENDAR_EVENTS"
    
    echo "Creating preview KV namespace..."
    wrangler kv:namespace create "CALENDAR_EVENTS" --preview
    
    echo ""
    echo "⚠️  Please update wrangler.toml with the KV namespace IDs printed above"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ KV namespace configured"

# Type check
echo "🔍 Running type check..."
npm run type-check

echo "✅ Type check passed"

# Deploy
echo "🚀 Deploying to Cloudflare..."
npm run deploy

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure email routing in Cloudflare Dashboard"
echo "2. Set up email forwarding to your worker"
echo "3. Test by sending an email to your configured address"
echo "4. Subscribe to your calendar at: https://your-worker.your-subdomain.workers.dev/calendar.ics"
echo ""
echo "For detailed setup instructions, see setup.md"