import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import "./App.css";
import { Perf } from "r3f-perf";
import Scene from "./Scene";

function App() {
  const canvasContainerRef = useRef();

  return (
    <div
      ref={canvasContainerRef}
      id="canvas-container"
      className="canvas-container"
    >
      <Canvas
        camera={{
          fov: 15,
        }}
      >
        <Scene />
        <Perf />
      </Canvas>
    </div>
  );
}

export default App;
