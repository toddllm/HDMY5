<script lang="ts">
    import { onMount } from 'svelte';
    import type { GameScene, GameObject, ObjectProperties2D, ObjectProperties3D, EntityProperties } from '$lib/types/GameTypes';
    import { activeScene, selectObject } from '$lib/stores/gameStore';
    
    export let scene: GameScene;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    
    let isDragging = false;
    let draggedObject: GameObject | null = null;
    let dragOffset = { x: 0, y: 0 };

    function getCanvasMousePosition(event: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    function isPointInObject(x: number, y: number, object: GameObject): boolean {
        if (object.type === '2d') {
            const props = object.properties as ObjectProperties2D;
            const left = object.position.x - props.width / 2;
            const right = object.position.x + props.width / 2;
            const top = object.position.y - props.height / 2;
            const bottom = object.position.y + props.height / 2;
            
            return x >= left && x <= right && y >= top && y <= bottom;
        } 
        else if (object.type === '3d') {
            const props = object.properties as ObjectProperties3D;
            const left = object.position.x - props.width / 2;
            const right = object.position.x + props.width / 2;
            const top = object.position.y - props.height / 2;
            const bottom = object.position.y + props.height / 2;
            
            return x >= left && x <= right && y >= top && y <= bottom;
        }
        else if (object.type === 'entity') {
            // For entities, use a standard hit area
            const size = 30; // Standard entity size
            const left = object.position.x - size / 2;
            const right = object.position.x + size / 2;
            const top = object.position.y - size / 2;
            const bottom = object.position.y + size / 2;
            
            return x >= left && x <= right && y >= top && y <= bottom;
        }
        
        return false;
    }

    function handleMouseDown(event: MouseEvent) {
        const pos = getCanvasMousePosition(event);
        
        // Check objects in reverse order (top-most first)
        for (let i = scene.objects.length - 1; i >= 0; i--) {
            const object = scene.objects[i];
            if (isPointInObject(pos.x, pos.y, object)) {
                isDragging = true;
                draggedObject = object;
                dragOffset = {
                    x: pos.x - object.position.x,
                    y: pos.y - object.position.y
                };
                selectObject(object);  // Select the object being dragged
                canvas.style.cursor = 'grabbing';
                break;
            }
        }

        // If we clicked empty space, deselect
        if (!draggedObject) {
            selectObject(null);
        }
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging || !draggedObject) return;
        
        const pos = getCanvasMousePosition(event);
        
        const newPosition = {
            x: pos.x - dragOffset.x,
            y: pos.y - dragOffset.y,
            z: draggedObject.position.z
        };
        
        // Update the object's position in the scene
        activeScene.update(currentScene => {
            if (!currentScene) return currentScene;
            
            const updatedObjects = currentScene.objects.map(obj => {
                if (obj.id === draggedObject?.id) {
                    return {
                        ...obj,
                        position: newPosition
                    };
                }
                return obj;
            });
            
            return {
                ...currentScene,
                objects: updatedObjects
            };
        });
    }

    function handleMouseUp() {
        if (isDragging && draggedObject) {
            // Save the final position
            activeScene.update(currentScene => {
                if (!currentScene) return currentScene;
                
                return {
                    ...currentScene,
                    objects: [...currentScene.objects]
                };
            });
        }
        
        isDragging = false;
        draggedObject = null;
        canvas.style.cursor = 'grab';
    }

    function draw2DObject(object: GameObject) {
        const props = object.properties as ObjectProperties2D;
        
        ctx.fillStyle = props.color;
        
        switch (props.shape) {
            case 'rectangle':
                ctx.fillRect(
                    object.position.x - props.width / 2,
                    object.position.y - props.height / 2,
                    props.width,
                    props.height
                );
                break;
                
            case 'circle':
                ctx.beginPath();
                ctx.arc(
                    object.position.x,
                    object.position.y,
                    props.width / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                break;
                
            case 'triangle':
                const x = object.position.x;
                const y = object.position.y;
                const w = props.width;
                const h = props.height;
                
                ctx.beginPath();
                ctx.moveTo(x, y - h/2);
                ctx.lineTo(x - w/2, y + h/2);
                ctx.lineTo(x + w/2, y + h/2);
                ctx.closePath();
                ctx.fill();
                break;
        }

        // Draw selection outline if object is being dragged
        if (draggedObject?.id === object.id) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                object.position.x - props.width / 2 - 2,
                object.position.y - props.height / 2 - 2,
                props.width + 4,
                props.height + 4
            );
        }
    }
    
    function draw3DObject(object: GameObject) {
        const props = object.properties as ObjectProperties3D;
        
        // For now, just draw 2D representations with shadows
        ctx.fillStyle = props.color;
        
        switch (props.shape) {
            case 'cube':
                // Draw a simple cube with shadow
                const cubeX = object.position.x;
                const cubeY = object.position.y;
                const cubeW = props.width;
                const cubeH = props.height;
                const depth = Math.min(props.depth * 0.5, 20); // Limit depth for display
                
                // Draw shadow first
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(
                    cubeX - cubeW/2 + depth,
                    cubeY - cubeH/2 + depth,
                    cubeW,
                    cubeH
                );
                
                // Draw main cube
                ctx.fillStyle = props.color;
                ctx.fillRect(
                    cubeX - cubeW/2,
                    cubeY - cubeH/2,
                    cubeW,
                    cubeH
                );
                break;
                
            case 'sphere':
                // Draw sphere with shadow
                const sphereX = object.position.x;
                const sphereY = object.position.y;
                const radius = props.width / 2;
                
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(
                    sphereX + 5,
                    sphereY + 5,
                    radius,
                    radius * 0.4,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Sphere
                ctx.fillStyle = props.color;
                ctx.beginPath();
                ctx.arc(
                    sphereX,
                    sphereY,
                    radius,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                break;
                
            case 'cylinder':
                // Draw a cylinder approximation
                const cylX = object.position.x;
                const cylY = object.position.y;
                const cylW = props.width;
                const cylH = props.height;
                
                // Draw the shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(
                    cylX - cylW/2 + 5,
                    cylY - cylH/2 + 5,
                    cylW,
                    cylH
                );
                
                // Draw the cylinder body
                ctx.fillStyle = props.color;
                ctx.fillRect(
                    cylX - cylW/2,
                    cylY - cylH/2,
                    cylW,
                    cylH
                );
                
                // Top oval
                ctx.beginPath();
                ctx.ellipse(
                    cylX,
                    cylY - cylH/2,
                    cylW/2,
                    cylW/4,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                break;
                
            case 'cone':
                // Draw a cone approximation
                const coneX = object.position.x;
                const coneY = object.position.y;
                const coneW = props.width;
                const coneH = props.height;
                
                // Draw shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.moveTo(coneX + 5, coneY - coneH/2 + 5);
                ctx.lineTo(coneX - coneW/2 + 5, coneY + coneH/2 + 5);
                ctx.lineTo(coneX + coneW/2 + 5, coneY + coneH/2 + 5);
                ctx.closePath();
                ctx.fill();
                
                // Draw cone
                ctx.fillStyle = props.color;
                ctx.beginPath();
                ctx.moveTo(coneX, coneY - coneH/2);
                ctx.lineTo(coneX - coneW/2, coneY + coneH/2);
                ctx.lineTo(coneX + coneW/2, coneY + coneH/2);
                ctx.closePath();
                ctx.fill();
                break;
        }
        
        // Draw selection outline
        if (draggedObject?.id === object.id) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                object.position.x - props.width / 2 - 2,
                object.position.y - props.height / 2 - 2,
                props.width + 4,
                props.height + 4
            );
        }
    }
    
    function drawEntity(object: GameObject) {
        const props = object.properties as EntityProperties;
        
        // Draw entity based on its type
        const x = object.position.x;
        const y = object.position.y;
        const size = 30; // Base size for entities
        
        // Visual representation based on entity type
        switch (props.entityType) {
            case 'hero':
            case 'wizard':
            case 'fairy':
            case 'robot':
                // Characters are blue triangles
                ctx.fillStyle = '#4287f5';  // Blue
                ctx.beginPath();
                ctx.moveTo(x, y - size/2);
                ctx.lineTo(x - size/2, y + size/2);
                ctx.lineTo(x + size/2, y + size/2);
                ctx.closePath();
                ctx.fill();
                
                // Label with first letter of character type
                if (props.characterType) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '14px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(props.characterType.charAt(0).toUpperCase(), x, y);
                }
                break;
                
            case 'monster':
            case 'boss':
            case 'minion':
            case 'drone':
                // Monsters are red circles
                ctx.fillStyle = '#f54242';  // Red
                ctx.beginPath();
                ctx.arc(x, y, size/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Label with first letter of monster type
                if (props.monsterType) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '14px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(props.monsterType.charAt(0).toUpperCase(), x, y);
                }
                break;
                
            case 'potion':
            case 'weapon':
            case 'armor':
            case 'portal':
            case 'key':
            case 'treasure':
                // Items are yellow squares
                ctx.fillStyle = '#f5d742';  // Yellow
                ctx.fillRect(x - size/2, y - size/2, size, size);
                
                // Label with first letter of item type
                if (props.itemType) {
                    ctx.fillStyle = '#000000';
                    ctx.font = '14px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(props.itemType.charAt(0).toUpperCase(), x, y);
                }
                break;
                
            default:
                // Default entity rendering
                ctx.fillStyle = '#42f59e';  // Green
                ctx.fillRect(x - size/2, y - size/2, size, size);
                break;
        }
        
        // Draw entity name
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(object.name, x, y - size/2 - 5);
        
        // Draw selection outline
        if (draggedObject?.id === object.id) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                x - size/2 - 2,
                y - size/2 - 2,
                size + 4,
                size + 4
            );
        }
    }
    
    onMount(() => {
        ctx = canvas.getContext('2d')!;
        
        const gameLoop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            scene.objects.forEach(object => {
                if (object.type === '2d') {
                    draw2DObject(object);
                } else if (object.type === '3d') {
                    draw3DObject(object);
                } else if (object.type === 'entity') {
                    drawEntity(object);
                }
            });
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    });
</script>

<canvas
    bind:this={canvas}
    width={800}
    height={600}
    class="game-canvas"
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseUp}
>
</canvas>

<style>
    .game-canvas {
        border: 1px solid #ccc;
        background: #f0f0f0;
        cursor: grab;
    }

    .game-canvas:active {
        cursor: grabbing;
    }
</style>
