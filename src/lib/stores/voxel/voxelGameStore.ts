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
