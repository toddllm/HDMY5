export enum BlockType {
    AIR = 0,
    DIRT = 1,
    GRASS = 2,
    STONE = 3,
    WOOD = 4,
    LEAVES = 5
}

export class VoxelData {
    private data: Uint8Array;
    readonly width: number;
    readonly height: number;
    readonly depth: number;
    
    constructor(width: number, height: number, depth: number) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.data = new Uint8Array(width * height * depth);
        // Initialize all blocks to air
        this.data.fill(BlockType.AIR);
    }
    
    private getIndex(x: number, y: number, z: number): number {
        return (z * this.width * this.height) + (y * this.width) + x;
    }
    
    isInBounds(x: number, y: number, z: number): boolean {
        return x >= 0 && x < this.width &&
               y >= 0 && y < this.height &&
               z >= 0 && z < this.depth;
    }
    
    getBlock(x: number, y: number, z: number): BlockType {
        if (!this.isInBounds(x, y, z)) {
            return BlockType.AIR;
        }
        return this.data[this.getIndex(x, y, z)];
    }
    
    setBlock(x: number, y: number, z: number, blockType: BlockType): void {
        if (!this.isInBounds(x, y, z)) {
            return;
        }
        this.data[this.getIndex(x, y, z)] = blockType;
    }
} 