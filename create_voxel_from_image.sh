#!/bin/bash

# Check if source.me exists
if [ ! -f "source.me" ]; then
    echo "Error: source.me file not found. Please create it with your API keys."
    exit 1
fi

# Source the API key file
source ./source.me

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY is not set in source.me file."
    exit 1
fi

# Check if image path is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <image_path>"
    exit 1
fi

# Activate virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install requests python-dotenv
else
    source .venv/bin/activate
fi

# Run the analysis script
echo "Step 1: Analyzing image..."
python analyze_image.py "$1"

# Check if analysis was successful
if [ $? -ne 0 ]; then
    echo "Error: Image analysis failed."
    exit 1
fi

# Run the implementation script
echo "Step 2: Implementing voxel elements..."
python implement_voxel_element.py image_analysis_result.txt

# Check if implementation was successful
if [ $? -ne 0 ]; then
    echo "Error: Voxel element implementation failed."
    exit 1
fi

echo "Success! Your custom voxel element has been created."
echo "You can view it at: http://localhost:5173/custom-voxel"
echo "All analysis results and generated components are saved with timestamps to prevent overwriting previous results."
echo "Make sure your development server is running with: npm run dev" 