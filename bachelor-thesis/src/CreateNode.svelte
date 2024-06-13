<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { GraphNode } from "./D3GraphTypes";
  import { addNode, labelExists } from "./D3Graph";
  import { onMount } from "svelte";

  export let nodesStore: Writable<GraphNode[]>;
  let label: string = "";
  let inputElement: HTMLInputElement;
  let nodesCount = 0;

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    // Only allow 10 charecters, no white-spaces and no new lines
    let sanitizedValue = target.value.replace(/[^a-zA-Z0-9]/g, "");
    if (sanitizedValue.length > 10) {
      sanitizedValue = sanitizedValue.substring(0, 10);
    }
    target.value = sanitizedValue;
  };
</script>

<div class="CreateNode-container">
  <button
    on:click={() => {
      if (!labelExists(nodesStore, label)) {
        addNode(nodesStore, label, nodesCount);
        nodesCount += 1;
        console.log($nodesStore);
      }
    }}
    class="CreateNode-button">Add Node</button
  >
  <input
    bind:this={inputElement}
    on:input={handleInput}
    bind:value={label}
    type="text"
    placeholder="Enter node label"
    class="CreateNode-input"
  />
</div>

<style>
  .CreateNode-input {
    padding: 0.5em;
    font-size: 1em;
  }

  .CreateNode-container {
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .CreateNode-button {
    background-color: rgb(192, 192, 192);
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    border: 1px solid gray;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    flex: 1;
    width: 100%;
  }

  .CreateNode-button:hover {
    background-color: #3700b3;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }
</style>
