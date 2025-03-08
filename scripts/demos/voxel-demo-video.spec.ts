import { test, expect } from "@playwright/test";

test("Record voxel demo video", async ({ page }) => {
  // Start recording
  await page.video()?.path();

  // Navigate to the voxel demo page
  await page.goto("http://localhost:5173/voxel-demo");

  // Wait for the page to load
  await page.waitForSelector(".start-screen", { state: "visible" });

  // Wait a moment to show the start screen
  await page.waitForTimeout(2000);

  // Click to start the demo
  await page.click(".start-screen");

  // Wait for the game to initialize
  await page.waitForTimeout(2000);

  // Move around and interact with the world
  // Move forward
  await page.keyboard.down("w");
  await page.waitForTimeout(2000);
  await page.keyboard.up("w");

  // Turn around
  await page.mouse.move(
    page.viewportSize()!.width / 2,
    page.viewportSize()!.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    page.viewportSize()!.width / 2 + 200,
    page.viewportSize()!.height / 2,
    { steps: 20 }
  );
  await page.mouse.up();
  await page.waitForTimeout(1000);

  // Jump
  await page.keyboard.press("Space");
  await page.waitForTimeout(1000);

  // Select different blocks
  for (let i = 1; i <= 5; i++) {
    await page.keyboard.press(`${i}`);
    await page.waitForTimeout(500);
  }

  // Toggle mode
  await page.keyboard.press("f");
  await page.waitForTimeout(1000);

  // Move around more
  await page.keyboard.down("a");
  await page.waitForTimeout(1000);
  await page.keyboard.up("a");

  await page.keyboard.down("s");
  await page.waitForTimeout(1000);
  await page.keyboard.up("s");

  await page.keyboard.down("d");
  await page.waitForTimeout(1000);
  await page.keyboard.up("d");

  // Press Escape to exit the game
  await page.keyboard.press("Escape");
  await page.waitForSelector(".start-screen", { state: "visible" });

  // Wait a moment to show the start screen again
  await page.waitForTimeout(2000);

  console.log("Video recorded successfully");

  // The video will be saved automatically when the test completes
});
