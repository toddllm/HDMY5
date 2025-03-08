<script lang="ts">
    import { onMount } from 'svelte';
    import { voxelGameStore } from '../../stores/voxel/voxelGameStore';
    
    let canvasElement: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    
    // Camera position and rotation
    let cameraPosition = { x: 0, y: 2, z: 5 };
    let cameraRotation = { yaw: 0, pitch: 0 };
    
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
    
    // Handle keyboard input
    function handleKeyDown(event: KeyboardEvent) {
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
        
        // Handle movement keys
        switch (event.code) {
            case 'KeyW':
                cameraPosition.x += forward.x * speed;
                cameraPosition.z += forward.z * speed;
                break;
            case 'KeyS':
                cameraPosition.x -= forward.x * speed;
                cameraPosition.z -= forward.z * speed;
                break;
            case 'KeyA':
                cameraPosition.x += right.x * speed;
                cameraPosition.z += right.z * speed;
                break;
            case 'KeyD':
                cameraPosition.x -= right.x * speed;
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
    }
    
    // Handle mouse movement
    function handleMouseMove(event: MouseEvent) {
        if (document.pointerLockElement === canvasElement) {
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
        canvasElement.requestPointerLock();
    }
    
    // Render the scene
    function render() {
        if (!ctx) return;
        
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
    }
    
    // Handle window resize
    function handleResize() {
        if (!canvasElement) return;
        
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
        
        render();
    }
    
    onMount(() => {
        // Initialize canvas
        ctx = canvasElement.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2D context');
            return;
        }
        
        // Set canvas size
        handleResize();
        
        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        canvasElement.addEventListener('click', requestPointerLock);
        
        // Initial render
        render();
        
        // Set up pointer lock change detection
        document.addEventListener('pointerlockchange', () => {
            voxelGameStore.update(state => ({
                ...state,
                isPointerLocked: document.pointerLockElement === canvasElement
            }));
            render();
        });
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            canvasElement.removeEventListener('click', requestPointerLock);
            document.removeEventListener('pointerlockchange', () => {});
        };
    });
</script>

<canvas bind:this={canvasElement}></canvas>

<div class="instructions" class:hidden={document.pointerLockElement === canvasElement}>
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
</style>
