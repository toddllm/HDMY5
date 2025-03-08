#!/usr/bin/env python3
import os
import sys
import base64
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env file (if exists)
load_dotenv()

def analyze_image(image_path):
    """
    Analyze an image using OpenAI's GPT-4 Vision API.
    
    Args:
        image_path: Path to the image file
    
    Returns:
        The analysis result from the API
    """
    # Get OpenAI API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable is not set.")
        print("Please set it in your source.me file and source it before running.")
        sys.exit(1)
        
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"Error: Image file {image_path} does not exist")
        sys.exit(1)
        
    # Read and encode the image
    with open(image_path, "rb") as image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
    
    # Prepare the API request
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Please analyze this image and describe it in detail for implementation in a voxel game. Focus on elements like colors, shapes, patterns, and structures that could be recreated with code. If it's a texture or pattern, describe how it could be generated procedurally. Be specific about colors (provide hex codes if possible)."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1000
    }
    
    # Make the API request
    try:
        print("Sending request to OpenAI API...")
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        # Check for errors
        response.raise_for_status()
        
        # Parse and return the response
        result = response.json()
        if "choices" in result and len(result["choices"]) > 0:
            analysis = result["choices"][0]["message"]["content"]
            return analysis
        else:
            error_msg = f"Error: Unexpected response format: {json.dumps(result, indent=2)}"
            print(error_msg)
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        error_msg = f"Error making request: {str(e)}"
        print(error_msg)
        sys.exit(1)

if __name__ == "__main__":
    # Check arguments
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <image_path>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    print(f"Analyzing image: {image_path}")
    result = analyze_image(image_path)
    
    print("\n=== Image Analysis Result ===\n")
    print(result)
    print("\n============================\n")
    
    # Save the analysis to a file
    output_file = "image_analysis_result.txt"
    with open(output_file, "w") as f:
        f.write(result)
    
    print(f"Analysis saved to {output_file}") 