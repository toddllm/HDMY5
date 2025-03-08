import { GameEngine } from '../GameEngine';
import { BlockType } from '../../voxel/VoxelData';

// Mock canvas and WebGL context
const createMockCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    // Mock WebGL context
    const gl = {
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
        disable: jest.fn(),
        cullFace: jest.fn(),
        clearColor: jest.fn(),
        clear: jest.fn(),
        drawArrays: jest.fn(),
        viewport: jest.fn(),
        
        DEPTH_TEST: 'depth_test',
        CULL_FACE: 'cull_face',
        BACK: 'back',
        COLOR_BUFFER_BIT: 'color_buffer_bit',
        DEPTH_BUFFER_BIT: 'depth_buffer_bit',
        ARRAY_BUFFER: 'array_buffer',
        ELEMENT_ARRAY_BUFFER: 'element_array_buffer',
        STATIC_DRAW: 'static_draw',
        TRIANGLES: 'triangles',
        VERTEX_SHADER: 'vertex_shader',
        FRAGMENT_SHADER: 'fragment_shader',
        COMPILE_STATUS: 'compile_status',
        LINK_STATUS: 'link_status'
    };
    
    // @ts-ignore - Mock WebGL context
    canvas.getContext = jest.fn(() => gl);
    
    return { canvas, gl };
};

describe('GameEngine', () => {
    let engine: GameEngine;
    let mockCanvas: HTMLCanvasElement;
    let mockGL: any;
    
    beforeEach(() => {
        const mock = createMockCanvas();
        mockCanvas = mock.canvas;
        mockGL = mock.gl;
        
        // @ts-ignore - Using mock canvas
        engine = new GameEngine(mockCanvas, 12345); // Fixed seed for consistent tests
    });
    
    it('should initialize successfully', () => {
        // Verify WebGL context was initialized
        expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl');
        
        // Verify renderer was initialized
        expect(mockGL.clearColor).toHaveBeenCalled();
    });
    
    it('should handle player position updates', () => {
        engine.setPlayerPosition(10, 20, 30);
        
        const position = engine.getPlayerPosition();
        expect(position.x).toBe(10);
        expect(position.y).toBe(20);
        expect(position.z).toBe(30);
    });
    
    it('should handle block placement and retrieval', () => {
        // Place a block
        engine.setBlock(5, 10, 15, BlockType.STONE);
        
        // Verify block was placed
        expect(engine.getBlock(5, 10, 15)).toBe(BlockType.STONE);
    });
    
    it('should handle canvas resizing', () => {
        engine.resize(1024, 768);
        
        // Verify viewport was updated
        expect(mockGL.viewport).toHaveBeenCalledWith(0, 0, 1024, 768);
        expect(mockCanvas.width).toBe(1024);
        expect(mockCanvas.height).toBe(768);
    });
    
    it('should render the scene', () => {
        // Set player position to trigger chunk loading
        engine.setPlayerPosition(0, 0, 0);
        
        // Render the scene
        engine.render();
        
        // Verify rendering occurred
        expect(mockGL.clear).toHaveBeenCalled();
    });
}); 