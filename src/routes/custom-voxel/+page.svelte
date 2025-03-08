<script lang="ts">
    import CustomVoxelElement from '$lib/components/voxel/CustomVoxelElement.svelte';
    import SimpleVoxelTest from '$lib/components/voxel/SimpleVoxelTest.svelte';
    import VoxelGameCanvas from '$lib/components/voxel/VoxelGameCanvas.svelte';
    import { onMount, onDestroy } from 'svelte';
    import { startStateCapture, detectComponentIssues } from '$lib/utils/debugHelper';
    
    // Flag to use the image-based component by default - FORCE TO FALSE
    let useSimpleTest = false;
    
    // Debugging functions cleanup
    let stopStateCapture: (() => void) | null = null;
    let stopIssueDetection: (() => void) | null = null;
    
    // Debugging info
    let debugInfo = {
        componentType: 'Loading...',
        timestamp: new Date().toISOString(),
        screenWidth: 0,
        screenHeight: 0,
        userAgent: ''
    };
    
    onMount(() => {
        if (typeof window !== 'undefined') {
            // Force component to image-based on load
            useSimpleTest = false;
            
            debugInfo = {
                componentType: useSimpleTest ? 'Simple Test' : 'Image-based Component',
                timestamp: new Date().toISOString(),
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                userAgent: navigator.userAgent
            };
            
            console.log('Debug Info:', debugInfo);
            console.log('%c IMPORTANT: Using Image-based Component by default', 'background: green; color: white; padding: 4px;');
            
            // Start state capture
            stopStateCapture = startStateCapture(3000);
            const issueDetection = detectComponentIssues();
            if (issueDetection) stopIssueDetection = issueDetection;
            
            // Re-log after a short delay to ensure components have mounted
            setTimeout(() => {
                console.log(`%c VERIFICATION: Current component is ${useSimpleTest ? 'Simple Test' : 'Image-based'} component`, 'background: blue; color: white; padding: 4px;');
            }, 2000);
        }
    });
    
    onDestroy(() => {
        // Clean up state capture
        if (stopStateCapture) stopStateCapture();
        if (stopIssueDetection) stopIssueDetection();
    });
    
    // Handler for button click - with force update
    function toggleComponent() {
        useSimpleTest = !useSimpleTest;
        
        if (typeof window !== 'undefined') {
            debugInfo.componentType = useSimpleTest ? 'Simple Test' : 'Image-based Component';
            debugInfo.timestamp = new Date().toISOString();
            
            console.log(`%c COMPONENT SWITCHED TO: ${debugInfo.componentType}`, 'background: orange; color: black; padding: 4px;');
            
            // Force DOM update by triggering a reflow
            setTimeout(() => {
                document.body.style.zoom = '99.99%';
                setTimeout(() => {
                    document.body.style.zoom = '100%';
                }, 10);
            }, 20);
        }
    }
</script>

<div class="container">
    <h1>Custom Voxel Element</h1>
    <p>This element was generated based on image analysis on 2025-03-08 at 17:20:53</p>
    
    <div class="controls">
        <button on:click={toggleComponent}>
            {useSimpleTest ? 'Show Image-based Scene' : 'Use Simple Component'}
        </button>
        <p>Currently using: <strong>{useSimpleTest ? 'Simple Test' : 'Image-based'}</strong> component</p>
    </div>
    
    <div class="debug-info">
        <p>Debug: {debugInfo.componentType} | {debugInfo.timestamp.split('T')[1].substring(0, 8)}</p>
        <button class="debug-button" on:click={() => { useSimpleTest = false; toggleComponent(); }}>
            FORCE IMAGE-BASED
        </button>
        <button class="debug-button" on:click={() => { window.location.reload(); }}>
            RELOAD PAGE
        </button>
    </div>
    
    <div class="game-container">
        <VoxelGameCanvas />
        
        <!-- Always render SimpleVoxelTest but hide it when not active -->
        <div style="display: {useSimpleTest ? 'block' : 'none'}">
            <SimpleVoxelTest />
        </div>
        
        <!-- Always render CustomVoxelElement but hide it when not active -->
        <div style="display: {!useSimpleTest ? 'block' : 'none'}">
            <CustomVoxelElement />
        </div>
    </div>
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
        margin-bottom: 0.5rem;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-align: center;
    }
    
    .debug-info {
        background-color: rgba(255, 255, 0, 0.2);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        font-family: monospace;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .debug-button {
        background-color: #ff4500;
        font-size: 12px;
        padding: 4px 8px;
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
