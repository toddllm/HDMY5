import { VoxelRenderer } from '../VoxelRenderer';
import { VoxelData, BlockType } from '../../voxel/VoxelData';

// Mock WebGL context
const createMockGL = () => {
    return {
        VERTEX_SHADER: 'vertex',
        FRAGMENT_SHADER: 'fragment',
        ARRAY_BUFFER: 'array_buffer',
        ELEMENT_ARRAY_BUFFER: 'element_array_buffer',
        STATIC_DRAW: 'static_draw',
        TRIANGLES: 'triangles',
        DEPTH_TEST: 'depth_test',
        CULL_FACE: 'cull_face',
        BACK: 'back',
        COMPILE_STATUS: 'compile_status',
        LINK_STATUS: 'link_status',
        
        createShader: jest.fn(() => 'shader'),
        shaderSource: jest.fn(),
        compileShader: jest.fn(),
        getShaderParameter: jest.fn(() => true),
        getShaderInfoLog: jest.fn(() => ''),
        deleteShader: jest.fn(),
        
        createProgram: jest.fn(() => 'program'),
        attachShader: jest.fn(),
        linkProgram: jest.fn(),
        getProgramParameter: jest.fn(() => true),
        getProgramInfoLog: jest.fn(() => ''),
        deleteProgram: jest.fn(),
        useProgram: jest.fn(),
        
        createBuffer: jest.fn(() => 'buffer'),
        bindBuffer: jest.fn(),
        bufferData: jest.fn(),
        
        getAttribLocation: jest.fn(() => 0),
        getUniformLocation: jest.fn(() => 'location'),
        vertexAttribPointer: jest.fn(),
        enableVertexAttribArray: jest.fn(),
        uniformMatrix4fv: jest.fn(),
        
        enable: jest.fn(),
        cullFace: jest.fn(),
        drawArrays: jest.fn()
    };
};

describe('VoxelRenderer', () => {
    let mockGL: any;
    let renderer: VoxelRenderer;
    
    beforeEach(() => {
        mockGL = createMockGL();
        // @ts-ignore - Using mock GL context
        renderer = new VoxelRenderer(mockGL);
    });
    
    it('should initialize WebGL resources', () => {
        renderer.initialize();
        
        // Should create shaders
        expect(mockGL.createShader).toHaveBeenCalledTimes(2);
        expect(mockGL.shaderSource).toHaveBeenCalledTimes(2);
        expect(mockGL.compileShader).toHaveBeenCalledTimes(2);
        
        // Should create program
        expect(mockGL.createProgram).toHaveBeenCalled();
        expect(mockGL.attachShader).toHaveBeenCalledTimes(2);
        expect(mockGL.linkProgram).toHaveBeenCalled();
        
        // Should create buffers
        expect(mockGL.createBuffer).toHaveBeenCalledTimes(2);
        
        // Should set up WebGL state
        expect(mockGL.enable).toHaveBeenCalledWith(mockGL.DEPTH_TEST);
        expect(mockGL.enable).toHaveBeenCalledWith(mockGL.CULL_FACE);
        expect(mockGL.cullFace).toHaveBeenCalledWith(mockGL.BACK);
    });
    
    it('should create mesh from voxel data', () => {
        const voxelData = new VoxelData(2, 2, 2);
        
        // Add some blocks
        voxelData.setBlock(0, 0, 0, BlockType.STONE);
        voxelData.setBlock(1, 0, 0, BlockType.DIRT);
        
        renderer.initialize();
        renderer.createMeshFromVoxelData(voxelData);
        
        // Should bind and upload data to buffers
        expect(mockGL.bindBuffer).toHaveBeenCalledWith(mockGL.ARRAY_BUFFER, 'buffer');
        expect(mockGL.bufferData).toHaveBeenCalledTimes(2);
    });
    
    it('should render the mesh', () => {
        const voxelData = new VoxelData(2, 2, 2);
        voxelData.setBlock(0, 0, 0, BlockType.STONE);
        
        renderer.initialize();
        renderer.createMeshFromVoxelData(voxelData);
        
        const modelViewMatrix = new Float32Array(16);
        const projectionMatrix = new Float32Array(16);
        
        renderer.render(modelViewMatrix, projectionMatrix);
        
        // Should use program
        expect(mockGL.useProgram).toHaveBeenCalledWith('program');
        
        // Should set uniforms
        expect(mockGL.getUniformLocation).toHaveBeenCalledTimes(2);
        expect(mockGL.uniformMatrix4fv).toHaveBeenCalledTimes(2);
        
        // Should set up attributes
        expect(mockGL.getAttribLocation).toHaveBeenCalledTimes(2);
        expect(mockGL.bindBuffer).toHaveBeenCalledTimes(4); // 2 in createMesh, 2 in render
        expect(mockGL.vertexAttribPointer).toHaveBeenCalledTimes(2);
        expect(mockGL.enableVertexAttribArray).toHaveBeenCalledTimes(2);
        
        // Should draw
        expect(mockGL.drawArrays).toHaveBeenCalled();
    });
}); 