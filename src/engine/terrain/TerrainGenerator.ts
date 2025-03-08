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
        
        // Generate heightmap and biome map
        const heightMap: number[][] = [];
        const biomeMap: string[][] = [];
        
        for (let x = 0; x < width; x++) {
            heightMap[x] = [];
            biomeMap[x] = [];
            
            for (let z = 0; z < depth; z++) {
                const worldX = x + offsetX * width;
                const worldZ = z + offsetZ * depth;
                
                // Generate height using multiple noise functions
                const baseHeight = this.generateHeight(worldX, worldZ);
                
                // Determine biome based on noise
                const moistureNoise = this.noise2D(worldX * 0.01, worldZ * 0.01);
                const temperatureNoise = this.noise2D(worldX * 0.008 + 500, worldZ * 0.008 + 500);
                
                let biome = 'plains';
                if (moistureNoise > 0.6 && temperatureNoise > 0.5) {
                    biome = 'forest';
                } else if (moistureNoise < 0.3 && temperatureNoise > 0.7) {
                    biome = 'desert';
                } else if (moistureNoise > 0.7 && temperatureNoise < 0.4) {
                    biome = 'mountains';
                }
                
                // Adjust height based on biome
                let terrainHeight = baseHeight;
                if (biome === 'mountains') {
                    terrainHeight += 10 * this.noise2D(worldX * 0.05, worldZ * 0.05);
                } else if (biome === 'desert') {
                    terrainHeight -= 2;
                }
                
                heightMap[x][z] = Math.max(1, Math.min(Math.floor(terrainHeight), height - 20));
                biomeMap[x][z] = biome;
            }
        }
        
        // Fill the voxel data based on heightmap and biome
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const terrainHeight = heightMap[x][z];
                const biome = biomeMap[x][z];
                
                // Bedrock layer at the bottom
                voxelData.setBlock(x, 0, z, BlockType.BEDROCK);
                
                // Fill with stone
                for (let y = 1; y < terrainHeight - 3; y++) {
                    voxelData.setBlock(x, y, z, BlockType.STONE);
                    
                    // Generate ores
                    this.generateOres(voxelData, x, y, z);
                }
                
                // Biome-specific surface layers
                if (biome === 'desert') {
                    // Desert: all sand
                    for (let y = terrainHeight - 3; y < terrainHeight; y++) {
                        voxelData.setBlock(x, y, z, BlockType.SAND);
                    }
                } else if (biome === 'mountains') {
                    // Mountains: more stone, less dirt
                    voxelData.setBlock(x, terrainHeight - 3, z, BlockType.STONE);
                    voxelData.setBlock(x, terrainHeight - 2, z, BlockType.STONE);
                    voxelData.setBlock(x, terrainHeight - 1, z, BlockType.DIRT);
                    
                    // Snow on top of mountains
                    if (terrainHeight > height / 2) {
                        voxelData.setBlock(x, terrainHeight, z, BlockType.STONE);
                    } else {
                        voxelData.setBlock(x, terrainHeight, z, BlockType.GRASS);
                    }
                } else {
                    // Default: dirt with grass on top
                    for (let y = terrainHeight - 3; y < terrainHeight; y++) {
                        voxelData.setBlock(x, y, z, BlockType.DIRT);
                    }
                    voxelData.setBlock(x, terrainHeight, z, BlockType.GRASS);
                }
                
                // Generate trees in forest biome
                if (biome === 'forest' && this.random() < 0.05) {
                    this.generateTree(voxelData, x, terrainHeight + 1, z);
                }
                
                // Generate water in low areas
                const waterLevel = height / 4;
                if (terrainHeight < waterLevel) {
                    for (let y = terrainHeight + 1; y <= waterLevel; y++) {
                        voxelData.setBlock(x, y, z, BlockType.WATER);
                    }
                }
            }
        }
    }
    
    private generateOres(voxelData: VoxelData, x: number, y: number, z: number): void {
        // Only generate ores in stone
        if (voxelData.getBlock(x, y, z) !== BlockType.STONE) {
            return;
        }
        
        const worldX = x;
        const worldY = y;
        const worldZ = z;
        
        // Coal ore - common, appears higher up
        if (y > 5 && y < 60 && this.random() < 0.03) {
            voxelData.setBlock(x, y, z, BlockType.COAL_ORE);
        }
        
        // Iron ore - less common, appears in middle layers
        if (y > 5 && y < 40 && this.random() < 0.02) {
            voxelData.setBlock(x, y, z, BlockType.IRON_ORE);
        }
        
        // Gold ore - rare, appears in lower layers
        if (y > 1 && y < 30 && this.random() < 0.01) {
            voxelData.setBlock(x, y, z, BlockType.GOLD_ORE);
        }
        
        // Diamond ore - very rare, appears only in deep layers
        if (y > 1 && y < 15 && this.random() < 0.005) {
            voxelData.setBlock(x, y, z, BlockType.DIAMOND_ORE);
        }
    }
    
    private generateTree(voxelData: VoxelData, x: number, y: number, z: number): void {
        const treeHeight = 4 + Math.floor(this.random() * 3); // 4-6 blocks tall
        
        // Check if there's enough space for the tree
        if (y + treeHeight >= voxelData.height) {
            return;
        }
        
        // Generate trunk
        for (let i = 0; i < treeHeight; i++) {
            voxelData.setBlock(x, y + i, z, BlockType.WOOD);
        }
        
        // Generate leaves
        const leafRadius = 2;
        for (let lx = -leafRadius; lx <= leafRadius; lx++) {
            for (let ly = -leafRadius; ly <= leafRadius; ly++) {
                for (let lz = -leafRadius; lz <= leafRadius; lz++) {
                    // Skip if outside the voxel data bounds
                    if (x + lx < 0 || x + lx >= voxelData.width ||
                        y + treeHeight - 1 + ly < 0 || y + treeHeight - 1 + ly >= voxelData.height ||
                        z + lz < 0 || z + lz >= voxelData.depth) {
                        continue;
                    }
                    
                    // Skip the trunk
                    if (lx === 0 && lz === 0 && ly <= 0) {
                        continue;
                    }
                    
                    // Place leaves in a spherical pattern
                    const distance = Math.sqrt(lx * lx + ly * ly + lz * lz);
                    if (distance <= leafRadius) {
                        voxelData.setBlock(x + lx, y + treeHeight - 1 + ly, z + lz, BlockType.LEAVES);
                    }
                }
            }
        }
    }
    
    private generateHeight(x: number, z: number): number {
        // Simple noise function using the seed
        const noiseScale = 0.05;
        const amplitude = 20;
        
        // Use multiple octaves of noise for more natural terrain
        let noise = 0;
        let frequency = 1;
        let amplitude2 = amplitude;
        
        for (let i = 0; i < 4; i++) {
            noise += this.noise2D(x * noiseScale * frequency, z * noiseScale * frequency) * amplitude2;
            amplitude2 *= 0.5;
            frequency *= 2;
        }
        
        return Math.floor((noise + amplitude) * 0.5) + 5;
    }
    
    private noise2D(x: number, z: number): number {
        // Simple 2D noise function using the seed
        const nx = Math.sin(x * 12.9898 + this.seed);
        const nz = Math.sin(z * 78.233 + this.seed);
        return (Math.sin(nx * nz * 43758.5453123) + 1) * 0.5;
    }
    
    private random(): number {
        // Simple random function using the seed
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
} 