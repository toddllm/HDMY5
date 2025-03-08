import { test, expect } from "@playwright/test";

// Slow down actions for better visibility
const SLOW_MOTION = 500; // milliseconds between actions

test.describe("Voxel Engine Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set slow motion for all actions
    page.context().setDefaultTimeout(30000); // Longer timeout for visual tests

    console.log("🚀 Starting voxel engine test setup...");

    // Navigate to the application
    await page.goto("http://localhost:5173/");
    console.log("📱 Navigated to application");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });
    console.log("✅ Application loaded successfully");

    // Take a screenshot of the initial state
    await page.screenshot({ path: "voxel-initial-state.png" });
  });

  test("should explore the scene hierarchy", async ({ page }) => {
    console.log("🧪 Running test: should explore the scene hierarchy");

    // Look for the scene hierarchy
    const sceneHierarchy = await page.locator(".scene-hierarchy");

    // Verify it exists
    expect(await sceneHierarchy.isVisible()).toBeTruthy();
    console.log("✅ Found scene hierarchy");

    // Take a screenshot of the scene hierarchy
    await page.screenshot({ path: "scene-hierarchy.png" });

    // Create a new scene to work with
    const newSceneButton = await page.getByText("New Scene");
    await newSceneButton.click();
    console.log("✅ Created new scene");
    await page.waitForTimeout(SLOW_MOTION);

    // Take a screenshot after creating a new scene
    await page.screenshot({ path: "voxel-new-scene.png" });

    // Look for scene items
    const sceneItems = await page.locator(".scene-item");
    const count = await sceneItems.count();
    console.log(`Found ${count} scene items`);

    // Take a screenshot of the scene items
    await page.screenshot({ path: "scene-items.png" });

    console.log("✅ Scene hierarchy test completed");
  });

  test("should explore the tools panel", async ({ page }) => {
    console.log("🧪 Running test: should explore the tools panel");

    // Look for the tools panel
    const toolsPanel = await page.locator(".tools");

    // Verify it exists
    expect(await toolsPanel.isVisible()).toBeTruthy();
    console.log("✅ Found tools panel");

    // Take a screenshot of the tools panel
    await page.screenshot({ path: "tools-panel.png" });

    // Look for buttons in the tools panel
    const buttons = await toolsPanel.locator("button");
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons in tools panel`);

    // Try to interact with the first button if it exists
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const buttonText = await firstButton.textContent();
      console.log(`Clicking button: ${buttonText}`);

      // Take a screenshot before clicking
      await page.screenshot({ path: "before-tool-click.png" });

      // Click the button
      await firstButton.click();
      await page.waitForTimeout(SLOW_MOTION);

      // Take a screenshot after clicking
      await page.screenshot({ path: "after-tool-click.png" });
    }

    console.log("✅ Tools panel test completed");
  });
});
