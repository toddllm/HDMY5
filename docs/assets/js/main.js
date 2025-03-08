// Main JavaScript for the HDMY5 Game Builder Demo Page

document.addEventListener("DOMContentLoaded", function () {
  console.log("HDMY5 Game Builder Demo Page Loaded");

  // Add a smooth scrolling effect for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for header
          behavior: "smooth",
        });
      }
    });
  });

  // Simulate loading demos
  simulateDemoLoading();
});

function simulateDemoLoading() {
  const gameDemoPlaceholder = document.querySelector(
    "#game-demo .demo-placeholder"
  );
  const voxelDemoPlaceholder = document.querySelector(
    "#voxel-demo .demo-placeholder"
  );

  // Update the game demo placeholder after a delay
  setTimeout(() => {
    if (gameDemoPlaceholder) {
      gameDemoPlaceholder.innerHTML = `
                <p>Game Builder Demo</p>
                <p class="note">Demo will be available soon. Check back later!</p>
                <p class="note">In the meantime, you can explore our <a href="https://github.com/toddllm/HDMY5" target="_blank">GitHub repository</a>.</p>
            `;
    }
  }, 2000);

  // Update the voxel demo placeholder after a delay
  setTimeout(() => {
    if (voxelDemoPlaceholder) {
      voxelDemoPlaceholder.innerHTML = `
                <p>Voxel Demo</p>
                <p class="note">Demo will be available soon. Check back later!</p>
                <p class="note">In the meantime, you can explore our <a href="https://github.com/toddllm/HDMY5" target="_blank">GitHub repository</a>.</p>
            `;
    }
  }, 3000);
}

// Add responsive navigation toggle for mobile
document.addEventListener("DOMContentLoaded", function () {
  // This is a placeholder for future mobile navigation implementation
  console.log("Mobile navigation will be implemented here");
});
