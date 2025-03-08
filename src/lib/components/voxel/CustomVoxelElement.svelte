<script lang="ts">
    import { onMount } from 'svelte';
    import { generateFlatTerrain, addVoxel, VoxelType } from '../../stores/voxel/voxelGameStore';
    
    // Colors extracted from analysis
    const colors = ["#FF69B4", "#FFA500", "#4682B4", "#FFA500", "#000000", "#C8A2C8", "#FF69B4", "#FFA500"];
    
    // Elements extracted from analysis
    const structures: string[] = [];
    
    // Error state
    let error: string | null = null;
    
    onMount(() => {
        try {
            console.log("CustomVoxelElement mounted");
            
            // Generate terrain based on analysis
            try {
                console.log("Generating flat terrain...");
                generateFlatTerrain(20, 0);
                console.log("Flat terrain generated successfully");
            } catch (terrainError) {
                console.error("Error generating terrain:", terrainError);
                error = `Error generating terrain: ${terrainError}`;
                return;
            }
            
            // Example: Create a simple structure based on extracted elements
            try {
                console.log("Creating demo structure...");
                createDemoStructure();
                console.log("Demo structure created successfully");
            } catch (structureError) {
                console.error("Error creating structure:", structureError);
                error = `Error creating structure: ${structureError}`;
            }
        } catch (e) {
            console.error("General error in onMount:", e);
            error = `General error: ${e}`;
        }
    });
    
    function createDemoStructure() {
        console.log("Starting createDemoStructure");
        
        const baseHeight = 1;
        const centerX = 0;
        const centerZ = 0;
        
        // Create a base platform
        for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
                try {
                    // Use different colors based on pattern
                    const colorIndex = (Math.abs(x) + Math.abs(z)) % colors.length;
                    const voxelType = getVoxelTypeFromColor(colors[colorIndex]);
                    
                    console.log(`Adding voxel at (${centerX + x}, ${baseHeight}, ${centerZ + z}) with type ${voxelType}`);
                    
                    // Call addVoxel with separate arguments (type, x, y, z)
                    addVoxel(voxelType, centerX + x, baseHeight, centerZ + z);
                } catch (voxelError) {
                    console.error(`Error adding voxel at (${x}, ${baseHeight}, ${z}):`, voxelError);
                    error = `Error adding voxel: ${voxelError}`;
                }
            }
        }
        
        // Add vertical elements if structures were detected
        if (structures.includes('tower') || structures.includes('building') || structures.includes('tree')) {
            for (let y = 1; y <= 5; y++) {
                try {
                    // Call addVoxel with separate arguments (type, x, y, z)
                    addVoxel("stone", centerX, baseHeight + y, centerZ);
                } catch (structureError) {
                    console.error(`Error adding structure at (${centerX}, ${baseHeight + y}, ${centerZ}):`, structureError);
                    error = `Error adding structure voxel: ${structureError}`;
                }
            }
        }
    }
    
    function getVoxelTypeFromColor(color: string): VoxelType {
        // Simple mapping from color to voxel type
        // Ensuring we only return valid VoxelType values
        const colorLower = color.toLowerCase();
        
        // Pink colors - map to dirt
        if (colorLower.includes('ff69b4') || colorLower.includes('pink')) {
            return "dirt";
        }
        
        // Orange/yellow colors - map to wood
        if (colorLower.includes('ffa500') || colorLower.includes('ffff00') || colorLower.includes('orange') || colorLower.includes('yellow')) {
            return "wood";
        }
        
        // Blue colors - map to leaves
        if (colorLower.includes('4682b4') || colorLower.includes('blue')) {
            return "leaves";
        }
        
        // Purple/lilac colors - map to wood
        if (colorLower.includes('c8a2c8') || colorLower.includes('800080') || colorLower.includes('purple')) {
            return "wood";
        }
        
        // Black - map to stone
        if (colorLower.includes('000000') || colorLower.includes('black')) {
            return "stone";
        }
        
        // Default to dirt for unrecognized colors
        return "dirt";
    }
</script>

{#if error}
<div class="error-container">
    <h3>Error:</h3>
    <pre>{error}</pre>
</div>
{/if}

<div>
    <!-- Component content is handled by VoxelGameCanvas -->
</div>

<style>
    /* Any specific styles would go here */
    .error-container {
        background-color: rgba(255, 0, 0, 0.1);
        border: 1px solid red;
        border-radius: 4px;
        padding: 1rem;
        margin: 1rem;
        color: white;
    }
    
    .error-container h3 {
        margin-top: 0;
        color: red;
    }
    
    pre {
        white-space: pre-wrap;
        word-break: break-word;
        color: white;
    }
</style>
