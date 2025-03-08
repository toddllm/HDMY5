<script lang="ts">
    import { onMount } from 'svelte';
    import { addVoxel, generateFlatTerrain } from '../../stores/voxel/voxelGameStore';
    
    let error: string | null = null;
    
    onMount(() => {
        try {
            console.log("SimpleVoxelTest mounted");
            
            // Generate a simple terrain
            console.log("Generating simple terrain");
            generateFlatTerrain(8, 0);
            console.log("Terrain generated");
            
            // Add a simple marker structure
            console.log("Adding marker structure");
            addSimpleMarker();
            console.log("Marker added");
        } catch (e) {
            console.error("Error in SimpleVoxelTest:", e);
            error = `${e}`;
        }
    });
    
    function addSimpleMarker() {
        // Add a simple tower at the origin
        for (let y = 1; y <= 5; y++) {
            addVoxel("stone", 0, y, 0);
        }
        
        // Add a cross at the top
        addVoxel("wood", 1, 5, 0);
        addVoxel("wood", -1, 5, 0);
        addVoxel("wood", 0, 5, 1);
        addVoxel("wood", 0, 5, -1);
    }
</script>

{#if error}
<div class="error-container">
    <h3>Error:</h3>
    <pre>{error}</pre>
</div>
{/if}

<div class="component-indicator">
    <p>🔷 SIMPLE TEST COMPONENT ACTIVE 🔷</p>
</div>

<div>
    <!-- Component content is handled by VoxelGameCanvas -->
</div>

<style>
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
    
    .component-indicator {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: rgba(0, 127, 255, 0.8);
        color: white;
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 4px;
        z-index: 1000;
    }
    
    pre {
        white-space: pre-wrap;
        word-break: break-word;
        color: white;
    }
</style> 