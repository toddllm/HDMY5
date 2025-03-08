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
