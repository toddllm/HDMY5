<script lang="ts">
    import { onMount } from 'svelte';
    import { GameEngine } from '../core/GameEngine';
    import { BlockType } from '../voxel/VoxelData';
    
    let canvasElement: HTMLCanvasElement;
    let engine: GameEngine;
    let animationFrameId: number;
    
    // Player movement state
    let keys = new Set<string>();
    let playerSpeed = 0.15;
    let isJumping = false;
    let verticalVelocity = 0;
    let gravity = 0.01;
    let jumpStrength = 0.3;
    
    // Hotbar state
    let selectedBlockIndex = 0;
    const blockTypes = [
        { type: BlockType.DIRT, name: 'Dirt' },
        { type: BlockType.GRASS, name: 'Grass' },
        { type: BlockType.STONE, name: 'Stone' },
        { type: BlockType.WOOD, name: 'Wood' },
        { type: BlockType.LEAVES, name: 'Leaves' },
        { type: BlockType.SAND, name: 'Sand' },
        { type: BlockType.COBBLESTONE, name: 'Cobblestone' },
        { type: BlockType.PLANKS, name: 'Planks' },
        { type: BlockType.GLASS, name: 'Glass' }
    ];
    
    // Game state
    let isPointerLocked = false;
    let yaw = 0;
    let pitch = 0;
    let mouseSensitivity = 0.002;
    
    // Add a mode toggle for placing/breaking blocks
    let mode = 'break'; // 'break' or 'place'
    
    function toggleMode() {
        mode = mode === 'break' ? 'place' : 'break';
    }
    
    function handleKeyDown(event: KeyboardEvent) {
        keys.add(event.code);
        
        // Handle hotbar selection with number keys
        if (event.code.startsWith('Digit') && !event.repeat) {
            const digit = parseInt(event.code.substring(5));
            if (digit >= 1 && digit <= blockTypes.length) {
                selectedBlockIndex = digit - 1;
            }
        }
        
        // Handle jumping
        if (event.code === 'Space' && !isJumping) {
            isJumping = true;
            verticalVelocity = jumpStrength;
        }
        
        // Toggle between place/break mode with 'F' key
        if (event.code === 'KeyF' && !event.repeat) {
            toggleMode();
        }
    }
    
    function handleKeyUp(event: KeyboardEvent) {
        keys.delete(event.code);
    }
    
    function handleMouseMove(event: MouseEvent) {
        if (!isPointerLocked) return;
        
        // Update camera rotation
        yaw -= event.movementX * mouseSensitivity;
        pitch -= event.movementY * mouseSensitivity;
        
        // Clamp pitch to avoid flipping
        pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));
    }
    
    function handleClick(event: MouseEvent) {
        if (!engine || !isPointerLocked) return;
        
        // Request pointer lock if not already locked
        if (!isPointerLocked) {
            canvasElement.requestPointerLock();
            return;
        }
        
        const pos = engine.getPlayerPosition();
        const direction = getViewDirection();
        
        // Raycast to find block position
        const maxDistance = 5;
        let hitPos = null;
        
        // Simple raycast algorithm
        for (let t = 0; t < maxDistance; t += 0.1) {
            const x = Math.floor(pos.x + direction.x * t);
            const y = Math.floor(pos.y + direction.y * t);
            const z = Math.floor(pos.z + direction.z * t);
            
            const blockType = engine.getBlock(x, y, z);
            
            if (blockType !== BlockType.AIR && blockType !== BlockType.WATER) {
                hitPos = { x, y, z };
                break;
            }
        }
        
        if (hitPos) {
            // Left click behavior depends on mode
            if (event.button === 0) {
                if (mode === 'break') {
                    // Break block
                    engine.setBlock(hitPos.x, hitPos.y, hitPos.z, BlockType.AIR);
                } else {
                    // Place block
                    const normal = getNormal(pos, hitPos);
                    const placeX = hitPos.x + normal.x;
                    const placeY = hitPos.y + normal.y;
                    const placeZ = hitPos.z + normal.z;
                    
                    // Don't place blocks inside the player
                    const playerX = Math.floor(pos.x);
                    const playerY = Math.floor(pos.y);
                    const playerZ = Math.floor(pos.z);
                    
                    if (placeX !== playerX || placeY !== playerY || placeZ !== playerZ) {
                        engine.setBlock(placeX, placeY, placeZ, blockTypes[selectedBlockIndex].type);
                    }
                }
            }
            // Right click (if available) always does the opposite of current mode
            else if (event.button === 2) {
                if (mode === 'break') {
                    // Place block
                    const normal = getNormal(pos, hitPos);
                    const placeX = hitPos.x + normal.x;
                    const placeY = hitPos.y + normal.y;
                    const placeZ = hitPos.z + normal.z;
                    
                    // Don't place blocks inside the player
                    const playerX = Math.floor(pos.x);
                    const playerY = Math.floor(pos.y);
                    const playerZ = Math.floor(pos.z);
                    
                    if (placeX !== playerX || placeY !== playerY || placeZ !== playerZ) {
                        engine.setBlock(placeX, placeY, placeZ, blockTypes[selectedBlockIndex].type);
                    }
                } else {
                    // Break block
                    engine.setBlock(hitPos.x, hitPos.y, hitPos.z, BlockType.AIR);
                }
            }
        }
    }
    
    function getNormal(from: {x: number, y: number, z: number}, to: {x: number, y: number, z: number}) {
        // Calculate which face of the block was hit
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dz = to.z - from.z;
        
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const absDz = Math.abs(dz);
        
        if (absDx > absDy && absDx > absDz) {
            return { x: dx > 0 ? -1 : 1, y: 0, z: 0 };
        } else if (absDy > absDx && absDy > absDz) {
            return { x: 0, y: dy > 0 ? -1 : 1, z: 0 };
        } else {
            return { x: 0, y: 0, z: dz > 0 ? -1 : 1 };
        }
    }
    
    function getViewDirection() {
        // Calculate view direction based on yaw and pitch
        return {
            x: Math.sin(yaw) * Math.cos(pitch),
            y: Math.sin(pitch),
            z: Math.cos(yaw) * Math.cos(pitch)
        };
    }
    
    function handlePointerLockChange() {
        isPointerLocked = document.pointerLockElement === canvasElement;
    }
    
    function handleWheel(event: WheelEvent) {
        // Scroll through hotbar
        if (event.deltaY > 0) {
            selectedBlockIndex = (selectedBlockIndex + 1) % blockTypes.length;
        } else {
            selectedBlockIndex = (selectedBlockIndex - 1 + blockTypes.length) % blockTypes.length;
        }
    }
    
    function handleResize() {
        if (!engine) return;
        
        engine.resize(window.innerWidth, window.innerHeight);
    }
    
    function updatePlayerPosition() {
        if (!engine) return;
        
        const pos = engine.getPlayerPosition();
        let x = pos.x;
        let y = pos.y;
        let z = pos.z;
        
        // Apply gravity
        if (isJumping) {
            verticalVelocity -= gravity;
            y += verticalVelocity;
            
            // Check if we've landed
            if (verticalVelocity < 0) {
                const blockBelow = engine.getBlock(Math.floor(x), Math.floor(y - 0.1), Math.floor(z));
                if (blockBelow !== BlockType.AIR && blockBelow !== BlockType.WATER) {
                    isJumping = false;
                    verticalVelocity = 0;
                }
            }
        }
        
        // Calculate movement direction based on camera rotation
        const forward = {
            x: Math.sin(yaw),
            z: Math.cos(yaw)
        };
        
        const right = {
            x: Math.sin(yaw + Math.PI / 2),
            z: Math.cos(yaw + Math.PI / 2)
        };
        
        // Handle keyboard input for movement
        if (keys.has('KeyW')) {
            x += forward.x * playerSpeed;
            z += forward.z * playerSpeed;
        }
        if (keys.has('KeyS')) {
            x -= forward.x * playerSpeed;
            z -= forward.z * playerSpeed;
        }
        if (keys.has('KeyA')) {
            x -= right.x * playerSpeed;
            z -= right.z * playerSpeed;
        }
        if (keys.has('KeyD')) {
            x += right.x * playerSpeed;
            z += right.z * playerSpeed;
        }
        
        // Update player position
        engine.setPlayerPosition(x, y, z);
    }
    
    function gameLoop(_timestamp: number) {
        if (!engine) return;
        
        // Update player position based on input
        updatePlayerPosition();
        
        // Update game state
        engine.update(1/60); // Assuming 60 FPS
        
        // Render the scene
        engine.render();
        
        // Request next frame
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    function getBlockColor(blockType: BlockType): string {
        switch (blockType) {
            case BlockType.DIRT: return '#8B4513';
            case BlockType.GRASS: return '#33A033';
            case BlockType.STONE: return '#808080';
            case BlockType.WOOD: return '#8B5A2B';
            case BlockType.LEAVES: return '#228B22';
            case BlockType.SAND: return '#F0E68C';
            case BlockType.WATER: return '#4169E1';
            case BlockType.COAL_ORE: return '#333333';
            case BlockType.IRON_ORE: return '#BDB76B';
            case BlockType.GOLD_ORE: return '#FFD700';
            case BlockType.DIAMOND_ORE: return '#00FFFF';
            case BlockType.BEDROCK: return '#1A1A1A';
            case BlockType.COBBLESTONE: return '#696969';
            case BlockType.PLANKS: return '#DEB887';
            case BlockType.GLASS: return '#E6E6FA';
            default: return '#FFFFFF';
        }
    }
    
    onMount(() => {
        // Initialize the engine
        engine = new GameEngine(canvasElement);
        
        // Set initial player position
        engine.setPlayerPosition(8, 30, 8);
        
        // Set initial canvas size
        handleResize();
        
        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        window.addEventListener('wheel', handleWheel);
        document.addEventListener('pointerlockchange', handlePointerLockChange);
        
        // Start game loop
        animationFrameId = requestAnimationFrame(gameLoop);
        
        // Prevent context menu on right-click
        canvasElement.addEventListener('contextmenu', (e) => e.preventDefault());
        
        return () => {
            // Clean up
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('wheel', handleWheel);
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            canvasElement.removeEventListener('contextmenu', (e) => e.preventDefault());
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            if (engine) {
                engine.dispose();
            }
        };
    });
</script>

<div class="voxel-demo">
    <canvas 
        bind:this={canvasElement} 
        on:click={handleClick}
        on:contextmenu|preventDefault
    ></canvas>
    
    {#if !isPointerLocked}
        <div class="start-screen">
            <h2>Minecraft-like Voxel Demo</h2>
            <p>Click to start</p>
            <div class="controls-info">
                <h3>Controls:</h3>
                <ul>
                    <li>W/A/S/D: Move</li>
                    <li>Space: Jump</li>
                    <li>Mouse: Look around</li>
                    <li>Left Click: {mode === 'break' ? 'Break block' : 'Place block'}</li>
                    <li>Right Click: {mode === 'break' ? 'Place block' : 'Break block'}</li>
                    <li>F: Toggle between break/place mode</li>
                    <li>1-9: Select block</li>
                    <li>Mouse Wheel: Cycle blocks</li>
                    <li>ESC: Release mouse</li>
                </ul>
            </div>
        </div>
    {:else}
        <!-- Crosshair -->
        <div class="crosshair">+</div>
        
        <!-- Mode indicator -->
        <div class="mode-indicator">
            Mode: {mode === 'break' ? 'Break' : 'Place'} (Press F to toggle)
        </div>
        
        <!-- Hotbar -->
        <div class="hotbar">
            {#each blockTypes as block, i}
                <div class="hotbar-slot" class:selected={i === selectedBlockIndex}>
                    <div class="block-icon" style="background-color: {getBlockColor(block.type)}"></div>
                    <div class="slot-number">{i + 1}</div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .voxel-demo {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    
    canvas {
        display: block;
        width: 100%;
        height: 100%;
        background-color: #87CEEB;
        cursor: crosshair;
    }
    
    .start-screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-family: 'Minecraft', sans-serif;
    }
    
    .start-screen h2 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    
    .start-screen p {
        font-size: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .controls-info {
        background-color: rgba(0, 0, 0, 0.7);
        padding: 1rem;
        border-radius: 5px;
        max-width: 400px;
    }
    
    .controls-info h3 {
        margin-top: 0;
        margin-bottom: 0.5rem;
    }
    
    .controls-info ul {
        padding-left: 1.5rem;
        margin-bottom: 0;
    }
    
    .crosshair {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 1.5rem;
        pointer-events: none;
    }
    
    .hotbar {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 4px;
        border-radius: 4px;
    }
    
    .hotbar-slot {
        width: 50px;
        height: 50px;
        background-color: rgba(255, 255, 255, 0.2);
        border: 2px solid #555;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }
    
    .hotbar-slot.selected {
        border-color: white;
        background-color: rgba(255, 255, 255, 0.4);
    }
    
    .block-icon {
        width: 32px;
        height: 32px;
        border: 1px solid #333;
    }
    
    .slot-number {
        position: absolute;
        top: 2px;
        left: 2px;
        font-size: 10px;
        color: white;
    }
    
    .mode-indicator {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-family: sans-serif;
        pointer-events: none;
    }
</style> 