<script lang="ts">
    import { onMount } from 'svelte';
    import { GameEngine } from '../core/GameEngine';
    import { BlockType } from '../voxel/VoxelData';
    
    let canvasElement: HTMLCanvasElement;
    let engine: GameEngine;
    let animationFrameId: number;
    
    // Player movement state
    let keys = new Set<string>();
    let playerSpeed = 0.1;
    
    function handleKeyDown(event: KeyboardEvent) {
        keys.add(event.code);
    }
    
    function handleKeyUp(event: KeyboardEvent) {
        keys.delete(event.code);
    }
    
    function handleClick(event: MouseEvent) {
        if (!engine) return;
        
        // Place a block at the player's position
        const pos = engine.getPlayerPosition();
        const blockX = Math.floor(pos.x);
        const blockY = Math.floor(pos.y);
        const blockZ = Math.floor(pos.z);
        
        // Left click places a stone block
        if (event.button === 0) {
            engine.setBlock(blockX, blockY, blockZ, BlockType.STONE);
        }
        // Right click places a grass block
        else if (event.button === 2) {
            engine.setBlock(blockX, blockY, blockZ, BlockType.GRASS);
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
        
        // Handle keyboard input for movement
        if (keys.has('KeyW')) z += playerSpeed;
        if (keys.has('KeyS')) z -= playerSpeed;
        if (keys.has('KeyA')) x -= playerSpeed;
        if (keys.has('KeyD')) x += playerSpeed;
        if (keys.has('Space')) y += playerSpeed;
        if (keys.has('ShiftLeft')) y -= playerSpeed;
        
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
    
    onMount(() => {
        // Initialize the engine
        engine = new GameEngine(canvasElement);
        
        // Set initial player position
        engine.setPlayerPosition(8, 20, 8);
        
        // Set initial canvas size
        handleResize();
        
        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('resize', handleResize);
        
        // Start game loop
        animationFrameId = requestAnimationFrame(gameLoop);
        
        // Prevent context menu on right-click
        canvasElement.addEventListener('contextmenu', (e) => e.preventDefault());
        
        return () => {
            // Clean up
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
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
    
    <div class="controls-info">
        <h3>Controls:</h3>
        <ul>
            <li>W/A/S/D: Move</li>
            <li>Space: Move Up</li>
            <li>Shift: Move Down</li>
            <li>Left Click: Place Stone</li>
            <li>Right Click: Place Grass</li>
        </ul>
    </div>
</div>

<style>
    .voxel-demo {
        position: relative;
        width: 100%;
        height: 100%;
    }
    
    canvas {
        display: block;
        width: 100%;
        height: 100%;
        background-color: #87CEEB;
    }
    
    .controls-info {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: sans-serif;
    }
    
    h3 {
        margin-top: 0;
    }
    
    ul {
        padding-left: 20px;
        margin-bottom: 0;
    }
</style> 