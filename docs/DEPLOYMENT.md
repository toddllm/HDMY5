# Deployment Documentation for ColorWorld.live

This document provides a comprehensive guide to the deployment process and configuration files used for the ColorWorld.live website.

## Server Environment

The application is deployed on an AWS EC2 instance with the following setup:

- **Operating System**: Ubuntu 22.04 LTS
- **Web Server**: Nginx 1.18.0
- **Node.js**: v22.14.0 (installed via NVM)
- **SSL**: Let's Encrypt with Certbot

## Deployment Files

### Server Configuration

#### `colorworld-nginx.conf`

The main Nginx configuration file for the colorworld.live domain. This file configures:

- HTTP to HTTPS redirection
- SSL certificate settings
- Proxy settings for the Node.js application
- Cache control for static assets
- Security headers

```nginx
server {
    listen 80;
    server_name colorworld.live www.colorworld.live;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name colorworld.live www.colorworld.live;

    # SSL certificate configuration
    ssl_certificate /etc/letsencrypt/live/colorworld.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/colorworld.live/privkey.pem;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### `nginx-config.conf`

A template Nginx configuration with both HTTP and HTTPS setups (with HTTPS commented out) for initial setup.

#### `security-headers.conf`

Contains security headers that can be included in the Nginx configuration to enhance security:

```nginx
# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self';" always;
```

### Application Files

#### `index.html`

The welcome page for ColorWorld.live, serving as an entry point to the application. Contains:

- A spinning 3D cube animation
- Links to the different parts of the application (Voxel Demo, Voxel Editor, etc.)
- Styles and client-side navigation scripts

#### `sveltekit-index.html`

The SvelteKit application entry point, containing the necessary module imports and initialization code.

### Server Scripts

#### `simple-server.js`

An Express.js server that handles static file serving and routing for the application:

- Serves static files from the build directory
- Routes requests to specific paths (`/voxel-demo`, `/custom-voxel`, `/builder`)
- Handles SPA routing by serving the appropriate HTML file

#### `simple-server-https.js`

A version of the server that includes HTTPS support for local development and testing.

#### `sveltekit-server.js`

A specialized server for handling SvelteKit applications, including:

- Integration with the SvelteKit handler
- Static file serving
- Support for SPA routes

#### `proxy-server.js`

A proxy server that forwards requests from one port to another, useful for development and testing.

### Service Files

#### `colorworld-voxel.service`

A systemd service file that manages the application process. Contains:

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

#### `voxel-game.service`

An alternative service file for the voxel game component.

### Deployment Scripts

#### `deploy.sh`

A comprehensive deployment script that:

1. Builds the application (`npm run build`)
2. Creates a deployment package with all necessary files
3. Transfers the package to the server using SSH/SCP
4. Extracts the files on the server
5. Installs dependencies
6. Sets up and starts the application

#### `server-diagnostic.sh`

A script that gathers diagnostic information about the server, including:

- System information (OS, memory, CPU)
- Installed software (Node.js, npm, Docker, Nginx)
- Running processes
- Network information
- Firewall status

#### `setup-server.sh`

A script for initial server setup that configures the environment, installs dependencies, and prepares the server for deployment.

## Deployment Process

The deployment process follows these steps:

1. **Build the Application**:

   ```
   npm run build
   ```

2. **Create Deployment Package**:
   The `deploy.sh` script creates a package with all necessary files.

3. **Transfer to Server**:
   Files are transferred using SCP to the server's `/home/ubuntu/colorworld` directory.

4. **Set Up on Server**:

   - Dependencies are installed: `npm install --production`
   - The systemd service is set up

5. **Start the Application**:

   ```
   sudo systemctl start colorworld-voxel
   sudo systemctl enable colorworld-voxel
   ```

6. **Configure Nginx**:
   The Nginx configuration file is placed in `/etc/nginx/sites-available/` and linked to `/etc/nginx/sites-enabled/`.

7. **Set Up SSL**:
   ```
   sudo certbot --nginx -d colorworld.live -d www.colorworld.live
   ```

## Monitoring and Maintenance

### Log Files

- Application logs: `sudo journalctl -u colorworld-voxel`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`

### Service Management

- Start the service: `sudo systemctl start colorworld-voxel`
- Stop the service: `sudo systemctl stop colorworld-voxel`
- Restart the service: `sudo systemctl restart colorworld-voxel`
- Check status: `sudo systemctl status colorworld-voxel`

## Troubleshooting

### Common Issues

1. **Application Not Starting**:

   - Check logs: `sudo journalctl -u colorworld-voxel -n 50`
   - Verify Node.js version: `node -v`
   - Check file permissions: `ls -la /home/ubuntu/colorworld`

2. **Cannot Access Website**:

   - Check Nginx status: `sudo systemctl status nginx`
   - Check Nginx configuration: `sudo nginx -t`
   - Verify firewall settings: `sudo ufw status`

3. **SSL Certificate Issues**:
   - Check certificate expiration: `sudo certbot certificates`
   - Renew certificates: `sudo certbot renew`
