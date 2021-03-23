import { Component } from "@angular/core";
import NetworkGraph from "../network-graph/NetworkGraph";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "CodeSandbox";

  onNgInit() {
    new NetworkGraph({});
  }
}
