<script lang="ts">
    import CustomVoxelElement from '$lib/components/voxel/CustomVoxelElement.svelte';
    import SimpleVoxelTest from '$lib/components/voxel/SimpleVoxelTest.svelte';
    import VoxelGameCanvas from '$lib/components/voxel/VoxelGameCanvas.svelte';
    
    // Flag to use the simple component as fallback if needed
    let useSimpleTest = true;
</script>

<div class="container">
    <h1>Custom Voxel Element</h1>
    <p>This element was generated based on image analysis on 2025-03-08 at 17:20:53</p>
    
    <div class="controls">
        <button on:click={() => useSimpleTest = !useSimpleTest}>
            {useSimpleTest ? 'Try Advanced Component' : 'Use Simple Component'}
        </button>
        <p>Currently using: <strong>{useSimpleTest ? 'Simple Test' : 'Image-based'}</strong> component</p>
    </div>
    
    <div class="game-container">
        <VoxelGameCanvas />
    </div>
    
    {#if useSimpleTest}
        <SimpleVoxelTest />
    {:else}
        <CustomVoxelElement />
    {/if}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100vh;
    }
    
    h1 {
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        margin-top: 1rem;
        margin-bottom: 0.5rem;
    }
    
    p {
        color: white;
        margin-bottom: 1rem;
    }
    
    .game-container {
        width: 100%;
        height: 80vh;
        position: relative;
    }
    
    .controls {
        margin-bottom: 1rem;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-align: center;
    }
    
    button {
        background-color: #4CAF50;
        border: none;
        color: white;
        padding: 10px 15px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 14px;
        margin: 4px 2px;
        cursor: pointer;
        border-radius: 4px;
    }
    
    button:hover {
        background-color: #45a049;
    }
</style>
