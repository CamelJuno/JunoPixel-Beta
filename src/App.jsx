import * as React from "react";
import { useState } from "react";
import "./App.css";
import CanvasDraw from "./CanvasDraw";
import config from "./config.json";

function App() {
  const [color, setColor] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  React.useEffect(() => {
    if (isDisabled) {
      const timeId = setTimeout(() => {
        setIsDisabled(false);
      }, config.time);

      return () => clearTimeout(timeId);
    }
  }, [isDisabled]);

  const handleClick = (e) => {
    setIsDisabled(true);
  };

  const handleColorChange = (e) => {
    setColor(e.currentTarget.value);
  };

  return (
    <div
      onMouseUp={handleClick}
      style={{
        height: "100vh",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        background: "gray",
      }}
    >
      <input
        style={{ position: "fixed", bottom: "1rem", right: "1rem" }}
        type="color"
        onChange={handleColorChange}
      />
      <CanvasDraw
        canvasHeight={window.innerHeight - 32 * 2.5}
        canvasWidth={window.innerWidth - 32 * 2.5}
        enablePanAndZoom
        brushRadius={1}
        hideGrid
        loadTimeOffset={1000}
        imgSrc=""
        hideInterface
        brushColor={color}
        disabled={isDisabled}
        style={{
          position: "absolute",
          inset: 0,
          left: "2rem",
          top: "2rem",
        }}
      />
    </div>
  );
}

export default App;
