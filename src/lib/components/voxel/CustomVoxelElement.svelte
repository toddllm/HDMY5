<script lang="ts">
    import { onMount } from 'svelte';
    import { generateFlatTerrain, addVoxel, voxelGameStore } from '../../stores/voxel/voxelGameStore';
    
    // Define VoxelType directly to avoid import issues
    type VoxelType = "air" | "dirt" | "grass" | "stone" | "wood" | "leaves";
    
    // Colors from image analysis
    const colors = {
        bodyPink: "#FF69B4",
        orange: "#FFA500", 
        detailBlue: "#4682B4",
        tridentBase: "#000000",
        tridentTips: "#C8A2C8"
    };
    
    // Error state
    let error: string | null = null;
    let progress: string = "";
    
    // Function to clear all voxels
    function clearVoxels() {
        voxelGameStore.update(state => ({
            ...state,
            voxels: []
        }));
    }
    
    // Update player position to better view the scene
    function setPlayerPosition() {
        voxelGameStore.update(state => ({
            ...state,
            playerPosition: { x: 0, y: 5, z: 12 },
            playerRotation: { yaw: 180, pitch: 0 }
        }));
    }
    
    onMount(() => {
        try {
            console.log("CustomVoxelElement mounted");
            // Set player position first
            setPlayerPosition();
            createSceneFromAnalysis();
        } catch (e) {
            console.error("General error in onMount:", e);
            error = `General error: ${e}`;
        }
    });
    
    async function createSceneFromAnalysis() {
        try {
            progress = "Clearing existing voxels...";
            clearVoxels();
            progress = "Creating pink terrain...";
            await createTerrain();
            progress = "Adding character...";
            await createCharacter();
            progress = "Adding details...";
            await createTrident();
            progress = "Scene creation complete!";
        } catch (e) {
            console.error("Error creating scene:", e);
            error = `Error creating scene: ${e}`;
        }
    }
    
    async function createTerrain() {
        try {
            // Generate flat terrain with a depth of 20 and height of 0
            await generateFlatTerrain(20, 0);
            
            // Add pink texture to the ground as described in analysis
            for (let x = -10; x <= 10; x++) {
                for (let z = -10; z <= 10; z++) {
                    // Add some variation to the terrain
                    const shouldColor = Math.random() > 0.2;
                    if (shouldColor) {
                        const voxelType = mapColorToVoxelType(colors.bodyPink);
                        addVoxel(voxelType, x, 0, z);
                    }
                    
                    // Add orange pathway as described in analysis
                    if (x === 0 || z === 0) {
                        const pathType = mapColorToVoxelType(colors.orange);
                        addVoxel(pathType, x, 0, z);
                    }
                }
            }
            
            return true;
        } catch (terrainError) {
            console.error("Error generating terrain:", terrainError);
            error = `Error generating terrain: ${terrainError}`;
            return false;
        }
    }
    
    async function createCharacter() {
        try {
            // Place character in front of the player's view
            const centerX = 0;
            const centerZ = 0;
            const baseHeight = 1;
            
            // Head (square pink)
            for (let y = 4; y <= 5; y++) {
                for (let x = -1; x <= 1; x++) {
                    for (let z = -1; z <= 1; z++) {
                        const voxelType = mapColorToVoxelType(colors.bodyPink);
                        addVoxel(voxelType, centerX + x, baseHeight + y, centerZ + z);
                    }
                }
            }
            
            // Eyes (orange squares)
            addVoxel(mapColorToVoxelType(colors.orange), centerX - 1, baseHeight + 5, centerZ - 1);
            addVoxel(mapColorToVoxelType(colors.orange), centerX + 1, baseHeight + 5, centerZ - 1);
            
            // Smile (blue)
            addVoxel(mapColorToVoxelType(colors.detailBlue), centerX - 1, baseHeight + 4, centerZ - 1);
            addVoxel(mapColorToVoxelType(colors.detailBlue), centerX, baseHeight + 4, centerZ - 1);
            addVoxel(mapColorToVoxelType(colors.detailBlue), centerX + 1, baseHeight + 4, centerZ - 1);
            
            // Torso (rectangular pink)
            for (let y = 1; y <= 3; y++) {
                for (let x = -1; x <= 1; x++) {
                    for (let z = -1; z <= 0; z++) {
                        const voxelType = mapColorToVoxelType(colors.bodyPink);
                        addVoxel(voxelType, centerX + x, baseHeight + y, centerZ + z);
                    }
                }
            }
            
            // Arms (pink with orange joints)
            // Left arm
            for (let x = -2; x >= -4; x--) {
                addVoxel(mapColorToVoxelType(colors.bodyPink), centerX + x, baseHeight + 3, centerZ);
            }
            // Right arm
            for (let x = 2; x <= 4; x++) {
                addVoxel(mapColorToVoxelType(colors.bodyPink), centerX + x, baseHeight + 3, centerZ);
            }
            // Joints (orange)
            addVoxel(mapColorToVoxelType(colors.orange), centerX - 2, baseHeight + 3, centerZ);
            addVoxel(mapColorToVoxelType(colors.orange), centerX + 2, baseHeight + 3, centerZ);
            
            // Legs (pink)
            // Left leg
            for (let y = 0; y >= -3; y--) {
                addVoxel(mapColorToVoxelType(colors.bodyPink), centerX - 1, baseHeight + y, centerZ);
            }
            // Right leg
            for (let y = 0; y >= -3; y--) {
                addVoxel(mapColorToVoxelType(colors.bodyPink), centerX + 1, baseHeight + y, centerZ);
            }
            
            // Blue shoulder accent
            addVoxel(mapColorToVoxelType(colors.detailBlue), centerX - 1, baseHeight + 3, centerZ + 1);
            addVoxel(mapColorToVoxelType(colors.detailBlue), centerX + 1, baseHeight + 3, centerZ + 1);
            
            return true;
        } catch (characterError) {
            console.error("Error creating character:", characterError);
            error = `Error creating character: ${characterError}`;
            return false;
        }
    }
    
    async function createTrident() {
        try {
            // Position the trident to the left of the character
            const centerX = -5;
            const centerZ = 0;
            const baseHeight = 1;
            
            // Trident handle (black)
            for (let y = 1; y <= 6; y++) {
                addVoxel(mapColorToVoxelType(colors.tridentBase), centerX, baseHeight + y, centerZ);
            }
            
            // Trident tips (lilac)
            addVoxel(mapColorToVoxelType(colors.tridentTips), centerX - 1, baseHeight + 6, centerZ);
            addVoxel(mapColorToVoxelType(colors.tridentTips), centerX, baseHeight + 7, centerZ);
            addVoxel(mapColorToVoxelType(colors.tridentTips), centerX + 1, baseHeight + 6, centerZ);
            
            // Ring-like object (orange outline) - positioned to the right of the character
            const ringX = 5;
            const ringZ = 0;
            addVoxel(mapColorToVoxelType(colors.orange), ringX - 1, baseHeight + 4, ringZ);
            addVoxel(mapColorToVoxelType(colors.orange), ringX, baseHeight + 5, ringZ);
            addVoxel(mapColorToVoxelType(colors.orange), ringX + 1, baseHeight + 4, ringZ);
            addVoxel(mapColorToVoxelType(colors.orange), ringX, baseHeight + 3, ringZ);
            
            return true;
        } catch (detailsError) {
            console.error("Error creating details:", detailsError);
            error = `Error creating details: ${detailsError}`;
            return false;
        }
    }
    
    function mapColorToVoxelType(color: string): VoxelType {
        // Mapping from colors to available VoxelType
        const colorLower = color.toLowerCase();
        
        // Pink colors - map to dirt
        if (colorLower.includes('ff69b4') || colorLower.includes('pink')) {
            return "dirt";
        }
        
        // Orange/yellow colors - map to wood
        if (colorLower.includes('ffa500') || colorLower.includes('ffff00') || colorLower.includes('orange')) {
            return "wood";
        }
        
        // Blue colors - map to leaves
        if (colorLower.includes('4682b4') || colorLower.includes('blue')) {
            return "leaves";
        }
        
        // Purple/lilac colors - map to wood
        if (colorLower.includes('c8a2c8') || colorLower.includes('purple')) {
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
    {#if progress}
        <div class="progress-container">
            <p>{progress}</p>
        </div>
    {/if}
    
    {#if error}
        <div class="error-container">
            <h3>Error:</h3>
            <pre>{error}</pre>
        </div>
    {/if}
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
    
    .progress-container {
        background-color: rgba(0, 255, 0, 0.1);
        border: 1px solid green;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        margin: 1rem;
        color: white;
    }
    
    pre {
        white-space: pre-wrap;
        word-break: break-word;
        color: white;
    }
</style>
