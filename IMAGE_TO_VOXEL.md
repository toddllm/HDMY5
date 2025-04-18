# Image to Voxel Converter

This tool allows you to analyze an image and convert it into voxel elements for the HDMY5 Game Builder.

## Prerequisites

1. Python 3.x with `venv` module
2. An OpenAI API key with access to GPT-4o (which includes vision capabilities)
3. The HDMY5 Game Builder codebase

## Setup

1. Create a file named `source.me` in the project root with your OpenAI API key:

   ```bash
   echo 'export OPENAI_API_KEY=your_api_key_here' > source.me
   ```

2. Make sure the scripts are executable:
   ```bash
   chmod +x analyze_image.py implement_voxel_element.py create_voxel_from_image.sh
   ```

## Usage

### All-in-One Script

The easiest way to use this tool is with the all-in-one script:

```bash
./create_voxel_from_image.sh /path/to/your/image.jpg
```

This will:

1. Analyze the image using OpenAI's GPT-4o model (which includes vision capabilities)
2. Extract key elements like colors, patterns, and structures
3. Generate a Svelte component that creates voxel elements based on the analysis
4. Create a route to view your custom voxel element

### Individual Scripts

If you prefer to run the steps individually:

1. **Analyze an image**:

   ```bash
   source source.me
   python analyze_image.py /path/to/your/image.jpg
   ```

   This will create an `image_analysis_result.txt` file with the analysis.

2. **Implement voxel elements**:
   ```bash
   python implement_voxel_element.py image_analysis_result.txt
   ```
   This will create:
   - `src/lib/components/voxel/CustomVoxelElement.svelte`: A component that generates voxel elements
   - `src/routes/custom-voxel/+page.svelte`: A route to view your custom voxel element

## Viewing Your Custom Voxel Element

1. Start the development server:

   ```bash
   # For local-only access
   npm run dev

   # For external access (accessible from other devices)
   npm run dev -- --host
   ```

2. Open your browser and navigate to:

   ```
   http://localhost:5173/custom-voxel
   ```

   If using the `--host` flag, you can also access it from other devices on your network using your machine's IP address:

   ```
   http://<your-machine-ip>:5173/custom-voxel
   ```

## How It Works

1. The `analyze_image.py` script:

   - Sends your image to OpenAI's GPT-4o model (which includes vision capabilities)
   - Requests a detailed analysis focused on elements that could be recreated in a voxel game
   - Saves the analysis to a timestamped file (`image_analysis_{image_name}_{timestamp}.txt`)
   - Also saves a copy to `image_analysis_result.txt` for use with the implementation script

2. The `implement_voxel_element.py` script:
   - Extracts key information from the analysis (colors, patterns, structures, etc.)
   - Generates Svelte components that create voxel elements based on the extracted information:
     - A timestamped version (`CustomVoxelElement_{timestamp}.svelte`) for archiving
     - A standard version (`CustomVoxelElement.svelte`) for easy access
   - Creates routes to view the custom voxel element:
     - Standard route at `/custom-voxel`
     - Archived version with timestamp reference for historical tracking
   - All generated files include creation timestamps to preserve analysis history

## Troubleshooting

- **API Key Issues**: Make sure your OpenAI API key is correctly set in the `source.me` file and that you have access to the GPT-4o model.
- **Python Dependencies**: If you encounter errors with Python dependencies, try manually installing them:
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  pip install requests python-dotenv
  ```
- **Image Format**: The tool works best with clear, well-lit images. If you get poor results, try using a different image.
