<script lang="ts">
    import type { GameObject, Shape2D, Shape3D, ObjectProperties2D, ObjectProperties3D } from '$lib/types/GameTypes';
    import { createEventDispatcher } from 'svelte';

    export let isOpen = false;
    export let mode: '2d' | '3d' = '2d';

    const dispatch = createEventDispatcher<{
        close: void;
        create: GameObject;
    }>();

    let selectedShape = 'rectangle';
    let width = 50;
    let height = 50;
    let color = '#ff0000';
    let depth = 50;

    const shapes2D: Shape2D[] = ['rectangle', 'circle', 'triangle'];
    const shapes3D: Shape3D[] = ['cube', 'sphere', 'cylinder', 'cone'];

    function handleSubmit() {
        const objectName = `${selectedShape}_${Date.now()}`;
        const properties = mode === '2d' 
            ? {
                width,
                height,
                color,
                shape: selectedShape as Shape2D
            } as ObjectProperties2D
            : {
                width,
                height,
                depth,
                color,
                shape: selectedShape as Shape3D
            } as ObjectProperties3D;

        const object: GameObject = {
            id: crypto.randomUUID(),
            name: objectName,
            position: { x: 400, y: 300, z: 0 },
            type: mode,
            properties,
            components: []
        };

        console.log('Creating object:', object);
        dispatch('create', object);
        handleClose();
    }

    function handleClose() {
        dispatch('close');
        isOpen = false;
        selectedShape = 'rectangle';
        width = 50;
        height = 50;
        depth = 50;
        color = '#ff0000';
    }
</script>

{#if isOpen}
    <div class="dialog-overlay" on:click={handleClose}>
        <div class="dialog" on:click|stopPropagation>
            <h2>Create New {mode.toUpperCase()} Object</h2>
            <form on:submit|preventDefault={handleSubmit}>
                <div class="form-group">
                    <label for="shape">Shape:</label>
                    <select id="shape" bind:value={selectedShape}>
                        {#if mode === '2d'}
                            {#each shapes2D as shapeOption}
                                <option value={shapeOption}>{shapeOption}</option>
                            {/each}
                        {:else}
                            {#each shapes3D as shapeOption}
                                <option value={shapeOption}>{shapeOption}</option>
                            {/each}
                        {/if}
                    </select>
                </div>

                <div class="form-group">
                    <label for="object-color">Color:</label>
                    <input 
                        id="object-color"
                        type="color" 
                        bind:value={color}
                    />
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="object-width">Width:</label>
                        <input 
                            id="object-width"
                            type="number" 
                            bind:value={width}
                            min="1"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="object-height">Height:</label>
                        <input 
                            id="object-height"
                            type="number" 
                            bind:value={height}
                            min="1"
                            required
                        />
                    </div>

                    {#if mode === '3d'}
                        <div class="form-group">
                            <label for="object-depth">Depth:</label>
                            <input 
                                id="object-depth"
                                type="number" 
                                bind:value={depth}
                                min="1"
                                required
                            />
                        </div>
                    {/if}
                </div>

                <div class="dialog-buttons">
                    <button type="button" on:click={handleClose}>Cancel</button>
                    <button type="submit">Create</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .dialog {
        background: #2c2c2c;
        padding: 2rem;
        border-radius: 8px;
        min-width: 400px;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #aaa;
    }

    .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
    }

    input, select {
        width: 100%;
        padding: 0.5rem;
        background: #333;
        border: 1px solid #444;
        color: white;
        border-radius: 4px;
    }

    input[type="color"] {
        padding: 0;
        height: 40px;
    }

    .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
    }
</style> 