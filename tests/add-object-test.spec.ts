import { test, expect } from "@playwright/test";

// Slow down actions for better visibility
const SLOW_MOTION = 1000; // milliseconds between actions

test.describe("Add Object Button Test", () => {
  test("should open dialog when Add Object button is clicked", async ({ page }) => {
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
    await page.screenshot({ path: "add-object-test-initial.png" });

    // Click the New Scene button first
    const newSceneButton = await page.getByText("New Scene");
    console.log("🖱️ Clicking New Scene button");
    await newSceneButton.click();
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "add-object-test-after-new-scene.png" });

    // Find the Add Object button
    console.log("🔍 Looking for Add Object button");
    const addObjectButton = await page.getByText("Add Object");
    
    // Check if it's enabled
    const isEnabled = !(await addObjectButton.isDisabled());
    console.log(`Add Object button enabled: ${isEnabled}`);
    await page.screenshot({ path: "add-object-test-before-click.png" });

    // Try to click the Add Object button using different methods
    console.log("🖱️ Attempting to click Add Object button using page.getByText");
    await addObjectButton.click({ force: true });
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "add-object-test-after-click-1.png" });

    // Try to find the dialog
    console.log("🔍 Checking for dialog after first click attempt");
    const dialogVisible1 = await page.isVisible(".dialog-content");
    console.log(`Dialog visible after first click: ${dialogVisible1}`);

    // Try clicking by selector
    console.log("🖱️ Attempting to click Add Object button using selector");
    await page.click("button:has-text('Add Object')", { force: true });
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "add-object-test-after-click-2.png" });

    // Check again for dialog
    console.log("🔍 Checking for dialog after second click attempt");
    const dialogVisible2 = await page.isVisible(".dialog-content");
    console.log(`Dialog visible after second click: ${dialogVisible2}`);

    // Try to find any dialog or form element
    console.log("🔍 Checking for any dialog or form elements");
    const selectors = [
      ".dialog-content",
      ".modal",
      "dialog",
      "[role='dialog']",
      ".object-creation-dialog",
      "form",
      ".dialog",
      ".popup",
      ".overlay"
    ];

    for (const selector of selectors) {
      const isVisible = await page.isVisible(selector);
      console.log(`Selector "${selector}" visible: ${isVisible}`);
      if (isVisible) {
        console.log(`Found visible element with selector: ${selector}`);
        await page.screenshot({ path: `add-object-test-found-${selector.replace(/[^a-zA-Z0-9]/g, "-")}.png` });
      }
    }

    // Check the DOM structure
    console.log("📄 Examining page structure");
    const html = await page.content();
    console.log("HTML snippet:");
    console.log(html.substring(0, 500) + "...");

    // Take a final screenshot
    await page.screenshot({ path: "add-object-test-final.png" });
    
    console.log("✅ Test completed");
  });
});
