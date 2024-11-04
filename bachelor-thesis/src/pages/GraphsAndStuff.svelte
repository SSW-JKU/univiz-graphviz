<script lang="ts">
  import GraphBuilder from "../modes/GraphBuilder.svelte";
  export let directedGraph: boolean;
</script>

<div class="about-container">
  <GraphBuilder directedGraph={directedGraph}/>
</div>

<style>
  .about-container {
    display: flex;
    flex-direction: column;
    height: 100%; /* Ensure it takes full height of the page */
  }
</style>
