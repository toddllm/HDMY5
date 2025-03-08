import { test, expect } from "@playwright/test";

// Slow down actions for better visibility
const SLOW_MOTION = 500; // milliseconds between actions

test.describe("Visual Tests", () => {
  test("should load the application", async ({ page }) => {
    // Navigate to the application
    await page.goto("http://localhost:5173/");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });

    // Take a screenshot
    await page.screenshot({ path: "initial-state.png" });

    // Verify the application loaded correctly
    const title = await page.textContent("h1");
    expect(title).toBe("HDMY5 Game Builder");
  });

  test("should create a new scene and add an object", async ({ page }) => {
    // Navigate to the application
    await page.goto("http://localhost:5173/");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });

    // Click the New Scene button
    const newSceneButton = await page.getByText("New Scene");
    await newSceneButton.click();

    // Wait for the scene to be created
    await page.waitForTimeout(1000);

    // Take a screenshot of the new scene
    await page.screenshot({ path: "new-scene.png" });

    // Check if Add Object button is now enabled
    const addObjectButton = await page.getByText("Add Object");
    const isEnabled = !(await addObjectButton.isDisabled());
    console.log(`Add Object button enabled: ${isEnabled}`);

    // Take a screenshot of the Add Object button state
    await page.screenshot({ path: "add-object-button.png" });

    // Click the Add Object button
    await addObjectButton.click();

    // Wait for the dialog to appear
    await page.waitForSelector(".dialog-overlay", {
      state: "visible",
      timeout: 5000,
    });

    // Take a screenshot of the dialog
    await page.screenshot({ path: "object-dialog.png" });

    // Fill in the form
    await page.selectOption("#shape", "rectangle");
    await page.fill("#object-width", "100");
    await page.fill("#object-height", "100");

    // Click the Create button
    await page.click("button[type='submit']");

    // Wait for the dialog to close and object to be created
    await page.waitForSelector(".dialog-overlay", {
      state: "hidden",
      timeout: 5000,
    });
    await page.waitForTimeout(1000);

    // Take a screenshot of the created object
    await page.screenshot({ path: "object-created.png" });

    // Verify the object was created
    const objectItem = await page.textContent(".object-item");
    expect(objectItem).toContain("rectangle");
  });

  test("should drag the canvas", async ({ page }) => {
    // Navigate to the application
    await page.goto("http://localhost:5173/");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });

    // Click the New Scene button if no scene exists
    const newSceneButton = await page.getByText("New Scene");
    await newSceneButton.click();

    // Wait for the scene to be created
    await page.waitForTimeout(1000);

    // Add an object to the scene
    const addObjectButton = await page.getByText("Add Object");
    await addObjectButton.click();

    // Wait for the dialog to appear
    await page.waitForSelector(".dialog-overlay", {
      state: "visible",
      timeout: 5000,
    });

    // Fill in the form
    await page.selectOption("#shape", "rectangle");
    await page.fill("#object-width", "100");
    await page.fill("#object-height", "100");

    // Click the Create button
    await page.click("button[type='submit']");

    // Wait for the dialog to close and object to be created
    await page.waitForSelector(".dialog-overlay", {
      state: "hidden",
      timeout: 5000,
    });
    await page.waitForTimeout(1000);

    // Take a screenshot before dragging
    await page.screenshot({ path: "before-canvas-drag.png" });

    // Drag the canvas
    const canvas = await page.locator(".canvas-container");
    const canvasBounds = await canvas.boundingBox();

    if (canvasBounds) {
      const startX = canvasBounds.x + canvasBounds.width / 2;
      const startY = canvasBounds.y + canvasBounds.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 100, startY + 100, { steps: 10 });
      await page.mouse.up();

      // Wait for the drag to complete
      await page.waitForTimeout(1000);

      // Take a screenshot after dragging
      await page.screenshot({ path: "after-canvas-drag.png" });
    }
  });
});
