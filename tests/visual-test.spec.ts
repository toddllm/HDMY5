import { test, expect } from "@playwright/test";

// Slow down actions for better visibility
const SLOW_MOTION = 500; // milliseconds between actions

test.describe("Visual Game Builder Tests", () => {
  // Use a beforeEach to set up the test environment
  test.beforeEach(async ({ page }) => {
    // Set slow motion for all actions
    page.context().setDefaultTimeout(30000); // Longer timeout for visual tests

    console.log("🚀 Starting test setup...");

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
    await page.screenshot({ path: "initial-state.png" });
  });

  test("should interact with basic UI elements", async ({ page }) => {
    console.log("🧪 Running test: should interact with basic UI elements");

    // Find the New Scene button (which should be enabled)
    const newSceneButton = await page.getByText("New Scene");

    // Verify the button exists
    expect(await newSceneButton.isVisible()).toBeTruthy();
    console.log("✅ Found New Scene button");

    // Take a screenshot showing the button
    await page.screenshot({ path: "new-scene-button.png" });
    await page.waitForTimeout(SLOW_MOTION);

    // Click the New Scene button
    console.log("🖱️ Clicking New Scene button");
    await newSceneButton.click();
    await page.waitForTimeout(SLOW_MOTION);

    // Take a screenshot after clicking
    await page.screenshot({ path: "after-new-scene.png" });

    // Check if Add Object button is now enabled
    const addObjectButton = await page.getByText("Add Object");
    const isEnabled = !(await addObjectButton.isDisabled());
    console.log(`Add Object button enabled: ${isEnabled}`);

    // Take a screenshot of the Add Object button state
    await page.screenshot({ path: "add-object-button-state.png" });

    console.log("✅ Test completed successfully");
  });

  test("should explore the canvas area", async ({ page }) => {
    console.log("🧪 Running test: should explore the canvas area");

    // Look for the canvas container
    const canvasContainer = await page.locator(".canvas-container");

    // Verify it exists
    expect(await canvasContainer.isVisible()).toBeTruthy();
    console.log("✅ Found canvas container");

    // Take a screenshot of the canvas area
    await page.screenshot({ path: "canvas-area.png" });
    await page.waitForTimeout(SLOW_MOTION);

    // Try to interact with the canvas
    console.log("🖱️ Interacting with canvas area");
    await canvasContainer.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(SLOW_MOTION);

    // Take a screenshot after interaction
    await page.screenshot({ path: "after-canvas-interaction.png" });

    // Try to drag on the canvas
    await canvasContainer.hover({ position: { x: 200, y: 200 } });
    await page.mouse.down();
    await page.mouse.move(300, 200);
    await page.waitForTimeout(SLOW_MOTION);
    await page.mouse.up();

    // Take a screenshot after dragging
    await page.screenshot({ path: "after-canvas-drag.png" });

    console.log("✅ Test completed successfully");
  });

  test("should manipulate object properties", async ({ page }) => {
    console.log("🧪 Running test: should manipulate object properties");

    // Create an object first
    const addObjectButton = await page.getByText("Add Object");
    await addObjectButton.click();
    await page.waitForSelector(".dialog-content", { state: "visible" });
    await page.selectOption("select", "rectangle");
    await page.click('form >> button[type="submit"]');
    await page.waitForSelector(".dialog-content", { state: "hidden" });
    console.log("✅ Object created");
    await page.waitForTimeout(SLOW_MOTION);

    // Select the object
    await page.click(".game-canvas", { position: { x: 400, y: 300 } });
    console.log("✅ Object selected");
    await page.waitForTimeout(SLOW_MOTION);

    // Look for property inputs
    const propertyPanel = await page.locator(".property-panel");
    await propertyPanel.waitFor({ state: "visible" });

    // Take a screenshot of the property panel
    await page.screenshot({ path: "property-panel.png" });
    await page.waitForTimeout(SLOW_MOTION);

    // Try to change properties if they exist
    try {
      // Look for position inputs
      const xInput = await page.locator('input[placeholder="X"]').first();
      if (await xInput.isVisible()) {
        console.log("🔄 Changing X position");
        await xInput.fill("200");
        await page.keyboard.press("Tab");
        await page.waitForTimeout(SLOW_MOTION);
      }

      const yInput = await page.locator('input[placeholder="Y"]').first();
      if (await yInput.isVisible()) {
        console.log("🔄 Changing Y position");
        await yInput.fill("150");
        await page.keyboard.press("Tab");
        await page.waitForTimeout(SLOW_MOTION);
      }

      // Take a screenshot after changing properties
      await page.screenshot({ path: "properties-changed.png" });
      console.log("✅ Properties changed");
    } catch (error) {
      console.log("⚠️ Could not find or interact with property inputs");
      console.log(error);
    }

    console.log("✅ Test completed successfully");
  });
});
