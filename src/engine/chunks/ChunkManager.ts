import { VoxelData, BlockType } from '../voxel/VoxelData';
import { TerrainGenerator } from '../terrain/TerrainGenerator';

export interface Chunk {
    x: number;
    z: number;
    data: VoxelData;
    isModified: boolean;
}

export class ChunkManager {
    private chunks: Map<string, Chunk> = new Map();
    private loadedChunks: Set<string> = new Set();
    private chunkWidth: number;
    private chunkHeight: number;
    private chunkDepth: number;
    private terrainGenerator: TerrainGenerator;
    
    constructor(
        chunkWidth: number,
        chunkHeight: number,
        chunkDepth: number,
        terrainGenerator: TerrainGenerator
    ) {
        this.chunkWidth = chunkWidth;
        this.chunkHeight = chunkHeight;
        this.chunkDepth = chunkDepth;
        this.terrainGenerator = terrainGenerator;
    }
    
    private getChunkKey(x: number, z: number): string {
        return `${x},${z}`;
    }
    
    getChunk(x: number, z: number): Chunk {
        const key = this.getChunkKey(x, z);
        
        // Return cached chunk if it exists
        if (this.chunks.has(key)) {
            return this.chunks.get(key)!;
        }
        
        // Create new chunk
        const chunk: Chunk = {
            x,
            z,
            data: new VoxelData(this.chunkWidth, this.chunkHeight, this.chunkDepth),
            isModified: false
        };
        
        // Generate terrain for the chunk
        this.terrainGenerator.generateTerrain(chunk.data, x, z);
        
        // Cache the chunk
        this.chunks.set(key, chunk);
        
        return chunk;
    }
    
    updateLoadedChunks(playerX: number, playerZ: number, viewDistance: number): void {
        // Convert player position to chunk coordinates
        const playerChunkX = Math.floor(playerX / this.chunkWidth);
        const playerChunkZ = Math.floor(playerZ / this.chunkDepth);
        
        // Create set of chunks that should be loaded
        const newLoadedChunks = new Set<string>();
        
        // Load chunks in view distance
        for (let x = -viewDistance; x <= viewDistance; x++) {
            for (let z = -viewDistance; z <= viewDistance; z++) {
                const chunkX = playerChunkX + x;
                const chunkZ = playerChunkZ + z;
                const key = this.getChunkKey(chunkX, chunkZ);
                
                newLoadedChunks.add(key);
                
                // Load chunk if not already loaded
                if (!this.loadedChunks.has(key)) {
                    this.getChunk(chunkX, chunkZ);
                    this.loadedChunks.add(key);
                }
            }
        }
        
        // Unload chunks outside view distance
        for (const key of this.loadedChunks) {
            if (!newLoadedChunks.has(key)) {
                this.loadedChunks.delete(key);
                // Note: We keep chunks in the cache for now, could implement cache clearing later
            }
        }
    }
    
    isChunkLoaded(x: number, z: number): boolean {
        return this.loadedChunks.has(this.getChunkKey(x, z));
    }
    
    getLoadedChunkCount(): number {
        return this.loadedChunks.size;
    }
    
    getLoadedChunks(): Chunk[] {
        return Array.from(this.loadedChunks).map(key => {
            const [x, z] = key.split(',').map(Number);
            return this.getChunk(x, z);
        });
    }
    
    setBlock(worldX: number, worldY: number, worldZ: number, blockType: BlockType): void {
        // Convert world coordinates to chunk coordinates
        const chunkX = Math.floor(worldX / this.chunkWidth);
        const chunkZ = Math.floor(worldZ / this.chunkDepth);
        
        // Get local coordinates within chunk
        const localX = ((worldX % this.chunkWidth) + this.chunkWidth) % this.chunkWidth;
        const localY = worldY;
        const localZ = ((worldZ % this.chunkDepth) + this.chunkDepth) % this.chunkDepth;
        
        // Get chunk and set block
        const chunk = this.getChunk(chunkX, chunkZ);
        chunk.data.setBlock(localX, localY, localZ, blockType);
        chunk.isModified = true;
    }
    
    getBlock(worldX: number, worldY: number, worldZ: number): BlockType {
        // Convert world coordinates to chunk coordinates
        const chunkX = Math.floor(worldX / this.chunkWidth);
        const chunkZ = Math.floor(worldZ / this.chunkDepth);
        
        // Get local coordinates within chunk
        const localX = ((worldX % this.chunkWidth) + this.chunkWidth) % this.chunkWidth;
        const localY = worldY;
        const localZ = ((worldZ % this.chunkDepth) + this.chunkDepth) % this.chunkDepth;
        
        // Get chunk and return block type
        const chunk = this.getChunk(chunkX, chunkZ);
        return chunk.data.getBlock(localX, localY, localZ);
    }
    
    // Save modified chunks (could be extended to save to disk/database)
    saveModifiedChunks(): void {
        for (const chunk of this.chunks.values()) {
            if (chunk.isModified) {
                // TODO: Implement chunk saving
                chunk.isModified = false;
            }
        }
    }
} 