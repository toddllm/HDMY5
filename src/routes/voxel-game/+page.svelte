<script lang="ts">
    import { onMount } from 'svelte';
    import VoxelGameCanvas from '../../lib/components/voxel/VoxelGameCanvas.svelte';
    import { generateFlatTerrain } from '../../lib/stores/voxel/voxelGameStore';
    
    onMount(() => {
        console.log('Voxel Game mounted');
        
        // Generate a simple flat terrain
        generateFlatTerrain(8, 0);
    });
</script>

<div class="voxel-game-container">
    <h1 class="title">HDMY5 Voxel Game</h1>
    <VoxelGameCanvas />
</div>

<style>
    .voxel-game-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    
    .title {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-family: sans-serif;
        font-size: 24px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        z-index: 10;
        pointer-events: none;
    }
</style>
