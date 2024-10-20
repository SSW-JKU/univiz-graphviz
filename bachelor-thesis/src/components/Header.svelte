<script lang="ts">
    export let title: string = "My Svelte App";
  </script>
  
  <header>
    <h1>{title}</h1>
  </header>
  
  <style>
    header {
      background-color: #f4f4f4;
      padding: 1rem;
    }
  
    h1 {
      margin: 0;
      color: #333;
    }
  </style>