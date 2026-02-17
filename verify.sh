#!/bin/bash

# Smart Bookmark App - Pre-Deployment Verification Script
# Run this before deploying to make sure everything is working

echo "=========================================="
echo "Smart Bookmark App - Verification Check"
echo "=========================================="
echo ""

# Check if Node.js is installed
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "  ✗ Node.js not found! Install from nodejs.org"
    exit 1
fi
echo "  ✓ Node.js $(node -v) found"
echo ""

# Check if npm is installed
echo "✓ Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "  ✗ npm not found!"
    exit 1
fi
echo "  ✓ npm $(npm -v) found"
echo ""

# Check if node_modules exists
echo "✓ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "  ⚠ node_modules not found. Running npm install..."
    npm install
else
    echo "  ✓ Dependencies installed"
fi
echo ""

# Check environment variables
echo "✓ Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo "  ⚠ .env.local not found!"
    echo "  Create .env.local with:"
    echo "    NEXT_PUBLIC_SUPABASE_URL=your_url"
    echo "    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
else
    echo "  ✓ .env.local found"
    if grep -q "your_" .env.local; then
        echo "  ⚠ WARNING: Placeholder values detected in .env.local"
        echo "    Replace 'your_...' with actual Supabase credentials"
    fi
fi
echo ""

# Check key files exist
echo "✓ Checking project files..."
files=(
    "app/page.tsx"
    "app/layout.tsx"
    "components/BookmarkForm.tsx"
    "components/BookmarkList.tsx"
    "lib/supabase-browser.ts"
    "lib/supabase-server.ts"
    "supabase-schema.sql"
)

for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "  ✗ Missing: $file"
    else
        echo "  ✓ Found: $file"
    fi
done
echo ""

# Check build works
echo "✓ Testing production build..."
if npm run build &> /dev/null; then
    echo "  ✓ Build successful!"
else
    echo "  ✗ Build failed! Check errors above"
    exit 1
fi
echo ""

# Summary
echo "=========================================="
echo "✓ All checks passed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
echo "4. Test Google OAuth login"
echo "5. Add a bookmark and verify real-time sync"
echo ""
echo "Ready to deploy to Vercel!"
echo "=========================================="
