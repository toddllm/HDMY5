import { test, expect } from '@playwright/test';

test.setTimeout(60000); // Set global timeout to 60 seconds

async function waitForAppReady(page: any) {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            await page.goto('http://localhost:5173/');
            
            // Wait for core UI elements
            await Promise.all([
                page.waitForSelector('.scene-item', { timeout: 5000 }),
                page.waitForSelector('button:has-text("Add Object")', { timeout: 5000 }),
                page.waitForSelector('.game-canvas', { timeout: 5000 }),
                page.waitForLoadState('networkidle')
            ]);
            return;
        } catch (e: any) {
            console.log(`Attempt ${i + 1} failed, retrying...`);
            console.log('Error:', e.message);
            await page.screenshot({ path: `debug-${i}.png` });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    throw new Error('Failed to connect to dev server after multiple attempts');
}

test.describe('Game Builder', () => {
    test.beforeEach(async ({ page }) => {
        await waitForAppReady(page);
    });

    // Update object creation helper
    async function createTestObject(page: any, name = 'Test Object') {
        await page.click('button:has-text("Add Object")');
        await page.waitForSelector('.dialog-content', { state: 'visible' });
        await page.selectOption('#shape', 'rectangle');
        await page.click('form >> button[type="submit"]');
        await page.waitForSelector('.dialog-content', { state: 'hidden' });
        await page.waitForSelector('.object-item');
    }

    // Update object selection helper
    async function selectObject(page: any, x = 400, y = 300) {
        await page.click('.game-canvas', { position: { x, y } });
        await page.waitForSelector('#object-name', { state: 'visible' });
        // Wait for any animations/transitions
        await page.waitForTimeout(100);
    }

    test('should create a new scene', async ({ page }) => {
        // Check initial state
        await expect(page.locator('.scenes-list')).toBeVisible();
        
        // Should have at least one scene
        await expect(page.locator('.scene-item')).toBeVisible();
        
        // Create new scene
        await page.click('button:has-text("New Scene")');
        
        // Should have multiple scenes
        const scenes = await page.locator('.scene-item').count();
        expect(scenes).toBeGreaterThan(1);
    });

    test('should create and select 2D objects', async ({ page }) => {
        // Open dialog and wait for it to be fully interactive
        await page.click('button:has-text("Add Object")');
        await page.waitForTimeout(1000);
        await page.waitForSelector('.dialog-content', { state: 'visible', timeout: 30000 });

        // Take a screenshot to see what's happening
        await page.screenshot({ path: 'dialog-debug.png', fullPage: true });

        try {
            // Fill out form with explicit waits
            await page.selectOption('#shape', 'rectangle');
            await page.fill('#width', '100');
            await page.fill('#height', '100');
            await page.fill('#color', '#ff0000');

            // Verify form values were set
            await expect(page.locator('#width')).toHaveValue('100');
            await expect(page.locator('#height')).toHaveValue('100');

            // Try clicking the button directly by text
            await page.click('button:has-text("Create")');
            
            // Add success logging
            console.log('Create button clicked successfully');
            
        } catch (e: any) {
            console.log('Test failure details:');
            console.log('Current URL:', page.url());
            await page.screenshot({ path: 'form-error.png', fullPage: true });
            throw e;
        }
        
        // Verify object creation
        await page.waitForSelector('.dialog-content', { state: 'hidden', timeout: 30000 });
        await page.waitForSelector('.object-item', { timeout: 30000 });
    });

    test('should drag and drop objects', async ({ page }) => {
        // Create and wait for object
        await page.click('button:has-text("Add Object")');
        await page.waitForSelector('.dialog-content', { state: 'visible' });
        await page.selectOption('#shape', 'rectangle');
        await page.click('button:has-text("Create")');
        
        // Wait for object and select it
        await page.waitForSelector('.object-item');
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        
        // Wait for position inputs to be available
        await page.waitForSelector('#pos-x');
        await page.waitForSelector('#pos-y');
        
        const initialX = await page.inputValue('#pos-x');
        const initialY = await page.inputValue('#pos-y');
        
        // Drag with smaller movement
        await page.mouse.move(400, 300);
        await page.mouse.down();
        await page.mouse.move(450, 350, { steps: 5 });
        await page.mouse.up();
        
        // Wait for position update
        await page.waitForTimeout(100);
        
        const newX = await page.inputValue('#pos-x');
        const newY = await page.inputValue('#pos-y');
        expect(Number(newX)).toBeGreaterThan(Number(initialX));
        expect(Number(newY)).toBeGreaterThan(Number(initialY));
    });

    test('should update object properties', async ({ page }) => {
        // Create and select an object
        await page.click('button:has-text("Add Object")');
        await page.waitForSelector('.dialog-content', { state: 'visible' });
        await page.selectOption('#shape', 'rectangle');
        await page.click('button:has-text("Create")');
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        
        // Modify properties
        await page.fill('#object-width', '200');
        await page.fill('#object-height', '150');
        
        // Verify changes persist after deselecting
        await page.click('.game-canvas', { position: { x: 10, y: 10 } }); // Click empty space
        await page.click('.game-canvas', { position: { x: 400, y: 300 } }); // Select again
        await expect(page.locator('#object-width')).toHaveValue('200');
        await expect(page.locator('#object-height')).toHaveValue('150');
    });

    test('should show/hide property panel based on selection', async ({ page }) => {
        await page.goto('http://localhost:5173/');
        
        // Initially should show scene properties
        await expect(page.locator('#scene-name')).toBeVisible();
        
        // Create an object
        await page.click('button:has-text("Add Object")');
        await page.waitForSelector('.dialog-content', { state: 'visible' });
        await page.selectOption('#shape', 'rectangle');
        await page.click('button:has-text("Create")');
        
        // Click empty space - should show scene properties
        await page.click('.game-canvas', { position: { x: 10, y: 10 } });
        await expect(page.locator('#scene-name')).toBeVisible();
        await expect(page.locator('#object-name')).not.toBeVisible();
        
        // Click object - should show object properties
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        await expect(page.locator('#object-name')).toBeVisible();
        await expect(page.locator('#scene-name')).not.toBeVisible();
    });
});

test.describe('Shape Manipulation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
        // Create a test shape
        await page.click('button:has-text("Add Object")');
        await page.waitForSelector('.dialog-content', { state: 'visible' });
        await page.selectOption('#shape', 'rectangle');
        await page.fill('#width', '100');
        await page.fill('#height', '100');
        await page.click('button:has-text("Create")');
    });

    test('should drag shape and update position', async ({ page }) => {
        // Get initial position by clicking center of canvas
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        const initialX = await page.inputValue('#pos-x');
        const initialY = await page.inputValue('#pos-y');

        // Perform drag operation
        await page.mouse.move(400, 300);
        await page.mouse.down();
        await page.mouse.move(500, 400, { steps: 10 }); // Smooth movement
        await page.mouse.up();

        // Get new position
        const newX = await page.inputValue('#pos-x');
        const newY = await page.inputValue('#pos-y');

        // Verify position changed
        expect(Number(newX)).toBeGreaterThan(Number(initialX));
        expect(Number(newY)).toBeGreaterThan(Number(initialY));

        // Verify position in properties panel matches actual position
        await page.click('.game-canvas', { position: { x: 500, y: 400 } });
        const finalX = await page.inputValue('#pos-x');
        const finalY = await page.inputValue('#pos-y');
        expect(Number(finalX)).toBeCloseTo(500, -1); // Within 10 pixels
        expect(Number(finalY)).toBeCloseTo(400, -1);
    });

    test('should update position via properties panel', async ({ page }) => {
        // Select the shape
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        
        // Update position via inputs
        await page.fill('#pos-x', '250');
        await page.fill('#pos-y', '250');
        
        // Click away and back to verify persistence
        await page.click('.game-canvas', { position: { x: 10, y: 10 } });
        await page.click('.game-canvas', { position: { x: 250, y: 250 } });
        
        // Verify position maintained
        await expect(page.locator('#pos-x')).toHaveValue('250');
        await expect(page.locator('#pos-y')).toHaveValue('250');
    });

    test('should maintain shape properties while dragging', async ({ page }) => {
        // Select shape and set specific properties
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        await page.fill('#object-width', '150');
        await page.fill('#object-height', '75');
        await page.fill('#object-color', '#ff0000');
        
        // Drag shape
        await page.mouse.move(400, 300);
        await page.mouse.down();
        await page.mouse.move(300, 200, { steps: 10 });
        await page.mouse.up();
        
        // Verify properties maintained
        await expect(page.locator('#object-width')).toHaveValue('150');
        await expect(page.locator('#object-height')).toHaveValue('75');
        await expect(page.locator('#object-color')).toHaveValue('#ff0000');
    });
});

test.describe('Object Property Editor', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
        // Create a test object
        await page.click('button:has-text("Add Object")');
        await page.waitForSelector('.dialog-content', { state: 'visible' });
        await page.selectOption('#shape', 'rectangle');
        await page.click('button:has-text("Create")');
    });

    test('should update all object properties simultaneously', async ({ page }) => {
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        
        // Update multiple properties at once
        await page.fill('#object-name', 'Updated Object');
        await page.fill('#object-width', '150');
        await page.fill('#object-height', '75');
        await page.fill('#object-color', '#00ff00');
        await page.fill('#pos-x', '200');
        await page.fill('#pos-y', '200');
        
        // Verify all changes persisted
        await page.click('.game-canvas', { position: { x: 10, y: 10 } }); // Deselect
        await page.click('.game-canvas', { position: { x: 200, y: 200 } }); // Select at new position
        
        await expect(page.locator('#object-name')).toHaveValue('Updated Object');
        await expect(page.locator('#object-width')).toHaveValue('150');
        await expect(page.locator('#object-height')).toHaveValue('75');
        await expect(page.locator('#object-color')).toHaveValue('#00ff00');
        await expect(page.locator('#pos-x')).toHaveValue('200');
        await expect(page.locator('#pos-y')).toHaveValue('200');
    });

    test('should handle invalid property inputs', async ({ page }) => {
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        
        // Try negative values
        await page.fill('#object-width', '-50');
        await page.fill('#object-height', '-100');
        
        // Verify values are constrained
        await expect(page.locator('#object-width')).not.toHaveValue('-50');
        await expect(page.locator('#object-height')).not.toHaveValue('-100');
        
        // Try extremely large values
        await page.fill('#object-width', '99999');
        await page.fill('#object-height', '99999');
        
        // Verify values are reasonable
        const width = await page.inputValue('#object-width');
        const height = await page.inputValue('#object-height');
        expect(Number(width)).toBeLessThan(99999);
        expect(Number(height)).toBeLessThan(99999);
    });

    test('should maintain selection after scene changes', async ({ page }) => {
        // Select object
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        await expect(page.locator('#object-name')).toBeVisible();
        
        // Create new scene
        await page.click('button:has-text("New Scene")');
        
        // Verify no object is selected in new scene
        await expect(page.locator('#object-name')).not.toBeVisible();
        await expect(page.locator('#scene-name')).toBeVisible();
    });

    test('should handle multiple object selections', async ({ page }) => {
        // Create second object
        await page.click('button:has-text("Add Object")');
        await page.waitForSelector('.dialog-content', { state: 'visible' });
        await page.selectOption('#shape', 'rectangle');
        await page.click('button:has-text("Create")');
        
        // Select first object
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        await expect(page.locator('#object-name')).toHaveValue('Test Object');
        
        // Select second object
        await page.click('.game-canvas', { position: { x: 400, y: 400 } });
        await expect(page.locator('#object-name')).toHaveValue('Test Object');
        
        // Verify properties panel updates correctly
        await page.fill('#object-color', '#0000ff');
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        await expect(page.locator('#object-color')).not.toHaveValue('#0000ff');
    });

    test('should handle rapid property changes', async ({ page }) => {
        await page.click('.game-canvas', { position: { x: 400, y: 300 } });
        
        // Rapidly change position
        for (let i = 0; i < 5; i++) {
            await page.fill('#pos-x', `${200 + i * 50}`);
            await page.fill('#pos-y', `${200 + i * 50}`);
        }
        
        // Verify final position
        await expect(page.locator('#pos-x')).toHaveValue('400');
        await expect(page.locator('#pos-y')).toHaveValue('400');
        
        // Verify object is actually there
        await page.click('.game-canvas', { position: { x: 400, y: 400 } });
        await expect(page.locator('#object-name')).toBeVisible();
    });
}); 