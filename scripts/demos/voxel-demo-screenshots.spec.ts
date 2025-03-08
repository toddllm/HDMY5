import { test, expect } from "@playwright/test";

test("Capture voxel demo screenshots", async ({ page }) => {
  // Navigate to the voxel demo page
  await page.goto("http://localhost:5173/voxel-demo");

  // Wait for the page to load
  await page.waitForSelector(".start-screen", { state: "visible" });

  // Take a screenshot of the start screen
  await page.screenshot({ path: "voxel-demo-start-screen.png" });

  // Click to start the demo
  await page.click(".start-screen");

  // Wait for the game to initialize
  await page.waitForTimeout(2000);

  // Take a screenshot of the initial game view
  await page.screenshot({ path: "voxel-demo-initial-view.png" });

  // Press W to move forward
  await page.keyboard.down("w");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "voxel-demo-moving-forward.png" });
  await page.keyboard.up("w");

  // Press Space to jump
  await page.keyboard.press("Space");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "voxel-demo-jumping.png" });

  // Press 2 to select grass blocks
  await page.keyboard.press("2");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "voxel-demo-select-grass.png" });

  // Press F to toggle mode
  await page.keyboard.press("f");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "voxel-demo-place-mode.png" });

  // Take a screenshot of the hotbar
  await page.screenshot({
    path: "voxel-demo-hotbar.png",
    clip: {
      x: 0,
      y: page.viewportSize()!.height - 100,
      width: page.viewportSize()!.width,
      height: 100,
    },
  });

  // Press Escape to exit the game
  await page.keyboard.press("Escape");
  await page.waitForSelector(".start-screen", { state: "visible" });

  console.log("Screenshots captured successfully");
});
