<script lang="ts">
    import { onMount } from 'svelte';
    import { voxelGameStore } from '../../stores/voxel/voxelGameStore';
    
    let canvasElement: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    
    // Error state
    let error: string | null = null;
    
    // Camera position and rotation
    let cameraPosition = { x: 0, y: 5, z: 12 }; // Better initial position to see the character
    let cameraRotation = { yaw: 180, pitch: 0 }; // Face toward the character
    
    // Grid settings
    const gridSize = 20;
    const cellSize = 30;
    
    // Colors
    const colors = {
        sky: '#87CEEB',
        ground: '#8B4513',
        grid: '#FFFFFF',
        player: '#FF0000',
        text: '#FFFFFF'
    };
    
    // Tutorial state
    let showHelp = true;
    
    // Check if we're in the browser
    const isBrowser = typeof window !== 'undefined';
    
    // Handle keyboard input
    function handleKeyDown(event: KeyboardEvent) {
        try {
            const speed = 0.5;
            
            // Calculate movement direction
            const forward = {
                x: Math.sin(cameraRotation.yaw * Math.PI / 180),
                z: Math.cos(cameraRotation.yaw * Math.PI / 180)
            };
            
            const right = {
                x: Math.sin((cameraRotation.yaw + 90) * Math.PI / 180),
                z: Math.cos((cameraRotation.yaw + 90) * Math.PI / 180)
            };
            
            // Handle movement keys - FIXED WASD directions
            switch (event.code) {
                case 'KeyW':
                    cameraPosition.x += forward.x * speed;
                    cameraPosition.z -= forward.z * speed;
                    break;
                case 'KeyS':
                    cameraPosition.x -= forward.x * speed;
                    cameraPosition.z += forward.z * speed;
                    break;
                case 'KeyA':
                    cameraPosition.x -= right.x * speed;
                    cameraPosition.z += right.z * speed;
                    break;
                case 'KeyD':
                    cameraPosition.x += right.x * speed;
                    cameraPosition.z -= right.z * speed;
                    break;
                case 'Space':
                    cameraPosition.y += speed;
                    break;
                case 'ShiftLeft':
                    cameraPosition.y -= speed;
                    break;
            }
            
            // Update the store
            voxelGameStore.update(state => ({
                ...state,
                playerPosition: { ...cameraPosition }
            }));
            
            // Redraw
            render();
        } catch (e) {
            console.error("Error in handleKeyDown:", e);
            error = `Error handling key input: ${e}`;
        }
    }
    
    // Handle mouse movement
    function handleMouseMove(event: MouseEvent) {
        if (isBrowser && document.pointerLockElement === canvasElement) {
            cameraRotation.yaw = (cameraRotation.yaw + event.movementX * 0.5) % 360;
            cameraRotation.pitch = Math.max(-89, Math.min(89, cameraRotation.pitch - event.movementY * 0.5));
            
            // Update the store
            voxelGameStore.update(state => ({
                ...state,
                playerRotation: { ...cameraRotation }
            }));
            
            // Redraw
            render();
        }
    }
    
    // Request pointer lock
    function requestPointerLock() {
        if (isBrowser) {
            canvasElement.requestPointerLock();
            showHelp = false; // Hide help after clicking
        }
    }
    
    // Game loop function for animation
    function gameLoop() {
        try {
            // Render the current frame
            render();
            
            // Request the next frame
            if (isBrowser) {
                requestAnimationFrame(gameLoop);
            }
        } catch (e) {
            console.error("Error in game loop:", e);
            error = `Error in animation loop: ${e}`;
        }
    }
    
    // Render the scene
    function render() {
        try {
            if (!ctx) {
                error = "Canvas context is not available";
                return;
            }
            
            const width = canvasElement.width;
            const height = canvasElement.height;
            
            // Clear canvas
            ctx.fillStyle = colors.sky;
            ctx.fillRect(0, 0, width, height);
            
            // Draw ground
            ctx.fillStyle = colors.ground;
            ctx.fillRect(0, height / 2, width, height / 2);
            
            // Draw grid
            ctx.strokeStyle = colors.grid;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            
            // Calculate grid offset based on camera position
            const offsetX = (cameraPosition.x * cellSize) % cellSize;
            const offsetZ = (cameraPosition.z * cellSize) % cellSize;
            
            // Draw vertical grid lines
            for (let i = -gridSize; i <= gridSize; i++) {
                const x = width / 2 + i * cellSize - offsetX;
                ctx.beginPath();
                ctx.moveTo(x, height / 2);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            
            // Draw horizontal grid lines
            for (let i = 0; i <= gridSize; i++) {
                const y = height / 2 + i * cellSize - offsetZ;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1.0;
            
            // Draw player position indicator
            ctx.fillStyle = colors.player;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw direction indicator
            const dirX = width / 2 + Math.sin(cameraRotation.yaw * Math.PI / 180) * 20;
            const dirY = height / 2 - Math.cos(cameraRotation.yaw * Math.PI / 180) * 20;
            ctx.beginPath();
            ctx.moveTo(width / 2, height / 2);
            ctx.lineTo(dirX, dirY);
            ctx.stroke();
            
            // Draw HUD
            ctx.fillStyle = colors.text;
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Position: X: ${cameraPosition.x.toFixed(2)}, Y: ${cameraPosition.y.toFixed(2)}, Z: ${cameraPosition.z.toFixed(2)}`, 10, 20);
            ctx.fillText(`Rotation: Yaw: ${cameraRotation.yaw.toFixed(2)}°, Pitch: ${cameraRotation.pitch.toFixed(2)}°`, 10, 40);
            ctx.fillText('WASD: Move, Space/Shift: Up/Down, Mouse: Look', 10, 60);
        } catch (e) {
            console.error("Error in render function:", e);
            error = `Error rendering: ${e}`;
        }
    }
    
    // Handle window resize
    function handleResize() {
        if (!canvasElement) return;
        
        if (isBrowser) {
            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;
            
            render();
        }
    }
    
    onMount(() => {
        try {
            console.log("VoxelGameCanvas mounted");
            
            if (!canvasElement) {
                error = "Canvas element not found";
                return;
            }
            
            // Get the canvas context
            ctx = canvasElement.getContext('2d');
            
            if (!ctx) {
                error = "Could not get 2D context from canvas";
                return;
            }
            
            console.log("Canvas context obtained successfully");
            
            // Handle resize
            handleResize();
            
            // Add event listeners
            if (isBrowser) {
                window.addEventListener('keydown', handleKeyDown);
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('resize', handleResize);
                canvasElement.addEventListener('click', requestPointerLock);
                
                // Set up pointer lock change detection
                document.addEventListener('pointerlockchange', () => {
                    voxelGameStore.update(state => ({
                        ...state,
                        isPointerLocked: document.pointerLockElement === canvasElement
                    }));
                    render();
                });
                
                // Start the render loop
                requestAnimationFrame(gameLoop);
            }
            
            // Cleanup on unmount
            return () => {
                if (isBrowser) {
                    window.removeEventListener('keydown', handleKeyDown);
                    window.removeEventListener('mousemove', handleMouseMove);
                    window.removeEventListener('resize', handleResize);
                    canvasElement.removeEventListener('click', requestPointerLock);
                    document.removeEventListener('pointerlockchange', () => {});
                }
            };
        } catch (e) {
            console.error("Error in VoxelGameCanvas onMount:", e);
            error = `Error initializing canvas: ${e}`;
        }
    });
    
    // Compute if pointer is locked (for the class binding)
    $: isPointerLocked = isBrowser && document.pointerLockElement === canvasElement;
</script>

{#if error}
<div class="error-container">
    <h3>Canvas Error:</h3>
    <pre>{error}</pre>
</div>
{/if}

<canvas bind:this={canvasElement} class="voxel-canvas"></canvas>

<div class="instructions" class:hidden={isPointerLocked || !showHelp}>
    <h2>Voxel Game</h2>
    <p>Click to start</p>
    <div class="controls">
        <h3>Controls:</h3>
        <ul>
            <li>W/A/S/D: Move</li>
            <li>Space: Move up</li>
            <li>Shift: Move down</li>
            <li>Mouse: Look around</li>
            <li>ESC: Release mouse</li>
        </ul>
    </div>
</div>

<style>
    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
    
    .instructions {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        font-family: sans-serif;
    }
    
    .hidden {
        display: none;
    }
    
    .controls {
        text-align: left;
        margin-top: 20px;
    }
    
    h2 {
        margin-top: 0;
    }
    
    ul {
        padding-left: 20px;
    }
    
    .voxel-canvas {
        width: 100%;
        height: 100%;
        display: block;
    }
    
    /* Error display */
    .error-container {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        background-color: rgba(255, 0, 0, 0.8);
        border-radius: 4px;
        padding: 1rem;
        z-index: 1000;
        color: white;
        max-height: 50%;
        overflow-y: auto;
    }
    
    .error-container h3 {
        margin-top: 0;
        color: white;
    }
    
    pre {
        white-space: pre-wrap;
        word-break: break-word;
    }
</style>
