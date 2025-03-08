import { TerrainGenerator } from '../TerrainGenerator';
import { VoxelData, BlockType } from '../../voxel/VoxelData';

describe('TerrainGenerator', () => {
    it('should generate terrain with correct dimensions', () => {
        const voxelData = new VoxelData(16, 32, 16);
        const generator = new TerrainGenerator(12345); // Fixed seed for consistent tests
        
        generator.generateTerrain(voxelData);
        
        // Check that some blocks were placed
        let hasBlocks = false;
        for (let x = 0; x < voxelData.width; x++) {
            for (let y = 0; y < voxelData.height; y++) {
                for (let z = 0; z < voxelData.depth; z++) {
                    if (voxelData.getBlock(x, y, z) !== BlockType.AIR) {
                        hasBlocks = true;
                        break;
                    }
                }
            }
        }
        expect(hasBlocks).toBe(true);
    });
    
    it('should generate consistent terrain with same seed', () => {
        const voxelData1 = new VoxelData(16, 32, 16);
        const voxelData2 = new VoxelData(16, 32, 16);
        
        const generator1 = new TerrainGenerator(12345);
        const generator2 = new TerrainGenerator(12345);
        
        generator1.generateTerrain(voxelData1);
        generator2.generateTerrain(voxelData2);
        
        // Compare each block
        for (let x = 0; x < voxelData1.width; x++) {
            for (let y = 0; y < voxelData1.height; y++) {
                for (let z = 0; z < voxelData1.depth; z++) {
                    expect(voxelData1.getBlock(x, y, z)).toBe(voxelData2.getBlock(x, y, z));
                }
            }
        }
    });
    
    it('should generate different terrain with different offsets', () => {
        const voxelData1 = new VoxelData(16, 32, 16);
        const voxelData2 = new VoxelData(16, 32, 16);
        
        const generator = new TerrainGenerator(12345);
        
        generator.generateTerrain(voxelData1, 0, 0);
        generator.generateTerrain(voxelData2, 1, 0);
        
        // Check that terrains are different
        let hasDifference = false;
        for (let x = 0; x < voxelData1.width; x++) {
            for (let y = 0; y < voxelData1.height; y++) {
                for (let z = 0; z < voxelData1.depth; z++) {
                    if (voxelData1.getBlock(x, y, z) !== voxelData2.getBlock(x, y, z)) {
                        hasDifference = true;
                        break;
                    }
                }
            }
        }
        expect(hasDifference).toBe(true);
    });
    
    it('should generate terrain with proper block layering', () => {
        const voxelData = new VoxelData(16, 32, 16);
        const generator = new TerrainGenerator(12345);
        
        generator.generateTerrain(voxelData);
        
        // Check block layering at a few points
        for (let x = 0; x < voxelData.width; x += 4) {
            for (let z = 0; z < voxelData.depth; z += 4) {
                let foundSurface = false;
                let dirtLayerCount = 0;
                
                for (let y = voxelData.height - 1; y >= 0; y--) {
                    const block = voxelData.getBlock(x, y, z);
                    
                    if (!foundSurface && block !== BlockType.AIR) {
                        // First non-air block should be grass
                        expect(block).toBe(BlockType.GRASS);
                        foundSurface = true;
                    } else if (foundSurface && dirtLayerCount < 3) {
                        // Next 3 blocks should be dirt
                        expect(block).toBe(BlockType.DIRT);
                        dirtLayerCount++;
                    } else if (foundSurface && dirtLayerCount >= 3 && block !== BlockType.AIR) {
                        // Everything below dirt should be stone
                        expect(block).toBe(BlockType.STONE);
                    }
                }
                
                // Verify we found terrain
                expect(foundSurface).toBe(true);
            }
        }
    });
}); 