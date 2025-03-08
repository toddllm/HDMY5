import { writable } from "svelte/store";

// Define types
export type VoxelType = "air" | "dirt" | "grass" | "stone" | "wood" | "leaves";

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
  isPointerLocked: boolean;
};

// Create initial state
const initialState: VoxelGameState = {
  playerPosition: { x: 0, y: 2, z: 5 },
  playerRotation: { yaw: 0, pitch: 0 },
  voxels: [],
  selectedVoxelType: "dirt",
  isPointerLocked: false,
};

// Create store
export const voxelGameStore = writable<VoxelGameState>(initialState);

// Store actions
export const setPlayerPosition = (x: number, y: number, z: number) => {
  voxelGameStore.update((state) => ({
    ...state,
    playerPosition: { x, y, z },
  }));
};

export const setPlayerRotation = (yaw: number, pitch: number) => {
  voxelGameStore.update((state) => ({
    ...state,
    playerRotation: { yaw, pitch },
  }));
};

export const setPointerLocked = (locked: boolean) => {
  voxelGameStore.update((state) => ({
    ...state,
    isPointerLocked: locked,
  }));
};

export const addVoxel = (type: VoxelType, x: number, y: number, z: number) => {
  voxelGameStore.update((state) => {
    // Remove any existing voxel at this position
    const filteredVoxels = state.voxels.filter(
      (v) => !(v.x === x && v.y === y && v.z === z)
    );

    // Add the new voxel if it's not air
    const newVoxels =
      type === "air" ? filteredVoxels : [...filteredVoxels, { type, x, y, z }];

    return {
      ...state,
      voxels: newVoxels,
    };
  });
};

export const removeVoxel = (x: number, y: number, z: number) => {
  addVoxel("air", x, y, z);
};

export const setSelectedVoxelType = (type: VoxelType) => {
  voxelGameStore.update((state) => ({
    ...state,
    selectedVoxelType: type,
  }));
};

// Generate a simple flat terrain
export const generateFlatTerrain = (size: number, height: number) => {
  // Clear existing voxels
  voxelGameStore.update((state) => ({
    ...state,
    voxels: [],
  }));

  // Generate a flat terrain
  for (let x = -size; x < size; x++) {
    for (let z = -size; z < size; z++) {
      // Add grass on top
      addVoxel("grass", x, height, z);

      // Add dirt below
      for (let y = height - 1; y > height - 3; y--) {
        addVoxel("dirt", x, y, z);
      }

      // Add stone at the bottom
      addVoxel("stone", x, height - 3, z);
    }
  }
};
