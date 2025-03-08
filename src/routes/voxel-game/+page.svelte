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
</style>
