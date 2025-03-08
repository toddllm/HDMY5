import { test, expect } from "@playwright/test";

// Slow down actions for better visibility
const SLOW_MOTION = 1000; // milliseconds between actions

test.describe("Add Object Direct DOM Test", () => {
  test("should try to open dialog using direct DOM manipulation", async ({
    page,
  }) => {
    console.log("🚀 Starting direct DOM test...");

    // Navigate to the application
    await page.goto("http://localhost:5173/");
    console.log("📱 Navigated to application");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });
    console.log("✅ Application loaded successfully");
    await page.screenshot({ path: "direct-test-initial.png" });

    // Click the New Scene button first
    const newSceneButton = await page.getByText("New Scene");
    console.log("🖱️ Clicking New Scene button");
    await newSceneButton.click();
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "direct-test-after-new-scene.png" });

    // Try to find all buttons on the page
    console.log("🔍 Finding all buttons on the page");
    const buttons = await page.$$("button");
    console.log(`Found ${buttons.length} buttons on the page`);

    // Take a screenshot of each button
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      console.log(`Button ${i}: ${text}`);

      // Highlight the button
      await button.evaluate((node) => {
        node.style.border = "3px solid red";
      });

      await page.screenshot({ path: `direct-test-button-${i}.png` });

      // Remove highlight
      await button.evaluate((node) => {
        node.style.border = "";
      });
    }

    // Try to find the Add Object button by text content
    console.log("🔍 Looking for Add Object button by text content");
    const addObjectButtons = await page.$$("button, [role='button']");
    let addObjectButton = null;

    for (const button of addObjectButtons) {
      const text = await button.textContent();
      if (text && text.includes("Add Object")) {
        addObjectButton = button;
        console.log("✅ Found Add Object button by text content");
        break;
      }
    }

    if (addObjectButton) {
      // Highlight the button
      await addObjectButton.evaluate((node) => {
        node.style.border = "3px solid green";
      });

      await page.screenshot({
        path: "direct-test-add-object-button-found.png",
      });

      // Try to click the button using JavaScript
      console.log("🖱️ Clicking Add Object button using JavaScript");
      await addObjectButton.evaluate((node) => {
        node.click();
      });

      await page.waitForTimeout(SLOW_MOTION);
      await page.screenshot({ path: "direct-test-after-js-click.png" });
    } else {
      console.log("❌ Could not find Add Object button by text content");
    }

    // Try to find the button by querying the DOM directly
    console.log("🔍 Trying to find Add Object button by querying DOM");
    const buttonExists = await page.evaluate(() => {
      const buttons = Array.from(
        document.querySelectorAll("button, [role='button']")
      );
      const addObjectButton = buttons.find(
        (button) =>
          button.textContent && button.textContent.includes("Add Object")
      );

      if (addObjectButton) {
        // Highlight the button
        addObjectButton.style.border = "3px solid blue";
        return true;
      }

      return false;
    });

    await page.screenshot({ path: "direct-test-dom-query.png" });

    if (buttonExists) {
      console.log("✅ Found Add Object button by DOM query");

      // Try to click it using evaluate
      console.log("🖱️ Clicking Add Object button using DOM query");
      await page.evaluate(() => {
        const buttons = Array.from(
          document.querySelectorAll("button, [role='button']")
        );
        const addObjectButton = buttons.find(
          (button) =>
            button.textContent && button.textContent.includes("Add Object")
        );

        if (addObjectButton) {
          addObjectButton.click();
        }
      });

      await page.waitForTimeout(SLOW_MOTION);
      await page.screenshot({ path: "direct-test-after-dom-click.png" });
    } else {
      console.log("❌ Could not find Add Object button by DOM query");
    }

    // Check if any dialog is visible
    console.log("🔍 Checking for any dialog elements");
    const selectors = [
      ".dialog-content",
      ".modal",
      "dialog",
      "[role='dialog']",
      ".object-creation-dialog",
      "form",
      ".dialog",
      ".popup",
      ".overlay",
    ];

    for (const selector of selectors) {
      const isVisible = await page.isVisible(selector);
      console.log(`Selector "${selector}" visible: ${isVisible}`);
      if (isVisible) {
        console.log(`Found visible element with selector: ${selector}`);
        await page.screenshot({
          path: `direct-test-found-${selector.replace(
            /[^a-zA-Z0-9]/g,
            "-"
          )}.png`,
        });
      }
    }

    // Take a final screenshot
    await page.screenshot({ path: "direct-test-final.png" });

    console.log("✅ Direct DOM test completed");
  });
});
