import "./app.css";
import App from "./App.svelte";
import App2 from "./App2.svelte";
import App3 from "./App3.svelte";


let app;
const appElement = document.getElementById("app");
if (appElement) {
  app = new App2({
    target: appElement,
  });
} else {
  console.error('Element with id "app" not found.');
}
export default app;
