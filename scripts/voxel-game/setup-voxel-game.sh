#!/bin/bash

# Helper script to set up the voxel game project

# Create necessary directories
mkdir -p src/lib/components/voxel
mkdir -p src/lib/stores/voxel
mkdir -p src/routes/voxel-game

# Check if the directories were created successfully
if [ ! -d "src/lib/components/voxel" ] || [ ! -d "src/lib/stores/voxel" ] || [ ! -d "src/routes/voxel-game" ]; then
    echo "Failed to create directories. Please check permissions."
    exit 1
fi

echo "Created necessary directories for the voxel game project."

# Create a basic route for the voxel game
cat > src/routes/voxel-game/+page.svelte << EOL
<script lang="ts">
    import { onMount } from 'svelte';
    import VoxelGameCanvas from '../../lib/components/voxel/VoxelGameCanvas.svelte';
    
    onMount(() => {
        console.log('Voxel Game mounted');
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

echo "Created basic route for the voxel game at src/routes/voxel-game/+page.svelte"

# Create a basic canvas component for the voxel game
cat > src/lib/components/voxel/VoxelGameCanvas.svelte << EOL
<script lang="ts">
    import { onMount } from 'svelte';
    import { voxelGameStore } from '../../stores/voxel/voxelGameStore';
    
    let canvasElement: HTMLCanvasElement;
    
    onMount(() => {
        // Initialize the canvas
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }
        
        // Set canvas size
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
        
        // Draw a placeholder
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(0, canvasElement.height / 2, canvasElement.width, canvasElement.height / 2);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Voxel Game Canvas (Placeholder)', canvasElement.width / 2, canvasElement.height / 2);
        
        // Handle window resize
        const handleResize = () => {
            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;
            
            // Redraw placeholder
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
            
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, canvasElement.height / 2, canvasElement.width, canvasElement.height / 2);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Voxel Game Canvas (Placeholder)', canvasElement.width / 2, canvasElement.height / 2);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
</script>

<canvas bind:this={canvasElement}></canvas>

<style>
    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
EOL

echo "Created basic canvas component for the voxel game at src/lib/components/voxel/VoxelGameCanvas.svelte"

# Create a basic store for the voxel game
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

export type VoxelGameState = {
    playerPosition: { x: number; y: number; z: number };
    playerRotation: { yaw: number; pitch: number };
    voxels: VoxelData[];
    selectedVoxelType: VoxelType;
};

// Create initial state
const initialState: VoxelGameState = {
    playerPosition: { x: 0, y: 0, z: 0 },
    playerRotation: { yaw: 0, pitch: 0 },
    voxels: [],
    selectedVoxelType: 'dirt'
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

export const addVoxel = (type: VoxelType, x: number, y: number, z: number) => {
    voxelGameStore.update(state => ({
        ...state,
        voxels: [...state.voxels, { type, x, y, z }]
    }));
};

export const removeVoxel = (x: number, y: number, z: number) => {
    voxelGameStore.update(state => ({
        ...state,
        voxels: state.voxels.filter(
            voxel => !(voxel.x === x && voxel.y === y && voxel.z === z)
        )
    }));
};

export const setSelectedVoxelType = (type: VoxelType) => {
    voxelGameStore.update(state => ({
        ...state,
        selectedVoxelType: type
    }));
};
EOL

echo "Created basic store for the voxel game at src/lib/stores/voxel/voxelGameStore.ts"

# Create a script to run the voxel game
cat > scripts/voxel-game/run-voxel-game.sh << EOL
#!/bin/bash

# Run the voxel game

# Start the development server
echo "Starting development server for the voxel game..."
npm run dev -- --open=/voxel-game
EOL

# Make the run script executable
chmod +x scripts/voxel-game/run-voxel-game.sh

echo "Created script to run the voxel game at scripts/voxel-game/run-voxel-game.sh"

# Make this script executable
chmod +x scripts/voxel-game/setup-voxel-game.sh

echo "Setup complete! You can now run the voxel game with: ./scripts/voxel-game/run-voxel-game.sh" 