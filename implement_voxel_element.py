#!/usr/bin/env python3
import sys
import os
import re
import json
import datetime

def extract_color_codes(text):
    """Extract hex color codes from text"""
    hex_pattern = r'#[0-9A-Fa-f]{6}'
    return re.findall(hex_pattern, text)

def extract_elements(text):
    """Extract key elements from the analysis"""
    elements = {
        'colors': extract_color_codes(text),
        'structures': [],
        'patterns': [],
        'terrain_types': []
    }
    
    # Look for common terrain types
    terrain_types = ['mountain', 'forest', 'plain', 'desert', 'water', 'lake', 'river', 'grass']
    for terrain in terrain_types:
        if re.search(r'\b' + terrain + r'\b', text, re.IGNORECASE):
            elements['terrain_types'].append(terrain.lower())
    
    # Look for structures
    structures = ['house', 'tree', 'building', 'cave', 'tower']
    for structure in structures:
        if re.search(r'\b' + structure + r'\b', text, re.IGNORECASE):
            elements['structures'].append(structure.lower())
    
    # Look for patterns
    patterns = ['checkered', 'striped', 'dotted', 'grid', 'noise', 'perlin']
    for pattern in patterns:
        if re.search(r'\b' + pattern + r'\b', text, re.IGNORECASE):
            elements['patterns'].append(pattern.lower())
    
    return elements

def generate_svelte_component(elements, output_file):
    """Generate a Svelte component for the voxel game based on extracted elements"""
    
    # Default colors if none found
    if not elements['colors']:
        elements['colors'] = ['#7EC850', '#8B4513', '#4286F4', '#808080']
    
    # Generate component content
    component = f"""<script lang="ts">
    import {{ onMount }} from 'svelte';
    import {{ voxelGameStore, generateFlatTerrain, addVoxel, VoxelType }} from '../../stores/voxel/voxelGameStore';
    
    // Colors extracted from analysis
    const colors = {json.dumps(elements['colors'])};
    
    // Elements extracted from analysis
    const terrainTypes = {json.dumps(elements['terrain_types'])};
    const structures = {json.dumps(elements['structures'])};
    const patterns = {json.dumps(elements['patterns'])};
    
    onMount(() => {{
        // Generate terrain based on analysis
        generateFlatTerrain(20, 0);
        
        // Example: Create a simple structure based on extracted elements
        createDemoStructure();
    }});
    
    function createDemoStructure() {{
        // This is a simple example that creates a structure based on the analysis
        // In a real implementation, you would use the extracted elements more extensively
        
        const baseHeight = 1;
        const centerX = 0;
        const centerZ = 0;
        
        // Create a base platform
        for (let x = -3; x <= 3; x++) {{
            for (let z = -3; z <= 3; z++) {{
                // Use different colors based on pattern
                const colorIndex = (Math.abs(x) + Math.abs(z)) % colors.length;
                const voxelType = getVoxelTypeFromColor(colors[colorIndex]);
                
                addVoxel({{
                    x: centerX + x,
                    y: baseHeight,
                    z: centerZ + z,
                    type: voxelType
                }});
            }}
        }}
        
        // Add vertical elements if structures were detected
        if (structures.includes('tower') || structures.includes('building') || structures.includes('tree')) {{
            for (let y = 1; y <= 5; y++) {{
                addVoxel({{
                    x: centerX,
                    y: baseHeight + y,
                    z: centerZ,
                    type: 'stone'
                }});
            }}
        }}
    }}
    
    function getVoxelTypeFromColor(color) {{
        // Simple mapping from color to voxel type
        switch(color.toLowerCase()) {{
            case '#7ec850':
            case '#5a9e34':
            case '#3a5f0b':
                return 'grass' as VoxelType;
            case '#8b4513':
                return 'dirt' as VoxelType;
            case '#808080':
                return 'stone' as VoxelType;
            case '#f2d16b':
            case '#e8c170':
                return 'wood' as VoxelType;
            case '#4286f4':
                return 'leaves' as VoxelType;
            default:
                return 'dirt' as VoxelType;
        }}
    }}
</script>

<div>
    <!-- Component content is handled by VoxelGameCanvas -->
</div>

<style>
    /* Any specific styles would go here */
</style>
"""
    
    # Create the directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Write the component to file
    with open(output_file, 'w') as f:
        f.write(component)
    
    print(f"Generated Svelte component at {output_file}")

def main(analysis_file):
    """Main function to implement voxel game elements from analysis"""
    if not os.path.exists(analysis_file):
        print(f"Error: Analysis file {analysis_file} does not exist")
        sys.exit(1)
    
    # Read the analysis result
    with open(analysis_file, 'r') as f:
        analysis_text = f.read()
    
    # Extract elements from the analysis
    elements = extract_elements(analysis_text)
    
    # Print summary of extracted elements
    print("\n=== Extracted Elements ===")
    print(f"Colors: {elements['colors']}")
    print(f"Terrain Types: {elements['terrain_types']}")
    print(f"Structures: {elements['structures']}")
    print(f"Patterns: {elements['patterns']}")
    
    # Generate timestamp for unique filenames
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Generate Svelte component with timestamp
    base_output_file = "src/lib/components/voxel/CustomVoxelElement.svelte"
    timestamped_output_file = f"src/lib/components/voxel/CustomVoxelElement_{timestamp}.svelte"
    
    # Create both versions: one with timestamp (for archiving) and one standard (for easy access)
    generate_svelte_component(elements, timestamped_output_file)
    generate_svelte_component(elements, base_output_file)
    
    # Generate route file to showcase the custom element
    route_file = "src/routes/custom-voxel/+page.svelte"
    route_dir = os.path.dirname(route_file)
    
    # Create the route directory if it doesn't exist
    os.makedirs(route_dir, exist_ok=True)
    
    with open(route_file, 'w') as f:
        f.write(f"""<script lang="ts">
    import CustomVoxelElement from '$lib/components/voxel/CustomVoxelElement.svelte';
    import VoxelGameCanvas from '$lib/components/voxel/VoxelGameCanvas.svelte';
</script>

<div class="container">
    <h1>Custom Voxel Element</h1>
    <p>This element was generated based on image analysis on {datetime.datetime.now().strftime("%Y-%m-%d at %H:%M:%S")}</p>
    <div class="game-container">
        <VoxelGameCanvas />
    </div>
    <CustomVoxelElement />
</div>

<style>
    .container {{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100vh;
    }}
    
    h1 {{
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        margin-top: 1rem;
        margin-bottom: 0.5rem;
    }}
    
    p {{
        color: white;
        margin-bottom: 1rem;
    }}
    
    .game-container {{
        width: 100%;
        height: 80vh;
        position: relative;
    }}
</style>
""")
    
    # Save a timestamped copy of the route file for reference
    timestamped_route_file = f"src/routes/custom-voxel/+page_{timestamp}.svelte"
    with open(timestamped_route_file, 'w') as f:
        f.write(f"""<script lang="ts">
    import CustomVoxelElement from '$lib/components/voxel/CustomVoxelElement_{timestamp}.svelte';
    import VoxelGameCanvas from '$lib/components/voxel/VoxelGameCanvas.svelte';
</script>

<div class="container">
    <h1>Custom Voxel Element (Archived Version)</h1>
    <p>This element was generated based on image analysis on {datetime.datetime.now().strftime("%Y-%m-%d at %H:%M:%S")}</p>
    <div class="game-container">
        <VoxelGameCanvas />
    </div>
    <CustomVoxelElement />
</div>

<style>
    .container {{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100vh;
    }}
    
    h1 {{
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        margin-top: 1rem;
        margin-bottom: 0.5rem;
    }}
    
    p {{
        color: white;
        margin-bottom: 1rem;
    }}
    
    .game-container {{
        width: 100%;
        height: 80vh;
        position: relative;
    }}
</style>
""")
    
    print(f"Generated route page at {route_file}")
    print(f"Archived version saved to {timestamped_route_file}")
    print(f"\nYou can now view your custom voxel element at /custom-voxel")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <analysis_file>")
        sys.exit(1)
    
    main(sys.argv[1]) 