<script lang="ts">
  import { afterUpdate, beforeUpdate, onMount } from "svelte";

  export let directedGraph: boolean;
  export let nodeLabel: string | null = null;
  export let nodeID: string | null = null;
  export let tempNodeLabel: string;
  export let labelUpdate: (newLabel: string) => void;

  const toggleDirectedGraph = () => {
    directedGraph = !directedGraph;
  };

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

  <!-- Toggle Slider for Directed Graph -->
  <div class="toggle-container">
    <label class="prop-label">
      Directed Graph
      <input
        type="checkbox"
        checked={directedGraph}
        on:change={toggleDirectedGraph}
      />
      <span class="slider"></span>
    </label>
  </div>

  <!-- Node Properties Section -->
  {#if nodeLabel && nodeID}
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

  /* Toggle Switch Styling */
  .toggle-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 1rem;
    padding: 0 10px;
  }

  .prop-label {
    position: relative;
    display: flex;
    align-items: center;
    font-size: 1rem;
    justify-content: space-between;
    width: 100%;
  }

  .prop-label input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: relative;
    cursor: pointer;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 34px;
    transition: 0.4s;
    margin-left: 10px; /* Add spacing between label and slider */
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: #ff9e2c;
  }

  input:checked + .slider:before {
    transform: translateX(18px);
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
