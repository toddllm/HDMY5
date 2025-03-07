<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { GameObject, EntityType, CharacterType, MonsterType, ItemType, EntityProperties } from '$lib/types/GameTypes';
    import { PREDEFINED_ENTITIES } from '$lib/types/GameTypes';

    export let isOpen = false;

    const dispatch = createEventDispatcher<{
        close: void;
        create: GameObject;
    }>();

    let selectedEntityType: EntityType = 'hero';
    let selectedCharacterType: CharacterType | null = null;
    let selectedMonsterType: MonsterType | null = null;
    let selectedItemType: ItemType | null = null;
    
    let name = '';
    let health = 100;
    let speed = 5;
    let damage = 10;
    let defense = 5;
    let description = '';
    let isHostile = false;
    let interactable = true;
    let specialAbilities: string[] = [];
    let newAbility = '';
    
    // Dropdown options
    const entityTypes: EntityType[] = ['hero', 'wizard', 'fairy', 'robot', 'monster', 'boss', 'minion', 'drone', 'potion', 'weapon', 'armor', 'portal', 'key', 'treasure'];
    const characterTypes: CharacterType[] = ['fred', 'tom', 'casta', 'elda', 'dr-nikic'];
    const monsterTypes: MonsterType[] = ['goblin', 'troll', 'dragon', 'zombie', 'skeleton', 'ghost'];
    const itemTypes: ItemType[] = ['eye-of-elder', 'health-potion', 'mana-potion', 'elder-portal', 'sword', 'shield'];
    
    // Predefined entity templates
    const predefinedEntities = [
        { label: "Fred the Adventurer", value: "FRED" },
        { label: "Tom the Archer", value: "TOM" },
        { label: "Casta the Wizard", value: "CASTA" },
        { label: "Elda the Fairy", value: "ELDA" },
        { label: "Dr. Nikic", value: "DR_NIKIC" },
        { label: "Goblin", value: "GOBLIN" },
        { label: "Troll", value: "TROLL" },
        { label: "Dragon", value: "DRAGON" },
        { label: "Zombie", value: "ZOMBIE" },
        { label: "Skeleton", value: "SKELETON" },
        { label: "Ghost", value: "GHOST" },
        { label: "Eye of Elder", value: "EYE_OF_ELDER" },
        { label: "Elder Portal", value: "ELDER_PORTAL" },
        { label: "Health Potion", value: "HEALTH_POTION" },
        { label: "Mana Potion", value: "MANA_POTION" },
        { label: "Sword", value: "SWORD" },
        { label: "Shield", value: "SHIELD" }
    ];
    
    function handlePredefinedEntitySelect(event: Event) {
        const select = event.target as HTMLSelectElement;
        const entityKey = select.value;
        
        if (entityKey && entityKey in PREDEFINED_ENTITIES) {
            const entity = PREDEFINED_ENTITIES[entityKey as keyof typeof PREDEFINED_ENTITIES];
            
            // Apply the predefined entity properties
            name = entity.name;
            selectedEntityType = entity.entityType;
            health = entity.health;
            speed = entity.speed;
            damage = entity.damage || 0;
            defense = entity.defense || 0;
            description = entity.description;
            isHostile = entity.isHostile;
            interactable = entity.interactable;
            specialAbilities = entity.specialAbilities || [];
            
            // Set specific type if available
            selectedCharacterType = entity.characterType || null;
            selectedMonsterType = entity.monsterType || null;
            selectedItemType = entity.itemType || null;
        }
    }

    function addAbility() {
        if (newAbility.trim()) {
            specialAbilities = [...specialAbilities, newAbility.trim()];
            newAbility = '';
        }
    }

    function removeAbility(index: number) {
        specialAbilities = specialAbilities.filter((_, i) => i !== index);
    }

    function handleSubmit() {
        const properties: EntityProperties = {
            entityType: selectedEntityType,
            health,
            speed,
            damage: damage || undefined,
            defense: defense || undefined,
            specialAbilities: specialAbilities.length > 0 ? specialAbilities : undefined,
            description,
            isHostile,
            interactable
        };
        
        // Add specific type if selected
        if (selectedCharacterType) {
            properties.characterType = selectedCharacterType;
        }
        
        if (selectedMonsterType) {
            properties.monsterType = selectedMonsterType;
        }
        
        if (selectedItemType) {
            properties.itemType = selectedItemType;
        }

        const entity: GameObject = {
            id: crypto.randomUUID(),
            name: name || `${selectedEntityType}_${Date.now()}`,
            position: { x: 400, y: 300, z: 0 },
            type: 'entity',
            properties,
            components: []
        };

        dispatch('create', entity);
        handleClose();
    }

    function handleClose() {
        dispatch('close');
        isOpen = false;
        resetForm();
    }
    
    function resetForm() {
        selectedEntityType = 'hero';
        selectedCharacterType = null;
        selectedMonsterType = null;
        selectedItemType = null;
        name = '';
        health = 100;
        speed = 5;
        damage = 10;
        defense = 5;
        description = '';
        isHostile = false;
        interactable = true;
        specialAbilities = [];
        newAbility = '';
    }
    
    // Show/hide specific type dropdowns based on entity type
    $: showCharacterTypes = ['hero', 'wizard', 'fairy', 'robot'].includes(selectedEntityType);
    $: showMonsterTypes = ['monster', 'boss', 'minion'].includes(selectedEntityType);
    $: showItemTypes = ['potion', 'weapon', 'armor', 'portal', 'key', 'treasure'].includes(selectedEntityType);
    $: showCombatStats = ['hero', 'wizard', 'robot', 'monster', 'boss', 'minion'].includes(selectedEntityType);
</script>

{#if isOpen}
    <div class="dialog-overlay" on:click={handleClose}>
        <div class="dialog-content" on:click|stopPropagation>
            <h2>Create New Entity</h2>
            
            <div class="form-group">
                <label for="predefined">Quick Create:</label>
                <select id="predefined" on:change={handlePredefinedEntitySelect}>
                    <option value="">-- Select Predefined Entity --</option>
                    {#each predefinedEntities as entity}
                        <option value={entity.value}>{entity.label}</option>
                    {/each}
                </select>
            </div>
            
            <form on:submit|preventDefault={handleSubmit}>
                <div class="form-group">
                    <label for="entity-name">Name:</label>
                    <input id="entity-name" type="text" bind:value={name} placeholder="Entity Name" />
                </div>
                
                <div class="form-group">
                    <label for="entity-type">Entity Type:</label>
                    <select id="entity-type" bind:value={selectedEntityType}>
                        {#each entityTypes as type}
                            <option value={type}>{type}</option>
                        {/each}
                    </select>
                </div>
                
                {#if showCharacterTypes}
                    <div class="form-group">
                        <label for="character-type">Character Type:</label>
                        <select id="character-type" bind:value={selectedCharacterType}>
                            <option value={null}>-- Select Character Type --</option>
                            {#each characterTypes as type}
                                <option value={type}>{type}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
                
                {#if showMonsterTypes}
                    <div class="form-group">
                        <label for="monster-type">Monster Type:</label>
                        <select id="monster-type" bind:value={selectedMonsterType}>
                            <option value={null}>-- Select Monster Type --</option>
                            {#each monsterTypes as type}
                                <option value={type}>{type}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
                
                {#if showItemTypes}
                    <div class="form-group">
                        <label for="item-type">Item Type:</label>
                        <select id="item-type" bind:value={selectedItemType}>
                            <option value={null}>-- Select Item Type --</option>
                            {#each itemTypes as type}
                                <option value={type}>{type}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="entity-health">Health:</label>
                        <input id="entity-health" type="number" bind:value={health} min="1" />
                    </div>
                    
                    <div class="form-group">
                        <label for="entity-speed">Speed:</label>
                        <input id="entity-speed" type="number" bind:value={speed} min="0" />
                    </div>
                </div>
                
                {#if showCombatStats}
                    <div class="form-row">
                        <div class="form-group">
                            <label for="entity-damage">Damage:</label>
                            <input id="entity-damage" type="number" bind:value={damage} min="0" />
                        </div>
                        
                        <div class="form-group">
                            <label for="entity-defense">Defense:</label>
                            <input id="entity-defense" type="number" bind:value={defense} min="0" />
                        </div>
                    </div>
                {/if}
                
                <div class="form-group">
                    <label for="entity-description">Description:</label>
                    <textarea 
                        id="entity-description" 
                        bind:value={description}
                        rows="3"
                        placeholder="Describe this entity..."
                    ></textarea>
                </div>
                
                <div class="form-row checkbox-row">
                    <div class="form-group">
                        <label>
                            <input type="checkbox" bind:checked={isHostile} />
                            Hostile
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" bind:checked={interactable} />
                            Interactable
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Special Abilities:</label>
                    <div class="ability-input">
                        <input 
                            type="text" 
                            bind:value={newAbility} 
                            placeholder="Add ability..."
                        />
                        <button type="button" on:click={addAbility}>Add</button>
                    </div>
                    
                    {#if specialAbilities.length > 0}
                        <ul class="abilities-list">
                            {#each specialAbilities as ability, i}
                                <li>
                                    {ability}
                                    <button type="button" class="remove-btn" on:click={() => removeAbility(i)}>×</button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
                
                <div class="dialog-buttons">
                    <button type="button" on:click={handleClose}>Cancel</button>
                    <button type="submit">Create</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .dialog-content {
        background: #2c2c2c;
        padding: 2rem;
        border-radius: 8px;
        width: 600px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }

    h2 {
        margin-top: 0;
        color: #fff;
        border-bottom: 1px solid #444;
        padding-bottom: 0.5rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .checkbox-row {
        margin-top: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: #ccc;
    }

    input, select, textarea {
        width: 100%;
        padding: 0.5rem;
        background: #333;
        border: 1px solid #555;
        color: white;
        border-radius: 4px;
    }

    input[type="checkbox"] {
        width: auto;
        margin-right: 0.5rem;
    }

    .ability-input {
        display: flex;
        gap: 0.5rem;
    }

    .ability-input button {
        padding: 0.5rem 1rem;
        background: #555;
        border: none;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }

    .abilities-list {
        list-style: none;
        padding: 0.5rem;
        margin: 0.5rem 0;
        background: #333;
        border-radius: 4px;
        max-height: 150px;
        overflow-y: auto;
    }

    .abilities-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.25rem 0.5rem;
        margin-bottom: 0.25rem;
        background: #444;
        border-radius: 4px;
    }

    .remove-btn {
        background: none;
        border: none;
        color: #ff6b6b;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0 0.5rem;
    }

    .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    button {
        padding: 0.5rem 1.5rem;
        background: #555;
        border: none;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }

    button[type="submit"] {
        background: #4c8dff;
    }

    button:hover {
        opacity: 0.9;
    }
</style> 