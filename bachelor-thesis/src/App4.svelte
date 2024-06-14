<script lang="ts">
  import { onMount } from "svelte";
  import { redraw } from "./App4";

  let svg: SVGElement;
  onMount(() => {
    redraw(svg)
  });
</script>

<div>
  <svg bind:this={svg} />
</div>
