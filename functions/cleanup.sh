#!/bin/bash

# Clear local build artifacts
echo "Clearing local build artifacts..."
rm -rf lib/
rm -rf .firebase/

# Clear logs
echo "Clearing Firebase logs..."
firebase functions:delete-all-logs

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Remove node_modules
echo "Removing node_modules..."
rm -rf node_modules/

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

echo "Cleanup complete!"
