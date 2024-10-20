import "./app.css";
import TestApp from "./TestApp.svelte";


let app;
const appElement = document.getElementById("app");
if (appElement) {
  app = new TestApp({
    target: appElement,
  });
} else {
  console.error('Element with id "app" not found.');
}
export default app;
