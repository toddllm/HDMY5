<script lang="ts">
    import { onMount } from 'svelte';
    import { voxelGameStore } from '../../stores/voxel/voxelGameStore';
    
    let canvasElement: HTMLCanvasElement;
    
    onMount(() => {
        // Initialize the canvas
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }
        
        // Set canvas size
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
        
        // Draw a placeholder
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(0, canvasElement.height / 2, canvasElement.width, canvasElement.height / 2);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Voxel Game Canvas (Placeholder)', canvasElement.width / 2, canvasElement.height / 2);
        
        // Handle window resize
        const handleResize = () => {
            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;
            
            // Redraw placeholder
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
            
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, canvasElement.height / 2, canvasElement.width, canvasElement.height / 2);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Voxel Game Canvas (Placeholder)', canvasElement.width / 2, canvasElement.height / 2);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
</script>

<canvas bind:this={canvasElement}></canvas>

<style>
    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
