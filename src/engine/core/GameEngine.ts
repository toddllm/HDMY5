import { BlockType } from "../voxel/VoxelData";
import { TerrainGenerator } from "../terrain/TerrainGenerator";
import { ChunkManager } from "../chunks/ChunkManager";
import { VoxelRenderer } from "../renderer/VoxelRenderer";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private renderer: VoxelRenderer;
  private chunkManager: ChunkManager;
  private terrainGenerator: TerrainGenerator;

  private viewMatrix: Float32Array;
  private projectionMatrix: Float32Array;

  private playerPosition: { x: number; y: number; z: number } = {
    x: 0,
    y: 0,
    z: 0,
  };
  private viewDirection: { x: number; y: number; z: number } = {
    x: 1,
    y: 0,
    z: 0,
  };
  private viewDistance: number = 2; // Number of chunks to render in each direction

  constructor(canvas: HTMLCanvasElement, seed: number = Math.random() * 10000) {
    this.canvas = canvas;

    // Initialize WebGL context
    const gl = canvas.getContext("webgl");
    if (!gl) {
      throw new Error("WebGL not supported");
    }
    this.gl = gl;

    // Initialize components
    this.terrainGenerator = new TerrainGenerator(seed);
    this.chunkManager = new ChunkManager(16, 128, 16, this.terrainGenerator);
    this.renderer = new VoxelRenderer(gl);

    // Initialize matrices
    this.viewMatrix = new Float32Array(16);
    this.projectionMatrix = new Float32Array(16);

    // Initialize WebGL
    this.initializeWebGL();
  }

  private initializeWebGL(): void {
    // Initialize renderer
    this.renderer.initialize();

    // Set clear color (sky blue)
    this.gl.clearColor(0.5, 0.7, 1.0, 1.0);

    // Set up projection matrix
    this.updateProjectionMatrix();
  }

  private updateProjectionMatrix(): void {
    // Simple perspective matrix setup
    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = this.canvas.width / this.canvas.height;
    const zNear = 0.1;
    const zFar = 1000.0;

    // Perspective matrix calculation
    const f = 1.0 / Math.tan(fieldOfView / 2);
    const rangeInv = 1 / (zNear - zFar);

    this.projectionMatrix[0] = f / aspect;
    this.projectionMatrix[1] = 0;
    this.projectionMatrix[2] = 0;
    this.projectionMatrix[3] = 0;

    this.projectionMatrix[4] = 0;
    this.projectionMatrix[5] = f;
    this.projectionMatrix[6] = 0;
    this.projectionMatrix[7] = 0;

    this.projectionMatrix[8] = 0;
    this.projectionMatrix[9] = 0;
    this.projectionMatrix[10] = (zFar + zNear) * rangeInv;
    this.projectionMatrix[11] = -1;

    this.projectionMatrix[12] = 0;
    this.projectionMatrix[13] = 0;
    this.projectionMatrix[14] = 2 * zFar * zNear * rangeInv;
    this.projectionMatrix[15] = 0;
  }

  private updateViewMatrix(): void {
    // Look-at matrix using player position and view direction
    const eye = [
      this.playerPosition.x,
      this.playerPosition.y,
      this.playerPosition.z,
    ];
    const center = [
      this.playerPosition.x + this.viewDirection.x,
      this.playerPosition.y + this.viewDirection.y,
      this.playerPosition.z + this.viewDirection.z,
    ];
    const up = [0, 1, 0];

    let z0 = eye[0] - center[0];
    let z1 = eye[1] - center[1];
    let z2 = eye[2] - center[2];

    // Normalize z
    let len = Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    if (len > 0) {
      len = 1 / len;
      z0 *= len;
      z1 *= len;
      z2 *= len;
    }

    // Cross product of up and z to get x
    let x0 = up[1] * z2 - up[2] * z1;
    let x1 = up[2] * z0 - up[0] * z2;
    let x2 = up[0] * z1 - up[1] * z0;

    // Normalize x
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (len > 0) {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    // Cross product of z and x to get y
    const y0 = z1 * x2 - z2 * x1;
    const y1 = z2 * x0 - z0 * x2;
    const y2 = z0 * x1 - z1 * x0;

    // Set view matrix
    this.viewMatrix[0] = x0;
    this.viewMatrix[1] = y0;
    this.viewMatrix[2] = z0;
    this.viewMatrix[3] = 0;

    this.viewMatrix[4] = x1;
    this.viewMatrix[5] = y1;
    this.viewMatrix[6] = z1;
    this.viewMatrix[7] = 0;

    this.viewMatrix[8] = x2;
    this.viewMatrix[9] = y2;
    this.viewMatrix[10] = z2;
    this.viewMatrix[11] = 0;

    this.viewMatrix[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
    this.viewMatrix[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
    this.viewMatrix[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
    this.viewMatrix[15] = 1;
  }

  setPlayerPosition(x: number, y: number, z: number): void {
    this.playerPosition.x = x;
    this.playerPosition.y = y;
    this.playerPosition.z = z;

    // Update view matrix
    this.updateViewMatrix();

    // Update loaded chunks
    this.chunkManager.updateLoadedChunks(x, z, this.viewDistance);
  }

  getPlayerPosition(): { x: number; y: number; z: number } {
    return { ...this.playerPosition };
  }

  setBlock(x: number, y: number, z: number, blockType: BlockType): void {
    this.chunkManager.setBlock(x, y, z, blockType);
  }

  getBlock(x: number, y: number, z: number): BlockType {
    return this.chunkManager.getBlock(x, y, z);
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);

    // Update projection matrix
    this.updateProjectionMatrix();
  }

  render(): void {
    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Get loaded chunks
    const chunks = this.chunkManager.getLoadedChunks();

    // Render each chunk
    for (const chunk of chunks) {
      // Create mesh from chunk data
      this.renderer.createMeshFromVoxelData(chunk.data);

      // Render the mesh
      this.renderer.render(this.viewMatrix, this.projectionMatrix);
    }
  }

  update(_deltaTime: number): void {
    // Update game logic here
    // This could include physics, AI, etc.
  }

  dispose(): void {
    // Clean up resources
    this.chunkManager.saveModifiedChunks();
  }

  setViewDirection(x: number, y: number, z: number): void {
    this.viewDirection.x = x;
    this.viewDirection.y = y;
    this.viewDirection.z = z;

    // Update view matrix
    this.updateViewMatrix();
  }
}
