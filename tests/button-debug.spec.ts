import { test, expect } from "@playwright/test";

// Add type declarations to fix linter errors
declare global {
  interface Window {
    _debugState: {
      showObjectDialogBefore: boolean | null;
      showObjectDialogAfter: boolean | null;
      clickTime: string | null;
      errors: string[];
    };
  }

  interface Element {
    __svelte?: {
      ctx: Record<string, any>;
    };
  }
}

test.describe("Button Debug Test", () => {
  test("should debug the Add Object button click event", async ({ page }) => {
    console.log("🚀 Starting debug test...");

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
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "add-object-test-after-new-scene.png" });

    // Find the Add Object button
    console.log("🔍 Looking for Add Object button");
    const addObjectButton = await page.getByText("Add Object");

    // Check if it's enabled
    const isEnabled = !(await addObjectButton.isDisabled());
    console.log(`Add Object button enabled: ${isEnabled}`);

    // Get button attributes and properties
    const buttonId = await addObjectButton.getAttribute("id");
    const buttonClass = await addObjectButton.getAttribute("class");
    const buttonType = await addObjectButton.getAttribute("type");

    console.log(`Button ID: ${buttonId || "None"}`);
    console.log(`Button Class: ${buttonClass || "None"}`);
    console.log(`Button Type: ${buttonType || "None"}`);

    await page.screenshot({ path: "add-object-test-before-click.png" });

    // Add console event listener to capture JavaScript errors
    page.on("console", (msg) => {
      console.log(`BROWSER CONSOLE: ${msg.type()}: ${msg.text()}`);
    });

    page.on("pageerror", (error) => {
      console.log(`BROWSER ERROR: ${error.message}`);
    });

    // Inject code to monitor the showObjectDialog variable
    await page.evaluate(() => {
      // Add a global variable to track dialog state
      window._debugState = {
        showObjectDialogBefore: null,
        showObjectDialogAfter: null,
        clickTime: null,
        errors: [],
      };

      // Override console.error to capture errors
      const originalConsoleError = console.error;
      console.error = function (...args) {
        window._debugState.errors.push(args.join(" "));
        return originalConsoleError.apply(this, args);
      };

      // Try to find the showObjectDialog variable in the Svelte component
      try {
        const components = Array.from(document.querySelectorAll("*")).filter(
          (el) =>
            el.__svelte &&
            el.__svelte.ctx &&
            "showObjectDialog" in el.__svelte.ctx
        );

        if (components.length > 0) {
          const component = components[0];
          // Add null check for __svelte
          if (component.__svelte && component.__svelte.ctx) {
            const ctx = component.__svelte.ctx;
            const showObjectDialogIndex =
              Object.keys(ctx).indexOf("showObjectDialog");

            if (showObjectDialogIndex >= 0) {
              window._debugState.showObjectDialogBefore = ctx.showObjectDialog;

              // Create a proxy to monitor changes to showObjectDialog
              const descriptor = Object.getOwnPropertyDescriptor(
                ctx,
                "showObjectDialog"
              );

              if (descriptor && descriptor.set) {
                const originalSet = descriptor.set;
                Object.defineProperty(ctx, "showObjectDialog", {
                  get: function () {
                    return ctx[showObjectDialogIndex];
                  },
                  set: function (value) {
                    console.log(`showObjectDialog changed to: ${value}`);
                    window._debugState.showObjectDialogAfter = value;
                    window._debugState.clickTime = new Date().toISOString();
                    // Use call with this as a function
                    originalSet.call(this as unknown as Function, value);
                  },
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error setting up debug hooks:", error);
      }
    });

    // Click the button
    console.log("🖱️ Clicking Add Object button");
    await addObjectButton.click({ force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "add-object-test-after-click.png" });

    // Get the debug state
    const debugState = await page.evaluate(() => window._debugState);
    console.log("Debug state:", debugState);

    // Check for any dialog or form element
    console.log("🔍 Checking for any dialog or form elements");
    const selectors = [
      ".dialog-overlay",
      ".dialog",
      ".dialog-content",
      ".modal",
      "dialog",
      "[role='dialog']",
      ".object-creation-dialog",
      "form",
      ".popup",
      ".overlay",
    ];

    for (const selector of selectors) {
      const isVisible = await page.isVisible(selector);
      console.log(`Selector "${selector}" visible: ${isVisible}`);
      if (isVisible) {
        console.log(`Found visible element with selector: ${selector}`);
        await page.screenshot({
          path: `add-object-test-found-${selector.replace(
            /[^a-zA-Z0-9]/g,
            "-"
          )}.png`,
        });
      }
    }

    // Try to force the dialog to appear
    await page.evaluate(() => {
      try {
        // Try to find the component and force the dialog to open
        const components = Array.from(document.querySelectorAll("*")).filter(
          (el) =>
            el.__svelte &&
            el.__svelte.ctx &&
            "showObjectDialog" in el.__svelte.ctx
        );

        if (components.length > 0) {
          const component = components[0];
          // Add null check for __svelte
          if (component.__svelte && component.__svelte.ctx) {
            component.__svelte.ctx.showObjectDialog = true;
            console.log("Forced showObjectDialog to true");
          }
        }
      } catch (error) {
        console.error("Error forcing dialog open:", error);
      }
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: "add-object-test-forced-dialog.png" });

    // Check again for dialog elements
    console.log("🔍 Checking for dialog elements after forcing");
    for (const selector of selectors) {
      const isVisible = await page.isVisible(selector);
      console.log(`Selector "${selector}" visible after forcing: ${isVisible}`);
    }

    // Take a final screenshot
    await page.screenshot({ path: "add-object-test-final.png" });

    console.log("✅ Debug test completed");
  });
});
