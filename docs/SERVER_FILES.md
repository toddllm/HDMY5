# Server Configuration and Utility Files

This document preserves the contents of important server configuration and utility files used for ColorWorld.live deployment.

## Service Files

### `colorworld-voxel.service`

```ini
[Unit]
Description=Colorworld Voxel Game Application
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/colorworld
ExecStart=/home/ubuntu/.nvm/versions/node/v22.14.0/bin/node /home/ubuntu/colorworld/simple-server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=colorworld-voxel
Environment=NODE_ENV=production
Environment=PORT=4173

[Install]
WantedBy=multi-user.target
```

This systemd service file ensures the application runs continuously and restarts automatically on failure.

## Utility Scripts

### `server-diagnostic.sh`

```bash
#!/bin/bash

# Function to print section headers
print_section() {
    echo "===== $1 ====="
}

# Create a timestamp for the output file
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
OUTPUT_FILE="server-diagnostic-$TIMESTAMP.txt"

{
    print_section "SYSTEM INFORMATION"
    echo "Hostname: $(hostname)"
    echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '"')"
    echo "Kernel: $(uname -r)"
    echo "CPU: $(grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2 | xargs)"
    echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
    echo "Disk Space:"
    df -h | grep -v tmpfs

    print_section "NODE.JS ENVIRONMENT"
    if command -v node &> /dev/null; then
        echo "Node.js version: $(node -v)"
    else
        echo "Node.js is not installed."
    fi

    if command -v npm &> /dev/null; then
        echo "npm version: $(npm -v)"
    else
        echo "npm is not installed."
    fi

    if [ -d "$HOME/.nvm" ]; then
        echo "NVM is installed."
        echo "NVM version: $(. "$HOME/.nvm/nvm.sh" && nvm --version 2>/dev/null || echo "Unknown")"
    else
        echo "NVM is not installed."
    fi

    print_section "DOCKER ENVIRONMENT"
    if command -v docker &> /dev/null; then
        echo "Docker is installed."
        echo "Docker version: $(docker --version)"
        echo "Docker service status: $(systemctl is-active docker)"
        echo "Running containers:"
        docker ps
        echo "Docker images:"
        docker images
        echo "Docker volumes:"
        docker volume ls
        echo "Docker networks:"
        docker network ls
    else
        echo "Docker is not installed."
    fi

    print_section "WEB SERVERS"
    if command -v nginx &> /dev/null; then
        echo "Nginx is installed."
        echo "Nginx version: $(nginx -v 2>&1)"
        echo "Nginx service status: $(systemctl is-active nginx)"
        echo "Nginx config files:"
        ls -la /etc/nginx/sites-enabled/
    else
        echo "Nginx is not installed."
    fi

    if command -v apache2 &> /dev/null; then
        echo "Apache is installed."
        echo "Apache version: $(apache2 -v | head -1)"
        echo "Apache service status: $(systemctl is-active apache2)"
    else
        echo "Apache is not installed."
    fi

    print_section "NETWORK PORTS"
    echo "Open ports and their processes:"
    sudo netstat -tulpn | grep LISTEN

    print_section "RUNNING PROCESSES"
    echo "Key running processes:"
    ps aux | grep -E '(node|nginx|apache|docker)'

    print_section "FIREWALL STATUS"
    if command -v ufw &> /dev/null; then
        echo "UFW status:"
        sudo ufw status
    else
        echo "UFW is not installed."
    fi

    echo "iptables rules:"
    sudo iptables -L -v

    print_section "PROCESS MANAGERS"
    if command -v pm2 &> /dev/null; then
        echo "PM2 is installed."
        echo "PM2 version: $(pm2 --version)"
        echo "Running PM2 processes:"
        pm2 list
    else
        echo "PM2 is not installed."
    fi

    print_section "DEPLOYMENT USER INFO"
    echo "Current user: $(whoami)"
    echo "User groups: $(groups)"
    echo "Home directory permissions:"
    ls -ld $HOME
    echo "Web directory permissions (if exists):"
    ls -ld $HOME/colorworld 2>/dev/null || echo "Directory doesn't exist"

    print_section "FILE CONTENTS"
    echo "Systemd service file (if exists):"
    cat /etc/systemd/system/colorworld-voxel.service 2>/dev/null || echo "File doesn't exist"

    echo "Nginx site configuration (if exists):"
    cat /etc/nginx/sites-enabled/colorworld 2>/dev/null || echo "File doesn't exist"

} | tee "$OUTPUT_FILE"

echo "Diagnostic information saved to $OUTPUT_FILE"
```

This script collects system diagnostic information for troubleshooting server issues.

### `setup-server.sh`

```bash
#!/bin/bash

# Script to set up the ColorWorld.live server
# This script should be run as a non-root user with sudo privileges

echo "Setting up server for ColorWorld.live..."

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install essential packages
echo "Installing essential packages..."
sudo apt-get install -y curl wget git nano build-essential

# Install Nginx
echo "Installing Nginx..."
sudo apt-get install -y nginx

# Enable and start Nginx
echo "Enabling and starting Nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Node.js using NVM
echo "Installing NVM and Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts

# Install Certbot for SSL
echo "Installing Certbot for SSL certificates..."
sudo apt-get install -y certbot python3-certbot-nginx

# Create directory for the application
echo "Creating application directory..."
mkdir -p ~/colorworld

# Set up firewall
echo "Setting up firewall..."
sudo apt-get install -y ufw
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# Install PM2 for process management (optional)
echo "Installing PM2 for process management..."
npm install -g pm2

echo "Server setup complete!"
echo "Next steps:"
echo "1. Deploy your application to ~/colorworld"
echo "2. Configure Nginx for your domain"
echo "3. Set up SSL with Certbot"
```

This script sets up a new server with the necessary software for running the ColorWorld.live application.

## Other Configuration

### Cleanup Configuration

To clean up temporary files periodically, you can set up a cron job:

```bash
# Add to crontab with: crontab -e
# Run cleanup daily at 2 AM
0 2 * * * find /home/ubuntu/colorworld -name "*.log" -type f -mtime +7 -delete
```
