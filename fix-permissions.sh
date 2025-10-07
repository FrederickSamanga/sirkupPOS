#!/bin/bash

echo "Fixing permissions for cafe-app..."
echo "Please run this script with sudo:"
echo "sudo bash fix-permissions.sh"
echo ""

# Fix ownership
sudo chown -R frederick:devgroup /home/frederick/dev/cafe-app/

# Fix permissions
sudo chmod -R 755 /home/frederick/dev/cafe-app/
sudo find /home/frederick/dev/cafe-app -type d -exec chmod 755 {} \;
sudo find /home/frederick/dev/cafe-app -type f -exec chmod 644 {} \;

# Make scripts executable
sudo chmod +x /home/frederick/dev/cafe-app/*.sh

echo "Permissions fixed!"
echo "Now you can run: npm run dev"