<script lang="ts">
  import { Router, Route, link } from "svelte-routing";
  import { onMount } from "svelte";
  import StartPage from "./pages/StartPage.svelte";
  import GraphsAndStuff from "./pages/GraphsAndStuff.svelte";
  import Visualizer from "./modes/Visualizer.svelte";
  import Presenting from "./modes/Presenting.svelte";

  let currentPath = window.location.pathname;
  let navElement: HTMLElement | null = null;

  const updatePath = () => {
    currentPath = window.location.pathname;
  };

  const handleClick = (event: Event) => {
    const target = event.target as HTMLAnchorElement;
    if (target.tagName === "A") {
      currentPath = target.pathname;
    }
  };

  onMount(() => {
    // Listen for popstate events (browser back/forward buttons)
    window.addEventListener("popstate", updatePath);

    // Attach click listener to nav element
    if (navElement) {
      navElement.addEventListener("click", handleClick);
    }

    return () => {
      // Cleanup the popstate event listener and nav event listener on destroy
      window.removeEventListener("popstate", updatePath);
      if (navElement) {
        navElement.removeEventListener("click", handleClick);
      }
    };
  });
</script>

<main class="main">
  <nav bind:this={navElement}>
    <!-- Bind nav element to navElement variable -->
    <Router>
      <ul>
        <li>
          <a
            href="/"
            class="nav-link"
            use:link
            class:active={currentPath === "/"}>Home</a
          >
        </li>

        <!-- Dropdown for Modes -->
        <li class="dropdown">
          <a
            href=""
            class="nav-link"
            class:active={currentPath.startsWith("/graphsandstuff")}>Graphs And Stuff</a
          >
          <div class="dropdown-content">
            <a href="/graphsandstuff/testgraph" class="dropdown-link" use:link
              >Test Graph</a
            >
            <a href="/graphsandstuff/visualizer" class="dropdown-link" use:link
              >Graph Visualizer</a
            >
            <a href="/graphsandstuff/teaching-mode" class="dropdown-link" use:link
              >Teaching mode</a
            >
          </div>
        </li>
      </ul>
    </Router>
  </nav>

  <Router>
    <Route path="/" component={StartPage} />
    <!-- Use About page for both dropdown links -->
    <Route path="/graphsandstuff/testgraph" component={GraphsAndStuff} />
    <Route path="/graphsandstuff/visualizer" component={Visualizer} />
    <Route path="/graphsandstuff/teaching-mode" component={Presenting} />
  </Router>
</main>

<style>
  .main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    padding: 0;
  }

  nav {
    background-color: #2c3e50;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    position: relative;
    margin-right: 1.5rem;
  }

  .nav-link {
    font-size: 1.2rem;
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition:
      background-color 0.3s,
      color 0.3s;
  }

  .nav-link:hover {
    background-color: #34495e;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #34495e;
    min-width: 160px;
    top: calc(100% + 5px); 
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  /* Dropdown links */
  .dropdown-content .dropdown-link {
    color: white;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .dropdown-content .dropdown-link:hover {
    background-color: #3e5b6d;
  }

  /* Show the dropdown on hover */
  .dropdown:hover .dropdown-content {
    display: block;
  }

  .nav-link.active {
    background-color: #ff9e2c;
    color: white;
    font-weight: bold;
  }

  /* Highlight active dropdown links */
  .dropdown-link.active {
    background-color: #ff9e2c;
    color: white;
  }
</style>
