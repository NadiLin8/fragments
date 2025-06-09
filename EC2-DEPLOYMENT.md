# EC2 Deployment Guide

## Prerequisites
- AWS EC2 instance running
- Security group allowing HTTP traffic on port 8080
- SSH access to the instance

## Deployment Steps

### 1. Connect to EC2 Instance
```bash
ssh -i your-key.pem ec2-user@your-ec2-public-dns
