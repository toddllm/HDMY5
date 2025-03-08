import { VoxelData, BlockType } from '../VoxelData';

describe('VoxelData', () => {
    it('should initialize with correct dimensions', () => {
        const voxelData = new VoxelData(16, 16, 16);
        expect(voxelData.width).toBe(16);
        expect(voxelData.height).toBe(16);
        expect(voxelData.depth).toBe(16);
    });
    
    it('should set and get block correctly', () => {
        const voxelData = new VoxelData(16, 16, 16);
        voxelData.setBlock(5, 10, 8, BlockType.STONE);
        expect(voxelData.getBlock(5, 10, 8)).toBe(BlockType.STONE);
    });
    
    it('should check if coordinates are in bounds', () => {
        const voxelData = new VoxelData(16, 16, 16);
        expect(voxelData.isInBounds(5, 10, 8)).toBe(true);
        expect(voxelData.isInBounds(16, 10, 8)).toBe(false);
    });
    
    it('should initialize all blocks as air', () => {
        const voxelData = new VoxelData(4, 4, 4);
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                for (let z = 0; z < 4; z++) {
                    expect(voxelData.getBlock(x, y, z)).toBe(BlockType.AIR);
                }
            }
        }
    });
}); 