import { VoxelData, BlockType } from '../voxel/VoxelData';

// Define shader sources
const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying vec3 vColor;
    
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        vColor = aColor;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;
    
    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

export class VoxelRenderer {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram | null = null;
    private positionBuffer: WebGLBuffer | null = null;
    private colorBuffer: WebGLBuffer | null = null;
    private vertexCount: number = 0;
    
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
    }
    
    initialize(): void {
        // Create shader program
        const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        
        if (!vertexShader || !fragmentShader) {
            throw new Error('Failed to compile shaders');
        }
        
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        if (!this.program) {
            throw new Error('Failed to create shader program');
        }
        
        // Create buffers
        this.positionBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();
        
        // Set up WebGL state
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
    }
    
    createMeshFromVoxelData(voxelData: VoxelData): void {
        const positions: number[] = [];
        const colors: number[] = [];
        
        // For each block in the voxel data
        for (let x = 0; x < voxelData.width; x++) {
            for (let y = 0; y < voxelData.height; y++) {
                for (let z = 0; z < voxelData.depth; z++) {
                    const blockType = voxelData.getBlock(x, y, z);
                    
                    if (blockType === BlockType.AIR) {
                        continue; // Skip air blocks
                    }
                    
                    // Check if each face is visible (adjacent to air)
                    const showPosX = x === voxelData.width - 1 || voxelData.getBlock(x + 1, y, z) === BlockType.AIR;
                    const showNegX = x === 0 || voxelData.getBlock(x - 1, y, z) === BlockType.AIR;
                    const showPosY = y === voxelData.height - 1 || voxelData.getBlock(x, y + 1, z) === BlockType.AIR;
                    const showNegY = y === 0 || voxelData.getBlock(x, y - 1, z) === BlockType.AIR;
                    const showPosZ = z === voxelData.depth - 1 || voxelData.getBlock(x, y, z + 1) === BlockType.AIR;
                    const showNegZ = z === 0 || voxelData.getBlock(x, y, z - 1) === BlockType.AIR;
                    
                    // Add visible faces to the mesh
                    this.addCubeFaces(
                        x, y, z, 
                        this.getColorForBlockType(blockType),
                        showPosX, showNegX, showPosY, showNegY, showPosZ, showNegZ,
                        positions, colors
                    );
                }
            }
        }
        
        // Upload data to GPU
        this.uploadMeshData(positions, colors);
        this.vertexCount = positions.length / 3;
    }
    
    render(modelViewMatrix: Float32Array, projectionMatrix: Float32Array): void {
        if (!this.program || this.vertexCount === 0) {
            return;
        }
        
        const gl = this.gl;
        
        // Use shader program
        gl.useProgram(this.program);
        
        // Set up uniforms
        const uModelViewMatrix = gl.getUniformLocation(this.program, 'uModelViewMatrix');
        const uProjectionMatrix = gl.getUniformLocation(this.program, 'uProjectionMatrix');
        
        gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
        
        // Set up attributes
        const aPosition = gl.getAttribLocation(this.program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);
        
        const aColor = gl.getAttribLocation(this.program, 'aColor');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aColor);
        
        // Draw the mesh
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
    
    private compileShader(source: string, type: number): WebGLShader | null {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        if (!shader) {
            console.error('Failed to create shader');
            return null;
        }
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
        const gl = this.gl;
        const program = gl.createProgram();
        
        if (!program) {
            console.error('Failed to create program');
            return null;
        }
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    private uploadMeshData(positions: number[], colors: number[]): void {
        const gl = this.gl;
        
        // Upload position data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Upload color data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    }
    
    private getColorForBlockType(blockType: BlockType): [number, number, number] {
        switch (blockType) {
            case BlockType.DIRT:
                return [0.5, 0.25, 0.0];
            case BlockType.GRASS:
                return [0.0, 0.8, 0.0];
            case BlockType.STONE:
                return [0.5, 0.5, 0.5];
            case BlockType.WOOD:
                return [0.6, 0.3, 0.0];
            case BlockType.LEAVES:
                return [0.0, 0.5, 0.0];
            default:
                return [1.0, 1.0, 1.0];
        }
    }
    
    private addCubeFaces(
        x: number, y: number, z: number,
        color: [number, number, number],
        showPosX: boolean, showNegX: boolean,
        showPosY: boolean, showNegY: boolean,
        showPosZ: boolean, showNegZ: boolean,
        positions: number[], colors: number[]
    ): void {
        // Define the vertices for each face of a unit cube
        if (showPosX) {
            // Positive X face (right)
            positions.push(
                x + 1, y    , z    ,
                x + 1, y    , z + 1,
                x + 1, y + 1, z + 1,
                
                x + 1, y    , z    ,
                x + 1, y + 1, z + 1,
                x + 1, y + 1, z    
            );
            
            // Add colors for each vertex
            for (let i = 0; i < 6; i++) {
                colors.push(...color);
            }
        }
        
        if (showNegX) {
            // Negative X face (left)
            positions.push(
                x    , y    , z    ,
                x    , y + 1, z    ,
                x    , y + 1, z + 1,
                
                x    , y    , z    ,
                x    , y + 1, z + 1,
                x    , y    , z + 1
            );
            
            // Add colors for each vertex
            for (let i = 0; i < 6; i++) {
                colors.push(...color);
            }
        }
        
        if (showPosY) {
            // Positive Y face (top)
            positions.push(
                x    , y + 1, z    ,
                x + 1, y + 1, z    ,
                x + 1, y + 1, z + 1,
                
                x    , y + 1, z    ,
                x + 1, y + 1, z + 1,
                x    , y + 1, z + 1
            );
            
            // Add colors for each vertex
            for (let i = 0; i < 6; i++) {
                colors.push(...color);
            }
        }
        
        if (showNegY) {
            // Negative Y face (bottom)
            positions.push(
                x    , y    , z    ,
                x    , y    , z + 1,
                x + 1, y    , z + 1,
                
                x    , y    , z    ,
                x + 1, y    , z + 1,
                x + 1, y    , z    
            );
            
            // Add colors for each vertex
            for (let i = 0; i < 6; i++) {
                colors.push(...color);
            }
        }
        
        if (showPosZ) {
            // Positive Z face (front)
            positions.push(
                x    , y    , z + 1,
                x    , y + 1, z + 1,
                x + 1, y + 1, z + 1,
                
                x    , y    , z + 1,
                x + 1, y + 1, z + 1,
                x + 1, y    , z + 1
            );
            
            // Add colors for each vertex
            for (let i = 0; i < 6; i++) {
                colors.push(...color);
            }
        }
        
        if (showNegZ) {
            // Negative Z face (back)
            positions.push(
                x    , y    , z    ,
                x + 1, y    , z    ,
                x + 1, y + 1, z    ,
                
                x    , y    , z    ,
                x + 1, y + 1, z    ,
                x    , y + 1, z    
            );
            
            // Add colors for each vertex
            for (let i = 0; i < 6; i++) {
                colors.push(...color);
            }
        }
    }
} 