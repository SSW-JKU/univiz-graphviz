import "./app.css";
import App from "./App.svelte";


let app;
const appElement = document.getElementById("app");
if (appElement) {
  app = new App({
    target: appElement,
  });
} else {
  console.error('Element with id "app" not found.');
}
export default app;
