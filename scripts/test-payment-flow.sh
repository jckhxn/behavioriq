#!/bin/bash

# Quick Test Script for $97 Assessment Payment Flow
# Run this script to open the test flow in your browser

echo "🧪 Starting $97 Assessment Payment Test Flow"
echo "=============================================="
echo ""

# Check if dev server is running
if ! lsof -i :3000 -sTCP:LISTEN > /dev/null 2>&1; then
    echo "❌ Development server is not running!"
    echo "   Please run: npm run dev"
    exit 1
fi

echo "✅ Development server is running on http://localhost:3000"
echo ""

# Test URLs
TRIAL_URL="http://localhost:3000/trial-assessment"
CONVERSATIONAL_TRIAL_URL="http://localhost:3000/conversational-trial"
STRIPE_DASHBOARD="https://dashboard.stripe.com/test/payments"

echo "📝 Test Steps:"
echo "1. Complete trial assessment"
echo "2. View results page"
echo "3. Click 'Get Your Full AI Report - \$97'"
echo "4. Fill in account details (new users)"
echo "5. Use test card: 4242 4242 4242 4242"
echo "6. Complete payment"
echo ""

echo "🎯 Opening trial assessment..."
open "$TRIAL_URL"

echo ""
echo "📊 You can also view payments in Stripe Dashboard:"
echo "   $STRIPE_DASHBOARD"
echo ""
echo "💳 Stripe Test Card Numbers:"
echo "   Success:  4242 4242 4242 4242"
echo "   Declined: 4000 0000 0000 0002"
echo "   3D Secure: 4000 0027 6000 3184"
echo ""
echo "   Expiry: Any future date (e.g., 12/34)"
echo "   CVC: Any 3 digits (e.g., 123)"
echo "   ZIP: Any 5 digits (e.g., 12345)"
echo ""
echo "📖 Full testing guide: docs/TESTING_PAYMENT_FLOW.md"
echo ""
echo "Happy testing! 🚀"
