export type Vector2D = {
    x: number;
    y: number;
};

export type Vector3D = {
    x: number;
    y: number;
    z: number;
};

export type Shape2D = 'rectangle' | 'circle' | 'triangle';
export type Shape3D = 'cube' | 'sphere' | 'cylinder' | 'cone';

export type ObjectProperties2D = {
    width: number;
    height: number;
    color: string;
    shape: Shape2D;
};

export type ObjectProperties3D = {
    width: number;
    height: number;
    depth: number;
    color: string;
    shape: Shape3D;
};

export type GameObject = {
    id: string;
    name: string;
    position: Vector2D | Vector3D;
    type: '2d' | '3d';
    properties: ObjectProperties2D | ObjectProperties3D;
    components: GameComponent[];
};

export type GameComponent = {
    id: string;
    type: string;
    properties: Record<string, any>;
};

export type GameScene = {
    id: string;
    name: string;
    objects: GameObject[];
    type: '2d' | '3d';
};
