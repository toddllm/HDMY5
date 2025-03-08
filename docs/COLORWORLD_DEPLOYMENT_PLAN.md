# Colorworld.live Deployment Plan

This document outlines the plan for deploying the HDMY5 Game Builder demos to the `colorworld.live` domain using an AWS VM.

## Overview

We will use a multi-stage approach to deploying our demos:

1. **GitHub Pages** for static content and basic demos
2. **AWS VM** for interactive demos that require server-side processing

## GitHub Pages Component

The basic demo pages will be hosted on GitHub Pages as set up in the previous steps.

### Domain Setup

1. **Create a subdomain**: Set up `demo.colorworld.live` to point to the GitHub Pages site.
2. **DNS Configuration**:
   - Create a CNAME record for `demo.colorworld.live` pointing to `toddllm.github.io`.
   - Alternatively, set up A records pointing to GitHub Pages IP addresses.

## AWS VM Component

For interactive demos requiring server-side processing, we will use the AWS VM.

### Prerequisites

- An AWS EC2 instance (already running)
- SSH access to the VM
- Domain name (`colorworld.live`) with administrative access to DNS settings

### AWS VM Setup

1. **Server Environment**:

   - Update and upgrade system packages

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

   - Install required packages

   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx git nodejs npm
   ```

2. **Web Server Configuration**:

   - Configure Nginx

   ```bash
   sudo nano /etc/nginx/sites-available/colorworld.live
   ```

   - Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name colorworld.live www.colorworld.live;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   - Enable the site

   ```bash
   sudo ln -s /etc/nginx/sites-available/colorworld.live /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **SSL Configuration**:
   - Set up SSL with Certbot
   ```bash
   sudo certbot --nginx -d colorworld.live -d www.colorworld.live
   ```

### Application Deployment

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/toddllm/HDMY5.git
   cd HDMY5
   ```

2. **Set Up the Application**:

   ```bash
   npm install
   npm run build
   ```

3. **Configure PM2 for Process Management**:
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "hdmy5-game-builder" -- run start
   pm2 save
   pm2 startup
   ```

## Continuous Deployment

To automate the deployment process:

1. **Create a Deployment Script**:

   ```bash
   nano deploy.sh
   ```

2. **Add the following content**:

   ```bash
   #!/bin/bash

   # Go to the project directory
   cd /path/to/HDMY5

   # Pull the latest changes
   git pull

   # Install dependencies and build
   npm install
   npm run build

   # Restart the application
   pm2 restart hdmy5-game-builder
   ```

3. **Make the script executable**:

   ```bash
   chmod +x deploy.sh
   ```

4. **Set up a GitHub webhook** to trigger this script when changes are pushed to the repository.

## Domain and Subdomain Strategy

We will use the following domain structure:

- `colorworld.live` - Main site hosted on AWS VM
- `demo.colorworld.live` - GitHub Pages hosted static demos
- `api.colorworld.live` - API endpoints hosted on AWS VM (if needed)

## Monitoring and Maintenance

1. **Set up monitoring** using AWS CloudWatch or a third-party service.
2. **Regular backups** of the VM and database (if applicable).
3. **Auto-renewal** of SSL certificates.

## Future Enhancements

1. **Containerization** - Consider using Docker for easier deployment and scalability.
2. **CDN Integration** - Set up a CDN like Cloudflare for improved performance.
3. **Database Backend** - Implement a database if needed for user data or advanced features.

## Cost Considerations

- AWS EC2 instance: Varies based on instance type (t2.micro is free tier eligible)
- Domain registration: ~$12/year
- SSL certificate: Free with Let's Encrypt
- Additional AWS services: As needed

## Timeline

1. **Phase 1 (Immediate)**: Deploy static demo to GitHub Pages
2. **Phase 2 (1-2 weeks)**: Set up AWS VM and basic server configuration
3. **Phase 3 (2-4 weeks)**: Implement continuous deployment and enhanced demos
4. **Phase 4 (Ongoing)**: Regular updates and maintenance

## Conclusion

This deployment plan provides a roadmap for hosting the HDMY5 Game Builder demos on colorworld.live using both GitHub Pages and an AWS VM. The hybrid approach allows us to leverage the simplicity of GitHub Pages for static content while utilizing the AWS VM for more complex, interactive features.
