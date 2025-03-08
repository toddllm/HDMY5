<script lang="ts">
    import GameCanvas from '$lib/components/GameCanvas.svelte';
    import ObjectCreationDialog from '$lib/components/ObjectCreationDialog.svelte';
    import EntityCreationDialog from '$lib/components/EntityCreationDialog.svelte';
    import { activeScene, createScene, scenes, updateScene, deleteScene, initializeStore, selectedObject } from '$lib/stores/gameStore';
    import type { GameObject, GameScene, EntityProperties, ObjectProperties2D, ObjectProperties3D } from '$lib/types/GameTypes';
    import { onMount } from 'svelte';
    
    let currentMode: '2d' | '3d' = '2d';
    let showObjectDialog = false;
    let showEntityDialog = false;
    
    onMount(async () => {
        await initializeStore();
        if ($scenes.length === 0) {
            await handleNewScene();
        }
    });
    
    async function handleNewScene() {
        const sceneName = `Scene ${$scenes.length + 1}`;
        const newScene = await createScene(sceneName, currentMode);
        activeScene.set(newScene);
    }
    
    function handleAddObject() {
        console.log('Add Object button clicked');
        showObjectDialog = true;
        console.log('showObjectDialog set to:', showObjectDialog);
        
        // Force a UI update by using setTimeout
        setTimeout(() => {
            if (!showObjectDialog) {
                console.log('Dialog not showing, forcing it open');
                showObjectDialog = true;
            }
        }, 100);
    }
    
    function handleAddEntity() {
        showEntityDialog = true;
    }
    
    async function handleObjectCreate(event: CustomEvent<GameObject>) {
        if (!$activeScene) return;
        
        const updatedScene = {
            ...$activeScene,
            objects: [...$activeScene.objects, event.detail]
        };
        
        await updateScene(updatedScene);
        activeScene.set(updatedScene);
    }
    
    async function handleEntityCreate(event: CustomEvent<GameObject>) {
        if (!$activeScene) return;
        
        const updatedScene = {
            ...$activeScene,
            objects: [...$activeScene.objects, event.detail]
        };
        
        await updateScene(updatedScene);
        activeScene.set(updatedScene);
    }
    
    async function handleDeleteScene(scene: GameScene) {
        if (confirm(`Are you sure you want to delete scene "${scene.name}"?`)) {
            await deleteScene(scene.id);
        }
    }
    
    function handleModeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        currentMode = select.value as '2d' | '3d';
    }
    
    function handleSceneSelect(scene: GameScene) {
        activeScene.set(scene);
    }
    
    function handleKeyDown(event: KeyboardEvent, scene: GameScene) {
        if (event.key === 'Enter' || event.key === ' ') {
            handleSceneSelect(scene);
        }
    }
    
    // Helper for displaying object properties based on type
    $: objectProperties = $selectedObject?.properties;
    $: isEntity = $selectedObject?.type === 'entity';
    $: is3DObject = $selectedObject?.type === '3d';
</script>

<div class="editor-layout">
    <header class="toolbar">
        <h1>HDMY5 Game Builder</h1>
        <div class="tools">
            <button type="button" on:click={handleNewScene}>New Scene</button>
            <button type="button" on:click={handleAddObject} disabled={!$activeScene}>
                Add Object
            </button>
            <button type="button" on:click={handleAddEntity} disabled={!$activeScene}>
                Add Entity
            </button>
            <label class="mode-select">
                Mode:
                <select bind:value={currentMode} on:change={handleModeChange}>
                    <option value="2d">2D Mode</option>
                    <option value="3d">3D Mode</option>
                </select>
            </label>
        </div>
    </header>
    
    <main class="main-content">
        <aside class="sidebar">
            <div class="scene-hierarchy">
                <h2 id="scenes-heading">Scene Hierarchy</h2>
                <ul class="scenes-list" role="list" aria-labelledby="scenes-heading">
                    {#each $scenes as scene}
                        <li>
                            <div 
                                class="scene-item"
                                class:active={$activeScene?.id === scene.id}
                            >
                                <div class="scene-header">
                                    <button 
                                        type="button"
                                        class="scene-select-btn"
                                        on:click={() => handleSceneSelect(scene)}
                                        on:keydown={(e) => handleKeyDown(e, scene)}
                                    >
                                        {scene.name} ({scene.type})
                                    </button>
                                    <button 
                                        type="button" 
                                        class="delete-btn"
                                        on:click|stopPropagation={() => handleDeleteScene(scene)}
                                        title="Delete scene"
                                    >
                                        ×
                                    </button>
                                </div>
                                {#if scene.objects.length > 0}
                                    <ul class="object-list" role="list">
                                        {#each scene.objects as object}
                                            <li class="object-item">
                                                {#if object.type === 'entity'}
                                                    {object.name} ({(object.properties as EntityProperties).entityType})
                                                {:else}
                                                    {object.name} ({(object.properties as ObjectProperties2D | ObjectProperties3D).shape})
                                                {/if}
                                            </li>
                                        {/each}
                                    </ul>
                                {/if}
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        </aside>
        
        <div class="canvas-container">
            {#if $activeScene}
                <GameCanvas scene={$activeScene} />
            {/if}
        </div>
        
        <aside class="properties-panel">
            <h2 id="properties-heading">Properties</h2>
            {#if $selectedObject}
                <div class="properties-form" role="form" aria-labelledby="properties-heading">
                    <div class="property">
                        <label for="object-name">Object Name:</label>
                        <input 
                            id="object-name"
                            type="text" 
                            bind:value={$selectedObject.name}
                            on:input={() => updateScene($activeScene!)}
                        />
                    </div>
                    
                    {#if isEntity}
                        <!-- Entity properties -->
                        <div class="property">
                            <label for="entity-type">Entity Type:</label>
                            <input 
                                id="entity-type"
                                type="text" 
                                value={(objectProperties as EntityProperties).entityType}
                                readonly
                            />
                        </div>
                        <div class="property">
                            <label for="entity-health">Health:</label>
                            <input 
                                id="entity-health"
                                type="number" 
                                bind:value={(objectProperties as EntityProperties).health}
                                on:input={() => updateScene($activeScene!)}
                            />
                        </div>
                        <div class="property">
                            <label for="entity-speed">Speed:</label>
                            <input 
                                id="entity-speed"
                                type="number" 
                                bind:value={(objectProperties as EntityProperties).speed}
                                on:input={() => updateScene($activeScene!)}
                            />
                        </div>
                        {#if (objectProperties as EntityProperties).damage !== undefined}
                            <div class="property">
                                <label for="entity-damage">Damage:</label>
                                <input 
                                    id="entity-damage"
                                    type="number" 
                                    bind:value={(objectProperties as EntityProperties).damage}
                                    on:input={() => updateScene($activeScene!)}
                                />
                            </div>
                        {/if}
                        {#if (objectProperties as EntityProperties).defense !== undefined}
                            <div class="property">
                                <label for="entity-defense">Defense:</label>
                                <input 
                                    id="entity-defense"
                                    type="number" 
                                    bind:value={(objectProperties as EntityProperties).defense}
                                    on:input={() => updateScene($activeScene!)}
                                />
                            </div>
                        {/if}
                        <div class="property">
                            <label for="entity-description">Description:</label>
                            <textarea 
                                id="entity-description"
                                bind:value={(objectProperties as EntityProperties).description}
                                on:input={() => updateScene($activeScene!)}
                            ></textarea>
                        </div>
                        <div class="property checkbox">
                            <label>
                                <input 
                                    type="checkbox" 
                                    bind:checked={(objectProperties as EntityProperties).isHostile}
                                    on:change={() => updateScene($activeScene!)}
                                />
                                Hostile
                            </label>
                        </div>
                        <div class="property checkbox">
                            <label>
                                <input 
                                    type="checkbox" 
                                    bind:checked={(objectProperties as EntityProperties).interactable}
                                    on:change={() => updateScene($activeScene!)}
                                />
                                Interactable
                            </label>
                        </div>
                    {:else}
                        <!-- 2D/3D object properties -->
                        <div class="property">
                            <label for="object-color">Color:</label>
                            <input 
                                id="object-color"
                                type="color" 
                                bind:value={(objectProperties as ObjectProperties2D | ObjectProperties3D).color}
                                on:input={() => updateScene($activeScene!)}
                            />
                        </div>
                        <div class="property">
                            <label for="object-width">Width:</label>
                            <input 
                                id="object-width"
                                type="number" 
                                bind:value={(objectProperties as ObjectProperties2D | ObjectProperties3D).width}
                                on:input={() => updateScene($activeScene!)}
                            />
                        </div>
                        <div class="property">
                            <label for="object-height">Height:</label>
                            <input 
                                id="object-height"
                                type="number" 
                                bind:value={(objectProperties as ObjectProperties2D | ObjectProperties3D).height}
                                on:input={() => updateScene($activeScene!)}
                            />
                        </div>
                        {#if is3DObject}
                            <div class="property">
                                <label for="object-depth">Depth:</label>
                                <input 
                                    id="object-depth"
                                    type="number" 
                                    bind:value={(objectProperties as ObjectProperties3D).depth}
                                    on:input={() => updateScene($activeScene!)}
                                />
                            </div>
                        {/if}
                    {/if}
                    
                    <div class="property">
                        <label>Position:</label>
                        <div class="position-inputs">
                            <div>
                                <label for="pos-x">X:</label>
                                <input 
                                    id="pos-x"
                                    type="number" 
                                    bind:value={$selectedObject.position.x}
                                    on:input={() => updateScene($activeScene!)}
                                />
                            </div>
                            <div>
                                <label for="pos-y">Y:</label>
                                <input 
                                    id="pos-y"
                                    type="number" 
                                    bind:value={$selectedObject.position.y}
                                    on:input={() => updateScene($activeScene!)}
                                />
                            </div>
                            <div>
                                <label for="pos-z">Z:</label>
                                <input 
                                    id="pos-z"
                                    type="number" 
                                    bind:value={$selectedObject.position.z}
                                    on:input={() => updateScene($activeScene!)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            {:else if $activeScene}
                <div class="scene-properties">
                    <div class="property">
                        <label for="scene-name">Scene Name:</label>
                        <input 
                            id="scene-name"
                            type="text" 
                            bind:value={$activeScene.name}
                            on:input={() => updateScene($activeScene!)}
                        />
                    </div>
                    <div class="property">
                        <label for="scene-type">Scene Type:</label>
                        <select 
                            id="scene-type" 
                            bind:value={$activeScene.type}
                            on:change={() => updateScene($activeScene!)}
                        >
                            <option value="2d">2D</option>
                            <option value="3d">3D</option>
                        </select>
                    </div>
                </div>
            {:else}
                <p>No scene selected</p>
            {/if}
        </aside>
    </main>
    
    <ObjectCreationDialog 
        bind:isOpen={showObjectDialog}
        mode={currentMode}
        on:close={() => (showObjectDialog = false)}
        on:create={handleObjectCreate}
    />

    <EntityCreationDialog
        bind:isOpen={showEntityDialog}
        on:close={() => (showEntityDialog = false)}
        on:create={handleEntityCreate}
    />
</div>

<style>
    .editor-layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }
    
    .toolbar {
        padding: 1rem;
        background: #2c2c2c;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .main-content {
        flex: 1;
        display: grid;
        grid-template-columns: 250px 1fr 250px;
        gap: 1rem;
        padding: 1rem;
        background: #1e1e1e;
        color: white;
    }
    
    .sidebar, .properties-panel {
        background: #2c2c2c;
        padding: 1rem;
        border-radius: 4px;
    }
    
    .canvas-container {
        display: flex;
        justify-content: center;
        align-items: center;
        background: #333;
        border-radius: 4px;
        padding: 1rem;
    }
    
    h1 {
        margin: 0;
        font-size: 1.5rem;
    }
    
    h2 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
    }
    
    .tools {
        display: flex;
        gap: 1rem;
    }
    
    button, select {
        padding: 0.5rem 1rem;
        background: #444;
        border: none;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }
    
    button:hover {
        background: #555;
    }
    
    .mode-select {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: white;
    }
    
    .scenes-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .scene-item {
        width: 100%;
        padding: 0.5rem;
        background: #333;
        border-radius: 4px;
    }
    
    .scene-item:hover {
        background: #444;
    }
    
    .scene-item.active {
        background: #555;
        border-left: 3px solid #fff;
    }
    
    .scene-select-btn {
        flex: 1;
        text-align: left;
        padding: 0;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
    }
    
    .scene-select-btn:hover {
        background: none;
    }
    
    .scene-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
    }
    
    .object-list {
        margin-left: 1rem;
        margin-top: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .object-item {
        padding: 0.25rem;
        background: #2c2c2c;
        border-radius: 2px;
        font-size: 0.9em;
    }
    
    .property {
        margin-bottom: 1rem;
    }
    
    .property label {
        display: block;
        margin-bottom: 0.25rem;
        color: #aaa;
    }
    
    .property input {
        width: 100%;
        padding: 0.5rem;
        background: #333;
        border: 1px solid #444;
        color: white;
        border-radius: 4px;
    }
    
    .property input:focus {
        outline: none;
        border-color: #666;
    }
    
    .delete-btn {
        padding: 0.2rem 0.5rem;
        background: #ff4444;
        border: none;
        border-radius: 4px;
        color: white;
        font-size: 1rem;
        line-height: 1;
        opacity: 0;
        transition: opacity 0.2s;
    }
    
    .delete-btn:hover {
        background: #ff6666;
    }
    
    .position-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
    }

    .position-inputs > div {
        display: flex;
        flex-direction: column;
    }

    .position-inputs label {
        font-size: 0.8em;
        margin-bottom: 0.25rem;
    }

    input[type="number"] {
        width: 100%;
        padding: 0.5rem;
        background: #333;
        border: 1px solid #444;
        color: white;
        border-radius: 4px;
    }

    input[type="color"] {
        width: 100%;
        height: 40px;
        padding: 0;
        border: none;
        background: none;
    }

    textarea {
        width: 100%;
        padding: 0.5rem;
        background: #333;
        border: 1px solid #444;
        color: white;
        border-radius: 4px;
        min-height: 80px;
        resize: vertical;
    }
    
    .property.checkbox {
        display: flex;
        align-items: center;
    }
    
    .property.checkbox input {
        width: auto;
        margin-right: 0.5rem;
    }
</style>
