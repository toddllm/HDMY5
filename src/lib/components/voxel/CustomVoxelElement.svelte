<script lang="ts">
    import { onMount } from 'svelte';
    import { generateFlatTerrain, addVoxel, voxelGameStore } from '../../stores/voxel/voxelGameStore';
    
    // Define VoxelType directly to avoid import issues
    type VoxelType = "air" | "dirt" | "grass" | "stone" | "wood" | "leaves";
    
    // Colors from image analysis with more detail
    const colors = {
        bodyPink: "#FF69B4",  // Main character color
        orange: "#FFA500",    // Eyes and accent color
        detailBlue: "#4682B4", // Smile and shoulder details
        tridentBase: "#000000", // Trident handle
        tridentTips: "#C8A2C8", // Trident tips - lilac color
        groundPink: "#FF69B4" // Ground texture color
    };
    
    // Error state
    let error: string | null = null;
    let progress: string = "";
    
    // Debug counter for voxels added
    let voxelsAdded = 0;
    
    // Function to clear all voxels
    function clearVoxels() {
        voxelGameStore.update(state => ({
            ...state,
            voxels: []
        }));
        console.log("🧹 All voxels cleared");
    }
    
    // Add voxel with tracking
    function addTrackedVoxel(type: VoxelType, x: number, y: number, z: number) {
        addVoxel(type, x, y, z);
        voxelsAdded++;
        
        // Log every 20th voxel to avoid console spam
        if (voxelsAdded % 20 === 0) {
            console.log(`🧱 Added ${voxelsAdded} voxels so far`);
        }
    }
    
    // Update player position to better view the scene
    function setPlayerPosition() {
        voxelGameStore.update(state => ({
            ...state,
            playerPosition: { x: 0, y: 10, z: 20 }, // Higher up and further back
            playerRotation: { yaw: 180, pitch: 0 } // Look directly at the tall structure
        }));
        console.log("🎮 Player position set to x:0, y:10, z:20, looking at yaw:180");
    }
    
    // Debug function to check current game state
    function logGameState() {
        const unsubscribe = voxelGameStore.subscribe(state => {
            console.log("📊 CURRENT GAME STATE:");
            console.log(`📊 Player position: x:${state.playerPosition.x}, y:${state.playerPosition.y}, z:${state.playerPosition.z}`);
            console.log(`📊 Player rotation: yaw:${state.playerRotation.yaw}, pitch:${state.playerRotation.pitch}`);
            console.log(`📊 Total voxels in store: ${state.voxels.length}`);
            
            // Log some sample voxels if they exist
            if (state.voxels.length > 0) {
                console.log(`📊 Sample voxels (first 3):`);
                state.voxels.slice(0, 3).forEach(voxel => {
                    console.log(`📊   Type: ${voxel.type}, Position: x:${voxel.x}, y:${voxel.y}, z:${voxel.z}`);
                });
            }
        });
        unsubscribe(); // Immediately unsubscribe since we just want the current state
    }
    
    onMount(() => {
        try {
            console.log("🚀 CustomVoxelElement mounted");
            
            // Set player position first
            setPlayerPosition();
            
            // Create the scene
            createSceneFromAnalysis();
            
            // Check the state after a short delay to ensure all updates are processed
            setTimeout(() => {
                logGameState();
            }, 1000);
        } catch (e) {
            console.error("❌ General error in onMount:", e);
            error = `General error: ${e}`;
        }
    });
    
    async function createSceneFromAnalysis() {
        try {
            voxelsAdded = 0;
            progress = "Clearing existing voxels...";
            clearVoxels();
            
            progress = "Creating pink textured terrain...";
            await createTerrain();
            console.log(`✅ Terrain created with ${voxelsAdded} voxels`);
            
            console.log("%c CREATING CHARACTER - LOOK FOR TALL PILLAR WITH FLAG", "background: red; color: white; font-size: 20px; padding: 10px;");
            progress = "Adding childlike character with TALL PILLAR...";
            await createCharacter();
            console.log(`✅ Character created, total voxels so far: ${voxelsAdded}`);
            
            progress = "Adding trident and accessories...";
            await createAccessories();
            console.log(`✅ Accessories added, final voxel count: ${voxelsAdded}`);
            
            progress = "Scene creation complete!";
            console.log(`🎉 Scene creation complete with ${voxelsAdded} total voxels`);
            
            // Final check of game state
            logGameState();
        } catch (e) {
            console.error("❌ Error creating scene:", e);
            error = `Error creating scene: ${e}`;
        }
    }
    
    async function createTerrain() {
        try {
            // Generate flat terrain with a depth of 20 and height of 0
            await generateFlatTerrain(20, 0);
            
            // Add pink texture to the ground as described in analysis with more variation
            for (let x = -10; x <= 10; x++) {
                for (let z = -10; z <= 10; z++) {
                    // Create texture variation using noise-like pattern
                    const noiseVal = Math.sin(x * 0.5) * Math.cos(z * 0.5) + Math.random() * 0.3;
                    const shouldColor = noiseVal > 0;
                    
                    if (shouldColor) {
                        const voxelType = mapColorToVoxelType(colors.groundPink);
                        addTrackedVoxel(voxelType, x, 0, z);
                    }
                    
                    // Add orange pathway/separation line as described in analysis
                    if (x === 0 || z === 0) {
                        const pathType = mapColorToVoxelType(colors.orange);
                        addTrackedVoxel(pathType, x, 0, z);
                    }
                }
            }
            
            return true;
        } catch (terrainError) {
            console.error("❌ Error generating terrain:", terrainError);
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
            
            // SUPER OBVIOUS CHANGE: Add a very tall pillar at character position
            // This should be impossible to miss
            for (let y = 0; y <= 20; y++) {
                addTrackedVoxel("stone", centerX, baseHeight + y, centerZ);
            }
            console.log("🏢 Tall stone pillar created at x:0, z:0");
            
            // Add bright "flag" at the top - alternating pattern that's very visible
            for (let x = -3; x <= 3; x++) {
                addTrackedVoxel("leaves", centerX + x, baseHeight + 20, centerZ);
                if (x % 2 === 0) {
                    addTrackedVoxel("wood", centerX + x, baseHeight + 21, centerZ);
                }
            }
            console.log("🚩 Flag added at the top of pillar");
            
            // EVEN MORE OBVIOUS: Add a bright staircase
            for (let i = 0; i < 10; i++) {
                for (let x = -2; x <= 2; x++) {
                    addTrackedVoxel("leaves", centerX + x + i, baseHeight + i, centerZ + 5);
                }
            }
            console.log("🪜 Bright staircase added");
            
            // Create a more bulky, blocky childlike character
            
            // Head - larger and more square to match child-like drawing 
            for (let y = 4; y <= 6; y++) {
                for (let x = -2; x <= 2; x++) {
                    for (let z = -2; z <= 2; z++) {
                        // Skip corners for slight rounding
                        if ((Math.abs(x) === 2 && Math.abs(z) === 2)) continue;
                        
                        const voxelType = mapColorToVoxelType(colors.bodyPink);
                        addTrackedVoxel(voxelType, centerX + x, baseHeight + y, centerZ + z);
                    }
                }
            }
            
            // Eyes - larger orange squares
            // Left eye
            for (let x = -2; x <= -1; x++) {
                for (let z = -3; z <= -2; z++) {
                    addTrackedVoxel(mapColorToVoxelType(colors.orange), centerX + x, baseHeight + 6, centerZ + z);
                }
            }
            // Right eye
            for (let x = 1; x <= 2; x++) {
                for (let z = -3; z <= -2; z++) {
                    addTrackedVoxel(mapColorToVoxelType(colors.orange), centerX + x, baseHeight + 6, centerZ + z);
                }
            }
            
            // Smile - wider blue smile
            for (let x = -2; x <= 2; x++) {
                addTrackedVoxel(mapColorToVoxelType(colors.detailBlue), centerX + x, baseHeight + 4, centerZ - 2);
            }
            
            // Torso - larger, blocky rectangular shape
            for (let y = 1; y <= 3; y++) {
                for (let x = -3; x <= 3; x++) {
                    for (let z = -2; z <= 2; z++) {
                        // Skip corners for slight shape refinement
                        if ((Math.abs(x) === 3 && Math.abs(z) === 2)) continue;
                        
                        const voxelType = mapColorToVoxelType(colors.bodyPink);
                        addTrackedVoxel(voxelType, centerX + x, baseHeight + y, centerZ + z);
                    }
                }
            }
            
            // Arms - thicker and more rectangular to match childlike drawing
            // Left arm
            for (let x = -6; x <= -3; x++) {
                for (let y = 2; y <= 3; y++) {
                    addTrackedVoxel(mapColorToVoxelType(colors.bodyPink), centerX + x, baseHeight + y, centerZ);
                }
            }
            // Right arm
            for (let x = 3; x <= 6; x++) {
                for (let y = 2; y <= 3; y++) {
                    addTrackedVoxel(mapColorToVoxelType(colors.bodyPink), centerX + x, baseHeight + y, centerZ);
                }
            }
            
            // Joints with orange color (shoulders)
            // Left shoulder joint
            for (let y = 2; y <= 3; y++) {
                for (let z = -1; z <= 1; z++) {
                    addTrackedVoxel(mapColorToVoxelType(colors.orange), centerX - 3, baseHeight + y, centerZ + z);
                }
            }
            // Right shoulder joint
            for (let y = 2; y <= 3; y++) {
                for (let z = -1; z <= 1; z++) {
                    addTrackedVoxel(mapColorToVoxelType(colors.orange), centerX + 3, baseHeight + y, centerZ + z);
                }
            }
            
            // Thicker legs
            // Left leg
            for (let y = -3; y <= 0; y++) {
                for (let x = -2; x <= -1; x++) {
                    for (let z = -1; z <= 1; z++) {
                        addTrackedVoxel(mapColorToVoxelType(colors.bodyPink), centerX + x, baseHeight + y, centerZ + z);
                    }
                }
            }
            // Right leg
            for (let y = -3; y <= 0; y++) {
                for (let x = 1; x <= 2; x++) {
                    for (let z = -1; z <= 1; z++) {
                        addTrackedVoxel(mapColorToVoxelType(colors.bodyPink), centerX + x, baseHeight + y, centerZ + z);
                    }
                }
            }
            
            // Blue shoulder accents - made larger and more prominent
            for (let x = -3; x <= -1; x++) {
                for (let z = 2; z <= 3; z++) {
                    addTrackedVoxel(mapColorToVoxelType(colors.detailBlue), centerX + x, baseHeight + 3, centerZ + z);
                }
            }
            for (let x = 1; x <= 3; x++) {
                for (let z = 2; z <= 3; z++) {
                    addTrackedVoxel(mapColorToVoxelType(colors.detailBlue), centerX + x, baseHeight + 3, centerZ + z);
                }
            }
            
            return true;
        } catch (characterError) {
            console.error("❌ Error creating character:", characterError);
            error = `Error creating character: ${characterError}`;
            return false;
        }
    }
    
    async function createAccessories() {
        try {
            // Position the trident in the character's hand (left arm)
            const tridentX = -6;
            const tridentZ = 0;
            const baseHeight = 1;
            
            // Trident handle (black) - Make thicker and more prominent
            for (let y = 0; y <= 7; y++) {
                addTrackedVoxel(mapColorToVoxelType(colors.tridentBase), tridentX, baseHeight + y, tridentZ);
                // Make the handle thicker
                if (y >= 3 && y <= 6) {
                    addTrackedVoxel(mapColorToVoxelType(colors.tridentBase), tridentX - 1, baseHeight + y, tridentZ);
                }
            }
            
            // Trident tips (lilac) - Make larger and more distinct
            // Left tip
            for (let y = 6; y <= 7; y++) {
                addTrackedVoxel(mapColorToVoxelType(colors.tridentTips), tridentX - 2, baseHeight + y, tridentZ);
            }
            // Middle tip (taller)
            for (let y = 6; y <= 8; y++) {
                addTrackedVoxel(mapColorToVoxelType(colors.tridentTips), tridentX, baseHeight + y, tridentZ);
            }
            // Right tip
            for (let y = 6; y <= 7; y++) {
                addTrackedVoxel(mapColorToVoxelType(colors.tridentTips), tridentX + 1, baseHeight + y, tridentZ);
            }
            
            // Ring-like object (orange outline) - in character's right hand
            const ringX = 6;
            const ringZ = 0;
            
            // Create a more defined ring shape
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const rx = Math.round(Math.cos(angle) * 2);
                const ry = Math.round(Math.sin(angle) * 2);
                
                addTrackedVoxel(mapColorToVoxelType(colors.orange), ringX + rx, baseHeight + 3 + ry, ringZ);
            }
            
            return true;
        } catch (detailsError) {
            console.error("Error creating accessories:", detailsError);
            error = `Error creating accessories: ${detailsError}`;
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
    
    <div class="component-indicator">
        <p>⭐ IMAGE-BASED COMPONENT ACTIVE ⭐</p>
    </div>
    
    <div class="voxel-count">
        <p>Voxels added: {voxelsAdded}</p>
    </div>
    
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
    
    .component-indicator {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: rgba(255, 215, 0, 0.8);
        color: black;
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 4px;
        z-index: 1000;
    }
    
    .voxel-count {
        position: absolute;
        top: 50px;
        right: 10px;
        background-color: rgba(0, 0, 255, 0.7);
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
