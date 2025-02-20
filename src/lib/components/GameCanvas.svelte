<script lang="ts">
    import { onMount } from 'svelte';
    import type { GameScene, GameObject, ObjectProperties2D } from '$lib/types/GameTypes';
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
        if (object.type !== '2d') return false;
        
        const props = object.properties as ObjectProperties2D;
        const left = object.position.x - props.width / 2;
        const right = object.position.x + props.width / 2;
        const top = object.position.y - props.height / 2;
        const bottom = object.position.y + props.height / 2;
        
        return x >= left && x <= right && y >= top && y <= bottom;
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
        console.log('Mouse move at:', pos);
        console.log('Dragging object:', draggedObject);
        
        const newPosition = {
            x: pos.x - dragOffset.x,
            y: pos.y - dragOffset.y
        };
        console.log('New position:', newPosition);
        
        // Update the object's position in the scene
        activeScene.update(currentScene => {
            if (!currentScene) return currentScene;
            
            const updatedObjects = currentScene.objects.map(obj => {
                if (obj.id === draggedObject?.id) {
                    console.log('Updating object position');
                    return {
                        ...obj,
                        position: {
                            ...obj.position,
                            x: newPosition.x,
                            y: newPosition.y
                        }
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
        console.log('Mouse up, isDragging:', isDragging);
        if (isDragging) {
            canvas.style.cursor = 'grab';
        }
        isDragging = false;
        draggedObject = null;
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
    
    onMount(() => {
        ctx = canvas.getContext('2d')!;
        
        const gameLoop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            scene.objects.forEach(object => {
                if (object.type === '2d') {
                    draw2DObject(object);
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
