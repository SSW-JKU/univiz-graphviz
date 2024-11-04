<script lang="ts">
  import { afterUpdate, beforeUpdate, onMount } from "svelte";

  export let nodeLabel: string | null = null;
  export let nodeID: string | null = null;
  export let tempNodeLabel: string;
  export let labelUpdate: (newLabel: string) => void;

  $: if (tempNodeLabel) {
    labelUpdate(tempNodeLabel);
  }

  beforeUpdate(() => {
    if (
      nodeLabel &&
      (tempNodeLabel === undefined || tempNodeLabel !== nodeLabel)
    ) {
      tempNodeLabel = nodeLabel;
    }
  });
</script>

<!-- Settings Title -->
<div class="menu">
  <div class="menu-header menu-margin">Settings</div>

  <!-- Node Properties Section -->
  {#if nodeID}
    <div class="node-properties">
      <div class="menu-header">Node Properties</div>
      <div class="prop-label">
        <p>Node:</p>
        <p>{nodeID}</p>
      </div>

      <!-- Label -->
      <div class="label-container">
        <label class="prop-label" for="node-label">Label:</label>
        <input id="node-label" bind:value={tempNodeLabel} maxlength="15" />
      </div>
    </div>
  {/if}
</div>

<style>
  .menu {
    background-color: #2c3e50;
    color: white;
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 250px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
  }

  .menu-header {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
  }

  .menu-margin {
    margin-bottom: 1rem;
  }

  .prop-label {
    position: relative;
    display: flex;
    align-items: center;
    font-size: 1rem;
    justify-content: space-between;
    width: 100%;
  }

  /* Label and Input styling */
  .label-container {
    display: flex;
    flex-direction: row;
  }

  /* The node properties section */
  .node-properties {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2); /* Light separator line */
  }

  /* Responsive styling for smaller screens */
  @media (max-width: 600px) {
    .menu {
      width: 100%;
      font-size: 0.9rem;
    }

    .menu-header {
      font-size: 1.3rem;
    }
  }
</style>
