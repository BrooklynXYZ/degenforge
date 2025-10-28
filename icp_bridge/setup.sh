#!/bin/bash

# Setup script for ICP Bridge development environment

set -e

echo "======================================"
echo "DegenForge ICP Bridge Setup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Python version
echo -e "${YELLOW}Checking Python version...${NC}"
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: ${PYTHON_VERSION}"

REQUIRED_VERSION="3.10"
if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]]; then
    echo -e "${RED}Error: Python 3.10 or higher is required${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python version OK${NC}"
echo ""

# Check if dfx is installed
echo -e "${YELLOW}Checking dfx installation...${NC}"
if ! command -v dfx &> /dev/null; then
    echo -e "${YELLOW}dfx not found. Installing...${NC}"
    sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
    echo -e "${GREEN}✓ dfx installed${NC}"
else
    DFX_VERSION=$(dfx --version | head -n1)
    echo "dfx version: ${DFX_VERSION}"
    echo -e "${GREEN}✓ dfx already installed${NC}"
fi
echo ""

# Create virtual environment
echo -e "${YELLOW}Creating Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo ""

# Install Kybra dfx extension
echo -e "${YELLOW}Installing Kybra dfx extension...${NC}"
python -m kybra install-dfx-extension
echo -e "${GREEN}✓ Kybra dfx extension installed${NC}"
echo ""

# Create env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}Please update .env with your configuration${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Activate virtual environment:"
echo "     source venv/bin/activate"
echo ""
echo "  2. Deploy locally:"
echo "     ./deploy-local.sh"
echo ""
echo "  3. Run integration tests:"
echo "     ./test-flow.sh"
echo ""
echo "  4. Deploy to mainnet:"
echo "     ./deploy-mainnet.sh"
echo ""
echo "For documentation, see: README.md"
echo ""

