<script lang="ts">
    import { onMount } from 'svelte';
    import { generateFlatTerrain, addVoxel, VoxelType } from '../../stores/voxel/voxelGameStore';
    
    // Colors extracted from analysis
    const colors = ["#FF69B4", "#FFA500", "#4682B4", "#FFA500", "#000000", "#C8A2C8", "#FF69B4", "#FFA500"];
    
    // Elements extracted from analysis
    const structures: string[] = [];
    
    onMount(() => {
        // Generate terrain based on analysis
        generateFlatTerrain(20, 0);
        
        // Example: Create a simple structure based on extracted elements
        createDemoStructure();
    });
    
    function createDemoStructure() {
        // This is a simple example that creates a structure based on the analysis
        // In a real implementation, you would use the extracted elements more extensively
        
        const baseHeight = 1;
        const centerX = 0;
        const centerZ = 0;
        
        // Create a base platform
        for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
                // Use different colors based on pattern
                const colorIndex = (Math.abs(x) + Math.abs(z)) % colors.length;
                const voxelType = getVoxelTypeFromColor(colors[colorIndex]);
                
                // Call addVoxel with separate arguments (type, x, y, z)
                addVoxel(voxelType, centerX + x, baseHeight, centerZ + z);
            }
        }
        
        // Add vertical elements if structures were detected
        if (structures.includes('tower') || structures.includes('building') || structures.includes('tree')) {
            for (let y = 1; y <= 5; y++) {
                // Call addVoxel with separate arguments (type, x, y, z)
                addVoxel("stone", centerX, baseHeight + y, centerZ);
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

<div>
    <!-- Component content is handled by VoxelGameCanvas -->
</div>

<style>
    /* Any specific styles would go here */
</style>
