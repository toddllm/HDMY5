/**
 * Debug Helper Utility
 * Helps track component state and troubleshoot rendering issues
 */

// Function to capture and log the current state of the DOM
export function startStateCapture(intervalMs = 5000): (() => void) | null {
  if (typeof window === "undefined") return null;

  console.log("Starting state capture utility...");

  const captureState = () => {
    try {
      // Check which component indicators are present
      const imageBasedIndicator = document.querySelector(
        ".component-indicator p"
      );
      const simpleTestIndicator = document.querySelector(
        ".component-indicator p"
      );

      const imageBasedVisible =
        imageBasedIndicator?.textContent?.includes("IMAGE-BASED") || false;
      const simpleTestVisible =
        simpleTestIndicator?.textContent?.includes("SIMPLE TEST") || false;

      // Get the button text
      const buttonText = document
        .querySelector(".controls button")
        ?.textContent?.trim();

      // Check visibility state
      const state = {
        timestamp: new Date().toISOString(),
        imageBasedVisible: imageBasedVisible,
        simpleTestVisible: simpleTestVisible,
        buttonText: buttonText || "Not found",
        url: window.location.href,
        screenDimensions: `${window.innerWidth}x${window.innerHeight}`,
      };

      console.log("DEBUG STATE CAPTURE:", state);

      // Check for potential issues
      if (!imageBasedVisible && !simpleTestVisible) {
        console.warn("WARNING: No component indicators found in the DOM");
      }
      if (imageBasedVisible && simpleTestVisible) {
        console.warn(
          "WARNING: Both component indicators found - this should not happen"
        );
      }
    } catch (err) {
      console.error("Error in state capture:", err);
    }
  };

  // Capture state immediately
  captureState();

  // Set interval to capture state periodically
  const intervalId = setInterval(captureState, intervalMs);

  // Return function to stop capturing
  return () => {
    clearInterval(intervalId);
    console.log("State capture stopped");
  };
}

// Function to detect issues with component visibility
export function detectComponentIssues(): (() => void) | null {
  if (typeof window === "undefined") return null;

  console.log("Running component issue detection...");

  // Check for visibility issues using MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" || mutation.type === "attributes") {
        const imageBasedIndicator = document.querySelector(
          ".component-indicator p"
        );
        const simpleTestIndicator = document.querySelector(
          ".component-indicator p"
        );

        const imageBasedActive =
          imageBasedIndicator?.textContent?.includes("IMAGE-BASED") || false;
        const simpleTestActive =
          simpleTestIndicator?.textContent?.includes("SIMPLE TEST") || false;

        if (imageBasedActive && simpleTestActive) {
          console.error(
            "CRITICAL: Both components are showing as active simultaneously!"
          );
        }

        if (!imageBasedActive && !simpleTestActive) {
          console.warn("WARNING: No component indicators detected in the DOM");
        }
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true,
  });

  // Return disconnect function
  return () => {
    observer.disconnect();
    console.log("Component issue detection stopped");
  };
}
