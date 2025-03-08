#!/bin/bash

# Script to enhance the voxel game with 3D rendering capabilities

echo "Enhancing voxel game with 3D rendering capabilities..."

# Update the VoxelGameCanvas component to use WebGL for 3D rendering
cat > src/lib/components/voxel/VoxelGameCanvas.svelte << EOL
<script lang="ts">
    import { onMount } from 'svelte';
    import { voxelGameStore, type VoxelType } from '../../stores/voxel/voxelGameStore';
    
    let canvasElement: HTMLCanvasElement;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    
    // Shader sources
    const vertexShaderSource = \`
        attribute vec3 aPosition;
        attribute vec3 aColor;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec3 vColor;
        
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
            vColor = aColor;
        }
    \`;
    
    const fragmentShaderSource = \`
        precision mediump float;
        varying vec3 vColor;
        
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    \`;
    
    // Matrices
    let projectionMatrix = new Float32Array(16);
    let modelViewMatrix = new Float32Array(16);
    
    // Camera position and rotation
    let cameraPosition = { x: 0, y: 0, z: 5 };
    let cameraRotation = { yaw: 0, pitch: 0 };
    
    // Buffers
    let positionBuffer: WebGLBuffer | null = null;
    let colorBuffer: WebGLBuffer | null = null;
    
    // Initialize WebGL
    function initWebGL() {
        gl = canvasElement.getContext('webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return false;
        }
        
        // Create shader program
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
            return false;
        }
        
        program = createProgram(gl, vertexShader, fragmentShader);
        
        if (!program) {
            return false;
        }
        
        // Create buffers
        positionBuffer = gl.createBuffer();
        colorBuffer = gl.createBuffer();
        
        // Set clear color (sky blue)
        gl.clearColor(0.5, 0.7, 1.0, 1.0);
        
        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        
        return true;
    }
    
    // Create a shader
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
        const shader = gl.createShader(type);
        if (!shader) {
            console.error('Failed to create shader');
            return null;
        }
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    // Create a shader program
    function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = gl.createProgram();
        if (!program) {
            console.error('Failed to create program');
            return null;
        }
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    // Create a simple cube
    function createCube(x: number, y: number, z: number, size: number, color: [number, number, number]) {
        const positions = [
            // Front face
            x - size, y - size, z + size,
            x + size, y - size, z + size,
            x + size, y + size, z + size,
            x - size, y + size, z + size,
            
            // Back face
            x - size, y - size, z - size,
            x - size, y + size, z - size,
            x + size, y + size, z - size,
            x + size, y - size, z - size,
            
            // Top face
            x - size, y + size, z - size,
            x - size, y + size, z + size,
            x + size, y + size, z + size,
            x + size, y + size, z - size,
            
            // Bottom face
            x - size, y - size, z - size,
            x + size, y - size, z - size,
            x + size, y - size, z + size,
            x - size, y - size, z + size,
            
            // Right face
            x + size, y - size, z - size,
            x + size, y + size, z - size,
            x + size, y + size, z + size,
            x + size, y - size, z + size,
            
            // Left face
            x - size, y - size, z - size,
            x - size, y - size, z + size,
            x - size, y + size, z + size,
            x - size, y + size, z - size
        ];
        
        const indices = [
            0, 1, 2, 0, 2, 3,       // Front face
            4, 5, 6, 4, 6, 7,       // Back face
            8, 9, 10, 8, 10, 11,    // Top face
            12, 13, 14, 12, 14, 15, // Bottom face
            16, 17, 18, 16, 18, 19, // Right face
            20, 21, 22, 20, 22, 23  // Left face
        ];
        
        const vertexPositions = [];
        for (const i of indices) {
            vertexPositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        }
        
        const colors = [];
        for (let i = 0; i < 36; i++) {
            colors.push(...color);
        }
        
        return { positions: vertexPositions, colors };
    }
    
    // Create a perspective matrix
    function perspective(fieldOfView: number, aspect: number, near: number, far: number) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView);
        const rangeInv = 1.0 / (near - far);
        
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }
    
    // Create a model-view matrix
    function createModelViewMatrix() {
        // Convert rotation to radians
        const yawRad = cameraRotation.yaw * Math.PI / 180;
        const pitchRad = cameraRotation.pitch * Math.PI / 180;
        
        // Calculate direction vector
        const dx = Math.sin(yawRad) * Math.cos(pitchRad);
        const dy = Math.sin(pitchRad);
        const dz = Math.cos(yawRad) * Math.cos(pitchRad);
        
        // Calculate camera target
        const target = {
            x: cameraPosition.x + dx,
            y: cameraPosition.y + dy,
            z: cameraPosition.z + dz
        };
        
        // Create look-at matrix
        const up = [0, 1, 0];
        const eye = [cameraPosition.x, cameraPosition.y, cameraPosition.z];
        const center = [target.x, target.y, target.z];
        
        const z0 = eye[0] - center[0];
        const z1 = eye[1] - center[1];
        const z2 = eye[2] - center[2];
        
        // Normalize z
        let len = Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        if (len > 0) {
            len = 1 / len;
            z0 *= len;
            z1 *= len;
            z2 *= len;
        }
        
        // Cross product of up and z to get x
        const x0 = up[1] * z2 - up[2] * z1;
        const x1 = up[2] * z0 - up[0] * z2;
        const x2 = up[0] * z1 - up[1] * z0;
        
        // Normalize x
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (len > 0) {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
        
        // Cross product of z and x to get y
        const y0 = z1 * x2 - z2 * x1;
        const y1 = z2 * x0 - z0 * x2;
        const y2 = z0 * x1 - z1 * x0;
        
        // Set model-view matrix
        return [
            x0, y0, z0, 0,
            x1, y1, z1, 0,
            x2, y2, z2, 0,
            -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
            -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
            -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]),
            1
        ];
    }
    
    // Render the scene
    function render() {
        if (!gl || !program) return;
        
        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Set up viewport
        gl.viewport(0, 0, canvasElement.width, canvasElement.height);
        
        // Use shader program
        gl.useProgram(program);
        
        // Create a cube
        const cube = createCube(0, 0, 0, 0.5, [0.5, 0.5, 0.5]);
        
        // Set up position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.positions), gl.STATIC_DRAW);
        
        const positionAttribLocation = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
        
        // Set up color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);
        
        const colorAttribLocation = gl.getAttribLocation(program, 'aColor');
        gl.enableVertexAttribArray(colorAttribLocation);
        gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 0, 0);
        
        // Set up matrices
        const aspect = canvasElement.width / canvasElement.height;
        projectionMatrix = new Float32Array(perspective(45 * Math.PI / 180, aspect, 0.1, 100.0));
        modelViewMatrix = new Float32Array(createModelViewMatrix());
        
        const projectionMatrixLocation = gl.getUniformLocation(program, 'uProjectionMatrix');
        const modelViewMatrixLocation = gl.getUniformLocation(program, 'uModelViewMatrix');
        
        gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
        
        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
    
    // Handle keyboard input
    function handleKeyDown(event: KeyboardEvent) {
        const speed = 0.1;
        
        // Convert rotation to radians
        const yawRad = cameraRotation.yaw * Math.PI / 180;
        
        // Calculate movement direction
        const forward = {
            x: Math.sin(yawRad),
            z: Math.cos(yawRad)
        };
        
        const right = {
            x: Math.sin(yawRad + Math.PI / 2),
            z: Math.cos(yawRad + Math.PI / 2)
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
    }
    
    // Handle mouse movement
    function handleMouseMove(event: MouseEvent) {
        if (document.pointerLockElement === canvasElement) {
            cameraRotation.yaw += event.movementX * 0.1;
            cameraRotation.pitch -= event.movementY * 0.1;
            
            // Clamp pitch to avoid flipping
            cameraRotation.pitch = Math.max(-89, Math.min(89, cameraRotation.pitch));
        }
    }
    
    // Request pointer lock
    function requestPointerLock() {
        canvasElement.requestPointerLock();
    }
    
    onMount(() => {
        // Set canvas size
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
        
        // Initialize WebGL
        if (!initWebGL()) {
            console.error('Failed to initialize WebGL');
            return;
        }
        
        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleMouseMove);
        canvasElement.addEventListener('click', requestPointerLock);
        
        // Handle window resize
        const handleResize = () => {
            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;
            
            if (gl) {
                gl.viewport(0, 0, canvasElement.width, canvasElement.height);
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Animation loop
        const animate = () => {
            render();
            requestAnimationFrame(animate);
        };
        
        animate();
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            canvasElement.removeEventListener('click', requestPointerLock);
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
EOL

echo "Updated VoxelGameCanvas component with WebGL 3D rendering"

# Update the voxel game store to support 3D rendering
cat > src/lib/stores/voxel/voxelGameStore.ts << EOL
import { writable } from 'svelte/store';

// Define types
export type VoxelType = 'air' | 'dirt' | 'grass' | 'stone' | 'wood' | 'leaves';

export type VoxelData = {
    type: VoxelType;
    x: number;
    y: number;
    z: number;
};

export type VoxelChunk = {
    x: number;
    y: number;
    z: number;
    size: number;
    voxels: VoxelData[];
};

export type VoxelGameState = {
    playerPosition: { x: number; y: number; z: number };
    playerRotation: { yaw: number; pitch: number };
    chunks: VoxelChunk[];
    selectedVoxelType: VoxelType;
    isPointerLocked: boolean;
};

// Create initial state
const initialState: VoxelGameState = {
    playerPosition: { x: 0, y: 0, z: 5 },
    playerRotation: { yaw: 0, pitch: 0 },
    chunks: [],
    selectedVoxelType: 'dirt',
    isPointerLocked: false
};

// Create store
export const voxelGameStore = writable<VoxelGameState>(initialState);

// Store actions
export const setPlayerPosition = (x: number, y: number, z: number) => {
    voxelGameStore.update(state => ({
        ...state,
        playerPosition: { x, y, z }
    }));
};

export const setPlayerRotation = (yaw: number, pitch: number) => {
    voxelGameStore.update(state => ({
        ...state,
        playerRotation: { yaw, pitch }
    }));
};

export const setPointerLocked = (locked: boolean) => {
    voxelGameStore.update(state => ({
        ...state,
        isPointerLocked: locked
    }));
};

export const addVoxel = (type: VoxelType, x: number, y: number, z: number) => {
    voxelGameStore.update(state => {
        // Find the chunk that contains this position
        const chunkSize = 16;
        const chunkX = Math.floor(x / chunkSize);
        const chunkY = Math.floor(y / chunkSize);
        const chunkZ = Math.floor(z / chunkSize);
        
        let chunk = state.chunks.find(c => 
            c.x === chunkX && c.y === chunkY && c.z === chunkZ
        );
        
        if (!chunk) {
            // Create a new chunk
            chunk = {
                x: chunkX,
                y: chunkY,
                z: chunkZ,
                size: chunkSize,
                voxels: []
            };
            
            state.chunks.push(chunk);
        }
        
        // Add the voxel to the chunk
        const localX = x - chunkX * chunkSize;
        const localY = y - chunkY * chunkSize;
        const localZ = z - chunkZ * chunkSize;
        
        // Remove any existing voxel at this position
        chunk.voxels = chunk.voxels.filter(v => 
            !(v.x === localX && v.y === localY && v.z === localZ)
        );
        
        // Add the new voxel
        if (type !== 'air') {
            chunk.voxels.push({
                type,
                x: localX,
                y: localY,
                z: localZ
            });
        }
        
        return { ...state };
    });
};

export const removeVoxel = (x: number, y: number, z: number) => {
    addVoxel('air', x, y, z);
};

export const setSelectedVoxelType = (type: VoxelType) => {
    voxelGameStore.update(state => ({
        ...state,
        selectedVoxelType: type
    }));
};

// Generate a simple flat terrain
export const generateFlatTerrain = (size: number, height: number) => {
    voxelGameStore.update(state => {
        const newState = { ...state, chunks: [] };
        
        // Generate a flat terrain
        for (let x = -size; x < size; x++) {
            for (let z = -size; z < size; z++) {
                addVoxel('grass', x, height, z);
                
                // Add some dirt below the grass
                for (let y = height - 1; y > height - 4; y--) {
                    addVoxel('dirt', x, y, z);
                }
                
                // Add bedrock at the bottom
                addVoxel('stone', x, height - 4, z);
            }
        }
        
        return newState;
    });
};
EOL

echo "Updated voxel game store to support 3D rendering and chunks"

# Update the voxel game page to include instructions
cat > src/routes/voxel-game/+page.svelte << EOL
<script lang="ts">
    import { onMount } from 'svelte';
    import VoxelGameCanvas from '../../lib/components/voxel/VoxelGameCanvas.svelte';
    import { generateFlatTerrain } from '../../lib/stores/voxel/voxelGameStore';
    
    onMount(() => {
        console.log('Voxel Game mounted');
        
        // Generate a simple flat terrain
        generateFlatTerrain(8, 0);
    });
</script>

<div class="voxel-game-container">
    <VoxelGameCanvas />
</div>

<style>
    .voxel-game-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
EOL

echo "Updated voxel game page to include terrain generation"

# Make the script executable
chmod +x scripts/voxel-game/enhance-3d-rendering.sh

echo "Enhancement script created and made executable"
echo "Run the script with: ./scripts/voxel-game/enhance-3d-rendering.sh" 