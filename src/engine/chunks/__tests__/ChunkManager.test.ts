import { ChunkManager } from '../ChunkManager';
import { BlockType } from '../../voxel/VoxelData';
import { TerrainGenerator } from '../../terrain/TerrainGenerator';

describe('ChunkManager', () => {
    let chunkManager: ChunkManager;
    
    beforeEach(() => {
        const terrainGenerator = new TerrainGenerator(12345); // Fixed seed for consistent tests
        chunkManager = new ChunkManager(16, 32, 16, terrainGenerator);
    });
    
    it('should create and retrieve chunks', () => {
        // Get chunk at (0,0)
        const chunk = chunkManager.getChunk(0, 0);
        
        // Chunk should exist and have correct dimensions
        expect(chunk).toBeDefined();
        expect(chunk.data.width).toBe(16);
        expect(chunk.data.height).toBe(32);
        expect(chunk.data.depth).toBe(16);
    });
    
    it('should cache chunks for performance', () => {
        // Get the same chunk twice
        const chunk1 = chunkManager.getChunk(0, 0);
        const chunk2 = chunkManager.getChunk(0, 0);
        
        // Should be the same object instance
        expect(chunk1).toBe(chunk2);
    });
    
    it('should load chunks around the player', () => {
        // Set player position in the middle of chunk (1,1)
        const playerX = 1 * 16 + 8;
        const playerZ = 1 * 16 + 8;
        
        // Update view distance = 1 (3x3 chunks)
        chunkManager.updateLoadedChunks(playerX, playerZ, 1);
        
        // Should have loaded 9 chunks
        expect(chunkManager.getLoadedChunkCount()).toBe(9);
        
        // Check each chunk around player is loaded
        for (let x = 0; x <= 2; x++) {
            for (let z = 0; z <= 2; z++) {
                expect(chunkManager.isChunkLoaded(x, z)).toBe(true);
            }
        }
        
        // Check a distant chunk is not loaded
        expect(chunkManager.isChunkLoaded(3, 3)).toBe(false);
    });
    
    it('should unload distant chunks', () => {
        // Load chunks around (1,1)
        chunkManager.updateLoadedChunks(16 + 8, 16 + 8, 1);
        
        // Verify chunk (0,0) is loaded
        expect(chunkManager.isChunkLoaded(0, 0)).toBe(true);
        
        // Move player far away to (5,5)
        chunkManager.updateLoadedChunks(5 * 16 + 8, 5 * 16 + 8, 1);
        
        // Verify chunk (0,0) is no longer loaded
        expect(chunkManager.isChunkLoaded(0, 0)).toBe(false);
        
        // Verify chunks around new position are loaded
        expect(chunkManager.isChunkLoaded(4, 4)).toBe(true);
        expect(chunkManager.isChunkLoaded(5, 5)).toBe(true);
        expect(chunkManager.isChunkLoaded(6, 6)).toBe(true);
    });
    
    it('should set and get blocks using world coordinates', () => {
        // Set a block in chunk (1,1)
        const worldX = 1 * 16 + 5;
        const worldY = 10;
        const worldZ = 1 * 16 + 8;
        
        chunkManager.setBlock(worldX, worldY, worldZ, BlockType.STONE);
        
        // Get the block and verify it was set
        expect(chunkManager.getBlock(worldX, worldY, worldZ)).toBe(BlockType.STONE);
        
        // Verify the chunk was marked as modified
        const chunk = chunkManager.getChunk(1, 1);
        expect(chunk.isModified).toBe(true);
    });
    
    it('should handle blocks at chunk boundaries', () => {
        // Set a block at the edge of chunk (0,0)
        chunkManager.setBlock(15, 10, 15, BlockType.STONE);
        
        // Set a block at the start of chunk (1,1)
        chunkManager.setBlock(16, 10, 16, BlockType.DIRT);
        
        // Verify blocks were set in the correct chunks
        expect(chunkManager.getBlock(15, 10, 15)).toBe(BlockType.STONE);
        expect(chunkManager.getBlock(16, 10, 16)).toBe(BlockType.DIRT);
        
        // Verify the chunks were marked as modified
        const chunk00 = chunkManager.getChunk(0, 0);
        const chunk11 = chunkManager.getChunk(1, 1);
        expect(chunk00.isModified).toBe(true);
        expect(chunk11.isModified).toBe(true);
    });
}); 