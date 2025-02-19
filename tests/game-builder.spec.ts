import { test, expect } from '@playwright/test';

test.describe('Game Builder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
        // Wait for initial scene and add button to be ready
        await page.waitForSelector('.scene-item');
        await page.waitForSelector('button:has-text("Add Object")');
    });

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
        // Open dialog and wait for it to be visible
        await page.click('button:has-text("Add Object")');
        await page.waitForSelector('.dialog-content', { state: 'visible' });

        // Now fill the form
        await page.fill('input#object-name', 'Test Rectangle');
        await page.selectOption('select#shape', 'rectangle');  // Update selector to match actual ID
        await page.fill('input#width', '100');
        await page.fill('input#height', '100');
        await page.fill('input#object-color', '#ff0000');
        
        // Take a screenshot to debug if needed
        await page.screenshot({ path: 'test-debug.png' });
        
        await page.click('button:has-text("Create")');
        
        // Wait for dialog to close and object to appear
        await page.waitForSelector('.dialog-content', { state: 'hidden' });
        await page.waitForSelector('.object-item:has-text("Test Rectangle")');
    });

    test('should drag and drop objects', async ({ page }) => {
        // Create and wait for object
        await page.click('button:has-text("Add Object")');
        await page.fill('#object-name', 'Draggable Object');
        await page.click('button:has-text("Create")');
        
        // Wait for object and select it
        await page.waitForSelector('.object-item:has-text("Draggable Object")');
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
        await page.fill('#object-name', 'Editable Object');
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
});

test.describe('Shape Manipulation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
        // Create a test shape
        await page.click('button:has-text("Add Object")');
        await page.fill('#object-name', 'Test Shape');
        await page.selectOption('select:has-text("Shape")', 'rectangle');
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