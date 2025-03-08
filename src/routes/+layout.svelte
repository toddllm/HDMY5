<script>
  import { onMount } from 'svelte';
  
  // Navigation links for demos
  const navLinks = [
    { href: '/', label: 'Game Builder' },
    { href: '/voxel-game', label: 'Voxel Game' },
    { href: '/voxel-demo', label: 'Voxel Demo' },
    { href: '/custom-voxel', label: 'Custom Voxel' },
    { href: '/test-page', label: 'Test Page' }
  ];
  
  let currentPath = '';
  
  onMount(() => {
    currentPath = window.location.pathname;
  });
</script>

<svelte:head>
  <title>HDMY5 Game Builder</title>
  <link rel="icon" href="/favicon.png" />
</svelte:head>

<nav class="main-nav">
  <div class="logo">
    <a href="/">HDMY5</a>
  </div>
  <ul class="nav-links">
    {#each navLinks as link}
      <li>
        <a 
          href={link.href} 
          class:active={link.href === currentPath}
        >
          {link.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<main>
  <slot />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #121212;
    color: #ffffff;
  }
  
  .main-nav {
    background-color: #1e1e1e;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 60px;
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  
  .logo a {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4CAF50;
    text-decoration: none;
  }
  
  .nav-links {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .nav-links li {
    margin: 0 10px;
  }
  
  .nav-links a {
    color: #ccc;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .nav-links a:hover {
    background-color: #333;
    color: white;
  }
  
  .nav-links a.active {
    background-color: #4CAF50;
    color: white;
  }
  
  main {
    padding: 0;
    width: 100%;
    min-height: calc(100vh - 60px);
  }
</style> 