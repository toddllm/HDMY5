import { test, expect } from "@playwright/test";

// Slow down actions for better visibility
const SLOW_MOTION = 500; // milliseconds between actions

test.describe("Visual Game Builder Tests - Debug", () => {
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
    await page.screenshot({ path: "debug-initial-state.png" });
  });

  test("should debug object creation dialog", async ({ page }) => {
    console.log("🧪 Running test: should debug object creation dialog");

    // Find the New Scene button (which should be enabled)
    const newSceneButton = await page.getByText("New Scene");

    // Verify the button exists
    expect(await newSceneButton.isVisible()).toBeTruthy();
    console.log("✅ Found New Scene button");

    // Click the New Scene button
    console.log("🖱️ Clicking New Scene button");
    await newSceneButton.click();
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "debug-after-new-scene.png" });

    // Check if Add Object button is now enabled
    const addObjectButton = await page.getByText("Add Object");
    const isEnabled = !(await addObjectButton.isDisabled());
    console.log(`Add Object button enabled: ${isEnabled}`);
    await page.screenshot({ path: "debug-add-object-button.png" });

    // Try to click the Add Object button
    console.log("🖱️ Attempting to click Add Object button");
    await addObjectButton.click();
    console.log("✅ Add Object button clicked");
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "debug-after-add-object-click.png" });

    // Check if dialog appears
    console.log("🔍 Checking for dialog-content element");
    const dialogVisible = await page.isVisible(".dialog-content");
    console.log(`Dialog visible: ${dialogVisible}`);

    // Check for any dialog or modal that might be present
    console.log("🔍 Checking for any dialog or modal elements");
    const anyDialogVisible = await page.isVisible(
      "dialog, .modal, [role='dialog']"
    );
    console.log(`Any dialog visible: ${anyDialogVisible}`);

    // Take a screenshot of the page HTML for debugging
    const html = await page.content();
    console.log("📄 Page HTML snippet:");
    console.log(html.substring(0, 500) + "...");

    // Try to find the dialog using different selectors
    const dialogSelectors = [
      ".dialog-content",
      ".modal",
      "dialog",
      "[role='dialog']",
      ".object-creation-dialog",
      "form",
    ];

    for (const selector of dialogSelectors) {
      const isVisible = await page.isVisible(selector);
      console.log(`Selector "${selector}" visible: ${isVisible}`);
      if (isVisible) {
        console.log(`Found visible element with selector: ${selector}`);
        await page.screenshot({
          path: `debug-found-${selector.replace(/[^a-zA-Z0-9]/g, "-")}.png`,
        });
      }
    }

    // Take a final screenshot
    await page.screenshot({ path: "debug-final-state.png" });

    console.log("✅ Debug test completed");
  });
});
