import { VoxelData, BlockType } from '../voxel/VoxelData';

export class TerrainGenerator {
    private seed: number;
    
    constructor(seed: number = Math.random() * 10000) {
        this.seed = seed;
    }
    
    generateTerrain(voxelData: VoxelData, offsetX: number = 0, offsetZ: number = 0): void {
        const width = voxelData.width;
        const height = voxelData.height;
        const depth = voxelData.depth;
        
        // Simple heightmap-based terrain generation
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                // Generate height using simple noise function
                const worldX = x + offsetX * width;
                const worldZ = z + offsetZ * depth;
                const terrainHeight = this.generateHeight(worldX, worldZ);
                
                // Fill blocks up to height
                for (let y = 0; y < height; y++) {
                    if (y < terrainHeight) {
                        // Determine block type based on height
                        let blockType: BlockType;
                        if (y === terrainHeight - 1) {
                            blockType = BlockType.GRASS;
                        } else if (y >= terrainHeight - 4) {
                            blockType = BlockType.DIRT;
                        } else {
                            blockType = BlockType.STONE;
                        }
                        voxelData.setBlock(x, y, z, blockType);
                    }
                }
            }
        }
    }
    
    private generateHeight(x: number, z: number): number {
        // Simple noise function using the seed
        const noiseScale = 0.1;
        const amplitude = 16;
        const frequency = 1;
        
        // Use a simple pseudo-random function based on coordinates and seed
        const noise = this.noise2D(x * noiseScale * frequency, z * noiseScale * frequency);
        return Math.floor((noise + 1) * 0.5 * amplitude) + 1;
    }
    
    private noise2D(x: number, z: number): number {
        // Simple 2D noise function using the seed
        const nx = Math.sin(x * 12.9898 + this.seed);
        const nz = Math.sin(z * 78.233 + this.seed);
        return (Math.sin(nx * nz * 43758.5453123) + 1) * 0.5;
    }
} 