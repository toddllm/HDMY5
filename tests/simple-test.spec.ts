import { test, expect } from "@playwright/test";

test.describe("Simple Game Builder Tests", () => {
  test("should load the application", async ({ page }) => {
    console.log("Starting test: should load the application");

    // Navigate to the application
    await page.goto("http://localhost:5173/");
    console.log("Navigated to application");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });
    console.log("Editor layout is visible");

    // Verify that some key elements are present
    const editorExists = await page.isVisible(".editor-layout");
    expect(editorExists).toBeTruthy();
    console.log("Editor layout exists: " + editorExists);

    const toolsExist = await page.isVisible(".tools");
    expect(toolsExist).toBeTruthy();
    console.log("Tools exist: " + toolsExist);

    // Take a screenshot for verification
    await page.screenshot({ path: "app-loaded.png" });
    console.log("Screenshot saved as app-loaded.png");

    console.log("✅ Application loaded successfully!");
  });

  test("should find the Add Object button", async ({ page }) => {
    console.log("Starting test: should find the Add Object button");

    // Navigate to the application
    await page.goto("http://localhost:5173/");
    console.log("Navigated to application");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });
    console.log("Editor layout is visible");

    // Look for the Add Object button
    const addObjectButton = await page.getByText("Add Object");

    // Verify the button exists
    const buttonVisible = await addObjectButton.isVisible();
    expect(buttonVisible).toBeTruthy();
    console.log("Add Object button is visible: " + buttonVisible);

    // Take a screenshot showing the button
    await page.screenshot({ path: "add-object-button.png" });
    console.log("Screenshot saved as add-object-button.png");

    console.log("✅ Add Object button found successfully!");
  });
});
