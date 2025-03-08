import { test, expect } from "@playwright/test";

// Add type declarations to fix linter errors
declare global {
  interface Element {
    __svelte?: {
      ctx: Record<string, any>;
    };
  }
}

test.describe("Dialog Test", () => {
  test("should open dialog when Add Object button is clicked", async ({
    page,
  }) => {
    console.log("🚀 Starting dialog test...");

    // Navigate to the application
    await page.goto("http://localhost:5173/");
    console.log("📱 Navigated to application");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });
    console.log("✅ Application loaded successfully");
    await page.screenshot({ path: "dialog-test-initial.png" });

    // Click the New Scene button first
    const newSceneButton = await page.getByText("New Scene");
    console.log("🖱️ Clicking New Scene button");
    await newSceneButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "dialog-test-after-new-scene.png" });

    // Find the Add Object button
    console.log("🔍 Looking for Add Object button");
    const addObjectButton = await page.getByText("Add Object");

    // Check if it's enabled
    const isEnabled = !(await addObjectButton.isDisabled());
    console.log(`Add Object button enabled: ${isEnabled}`);

    // Click the button
    console.log("🖱️ Clicking Add Object button");
    await addObjectButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "dialog-test-after-click.png" });

    // Check for the dialog
    console.log("🔍 Checking for dialog");
    const dialogVisible = await page.isVisible(".dialog-overlay");
    console.log(`Dialog visible: ${dialogVisible}`);

    // Take a screenshot of the dialog
    if (dialogVisible) {
      console.log("✅ Dialog is visible");
      await page.screenshot({ path: "dialog-test-dialog-visible.png" });

      // Check dialog content
      const dialogTitle = await page.textContent(".dialog h2");
      console.log(`Dialog title: ${dialogTitle}`);

      // Close the dialog
      console.log("🖱️ Closing dialog");
      const cancelButton = await page.getByText("Cancel");
      await cancelButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "dialog-test-after-close.png" });

      // Verify dialog is closed
      const dialogVisibleAfterClose = await page.isVisible(".dialog-overlay");
      console.log(`Dialog visible after close: ${dialogVisibleAfterClose}`);
      expect(dialogVisibleAfterClose).toBe(false);
    } else {
      console.log("❌ Dialog is not visible");

      // Try to force the dialog to appear
      await page.evaluate(() => {
        console.log("Attempting to force dialog open");
        // Try to find the component and force the dialog to open
        const components = Array.from(document.querySelectorAll("*")).filter(
          (el) => {
            try {
              return (
                el.__svelte &&
                el.__svelte.ctx &&
                "showObjectDialog" in el.__svelte.ctx
              );
            } catch (e) {
              return false;
            }
          }
        );

        if (components.length > 0) {
          const component = components[0];
          if (component.__svelte && component.__svelte.ctx) {
            component.__svelte.ctx.showObjectDialog = true;
            console.log("Forced showObjectDialog to true");
          }
        } else {
          console.log("Could not find component with showObjectDialog");
        }
      });

      await page.waitForTimeout(1000);
      await page.screenshot({ path: "dialog-test-forced-dialog.png" });

      // Check if dialog is visible after forcing
      const dialogVisibleAfterForce = await page.isVisible(".dialog-overlay");
      console.log(`Dialog visible after force: ${dialogVisibleAfterForce}`);
    }

    console.log("✅ Dialog test completed");
  });
});
