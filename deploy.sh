#!/bin/bash
# deploy.sh
# Script to package and deploy the application to AWS VM

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# SSH Configuration
SSH_HOST="34.229.36.215"
SSH_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/colorworld"
SSH_KEY_PATH="/home/node/.ssh/aws_key"  # Full path to the SSH key
DEPLOY_MODE="proxy"  # Options: "proxy" or "static"
DOMAIN_NAME="colorworld.live"
SERVICE_NAME="colorworld-voxel"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}==== $1 ====${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print errors
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Show usage information
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -h, --host HOST       SSH host address (default: $SSH_HOST)"
    echo "  -u, --user USER       SSH user (default: $SSH_USER)"
    echo "  -d, --dir DIRECTORY   Remote directory (default: $REMOTE_DIR)"
    echo "  -k, --key KEY_PATH    SSH key path (default: $SSH_KEY_PATH)"
    echo "  -m, --mode MODE       Deploy mode: 'proxy' or 'static' (default: $DEPLOY_MODE)"
    echo "  --domain DOMAIN       Domain name (default: $DOMAIN_NAME)"
    echo "  --help                Show this help message"
    exit 1
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--host) SSH_HOST="$2"; shift ;;
        -u|--user) SSH_USER="$2"; shift ;;
        -d|--dir) REMOTE_DIR="$2"; shift ;;
        -k|--key) SSH_KEY_PATH="$2"; shift ;;
        -m|--mode) DEPLOY_MODE="$2"; shift ;;
        --domain) DOMAIN_NAME="$2"; shift ;;
        --help) usage ;;
        *) print_error "Unknown parameter: $1"; usage ;;
    esac
    shift
done

# Validate deploy mode
if [[ "$DEPLOY_MODE" != "proxy" && "$DEPLOY_MODE" != "static" ]]; then
    print_error "Invalid deploy mode: $DEPLOY_MODE. Must be 'proxy' or 'static'"
    usage
fi

# Construct SSH command with key if provided
SSH_OPTS=""
SCP_OPTS=""
if [[ -n "$SSH_KEY_PATH" ]]; then
    if [[ -f "$SSH_KEY_PATH" ]]; then
        SSH_OPTS="-i $SSH_KEY_PATH"
        SCP_OPTS="-i $SSH_KEY_PATH"
        print_success "Using SSH key: $SSH_KEY_PATH"
    else
        print_error "SSH key not found: $SSH_KEY_PATH"
        exit 1
    fi
else
    # Try to find default keys
    for key in ~/.ssh/id_rsa ~/.ssh/id_ed25519 ~/.ssh/aws_key; do
        if [[ -f "$key" ]]; then
            SSH_KEY_PATH="$key"
            SSH_OPTS="-i $SSH_KEY_PATH"
            SCP_OPTS="-i $SSH_KEY_PATH"
            print_success "Using SSH key: $SSH_KEY_PATH"
            break
        fi
    done
    
    if [[ -z "$SSH_KEY_PATH" ]]; then
        print_warning "No SSH key specified, using default authentication method"
    fi
fi

SSH_CMD="ssh $SSH_OPTS $SSH_USER@$SSH_HOST"
SCP_CMD="scp $SCP_OPTS"

print_section "Starting Deployment Process for $DOMAIN_NAME"

# Build the application
print_section "Building Application"
print_warning "Running build process..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed! Check the errors above."
    exit 1
fi
print_success "Application built successfully"

# Create deployment directory
print_section "Creating Deployment Package"
rm -rf deploy
mkdir -p deploy
print_success "Created deploy directory"

# Copy necessary files
if [[ "$DEPLOY_MODE" == "proxy" ]]; then
    # Copy files needed for proxy mode
    cp -r .svelte-kit/output/client/* deploy/
    cp -r .svelte-kit/output/server deploy/
    cp -r static deploy/
    cp package.json vite.config.ts proxy-server.js colorworld-voxel.service deploy/
    print_success "Copied application files for proxy server deployment"
else
    # Copy just the static build for static mode
    cp -r .svelte-kit/output/client/* deploy/
    print_success "Copied static build files"
fi

# Create start script
print_section "Creating Start Script"
cat > deploy/start.sh <<EOF
#!/bin/bash
cd \$(dirname \$0)

# Install production dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing production dependencies..."
    npm install --production
fi

# Start the application based on mode
if [[ "$DEPLOY_MODE" == "proxy" ]]; then
    echo "Starting proxy server..."
    node proxy-server.js
else
    echo "For static deployment, use a web server like Nginx to serve the build directory"
    exit 1
fi
EOF
chmod +x deploy/start.sh
print_success "Created start script"

# Create archive
print_section "Creating Archive"
cd deploy && tar -czf ../deploy.tar.gz * && cd ..
print_success "Created deployment archive: deploy.tar.gz"

# Test connection to server
print_section "Testing Connection to Server"
$SSH_CMD "echo Connection successful"
if [ $? -ne 0 ]; then
    print_error "Failed to connect to server. Check your SSH settings."
    exit 1
fi
print_success "Connection to server successful"

# Create remote directory if it doesn't exist
print_section "Preparing Remote Directory"
$SSH_CMD "mkdir -p $REMOTE_DIR"
print_success "Created remote directory: $REMOTE_DIR"

# Transfer files
print_section "Transferring Files"
$SCP_CMD deploy.tar.gz $SSH_USER@$SSH_HOST:$REMOTE_DIR/
if [ $? -ne 0 ]; then
    print_error "Failed to transfer files to server."
    exit 1
fi
print_success "Files transferred successfully"

# Extract and set up on server
print_section "Setting Up on Server"
$SSH_CMD "cd $REMOTE_DIR && tar -xzf deploy.tar.gz && rm deploy.tar.gz"
print_success "Files extracted on server"

if [[ "$DEPLOY_MODE" == "proxy" ]]; then
    # Install dependencies
    print_section "Installing Dependencies on Server"
    $SSH_CMD "cd $REMOTE_DIR && npm install --production"
    print_success "Dependencies installed on server"
    
    # Set up systemd service
    print_section "Setting Up Systemd Service"
    $SSH_CMD "sudo cp $REMOTE_DIR/$SERVICE_NAME.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable $SERVICE_NAME"
    print_success "Systemd service set up"
    
    # Start service
    print_section "Starting Service"
    $SSH_CMD "sudo systemctl restart $SERVICE_NAME && sudo systemctl status $SERVICE_NAME"
    print_success "Service started"
fi

# Clean up
print_section "Cleaning Up"
rm -rf deploy deploy.tar.gz
print_success "Cleaned up temporary files"

print_section "Deployment Summary"
echo -e "${GREEN}Your application has been deployed:${NC}"
echo -e "- ${BLUE}Server:${NC} $SSH_HOST"
echo -e "- ${BLUE}Domain:${NC} $DOMAIN_NAME"
echo -e "- ${BLUE}User:${NC} $SSH_USER"
echo -e "- ${BLUE}Directory:${NC} $REMOTE_DIR"
echo -e "- ${BLUE}Mode:${NC} $DEPLOY_MODE"
echo -e "- ${BLUE}URL:${NC} http://$DOMAIN_NAME"

print_section "Deployment Complete!"
exit 0 