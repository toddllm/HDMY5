<script lang="ts">
    // No imports or complex code
    let message = "This is a simple test page";
</script>

<div class="container">
    <h1>Test Page</h1>
    <p>{message}</p>
    <a href="/custom-voxel">Go to Custom Voxel Page</a>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #333;
        color: white;
    }
    
    h1 {
        margin-bottom: 1rem;
    }
    
    a {
        color: #4CAF50;
        margin-top: 1rem;
        text-decoration: none;
        padding: 0.5rem 1rem;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
    }
</style> 