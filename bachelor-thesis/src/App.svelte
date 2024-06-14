<script lang="ts">
  import App1 from "./App1.svelte";
  import App2 from "./App2.svelte";
  import App3 from "./App3.svelte";

  let selectedOption = 3;

  function selectOption(option: number) {
    selectedOption = option;
  }
</script>

<div class="toggle-switch">
  <button
    class:selected={selectedOption === 1}
    on:click={() => selectOption(1)}
  >
    D3-Graphviz Draggable
  </button>
  <button
    class:selected={selectedOption === 2}
    on:click={() => selectOption(2)}
  >
    D3 Draggable
  </button>
  <button
    class:selected={selectedOption === 3}
    on:click={() => selectOption(3)}
  >
    D3-Graphviz Non-Draggable
  </button>
</div>

{#if selectedOption === 1}
  <App1 />
{:else if selectedOption === 2}
  <App2 />
{:else if selectedOption === 3}
  <App3 />
{/if}
