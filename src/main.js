import "./styles.css";
import m from "mithril";
import CompareUI from "./components/CompareUI";

m.route(document.body, "/", {
  "/": CompareUI,
});
