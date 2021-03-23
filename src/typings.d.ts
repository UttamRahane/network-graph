/* SystemJS module definition */
import * as _d3 from "d3";

declare global {
  const d3: typeof _d3;
}

declare var module: NodeModule;
interface NodeModule {
  id: string;
}
