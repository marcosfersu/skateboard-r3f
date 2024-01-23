import React from "react";

const WheelsHtml = ({ index, snapWheelsScroll, currentSection }) => {
  function selectWheel() {
    if (currentSection !== "wheels") return;

    snapWheelsScroll(index);
  }
  return (
    <div onClick={selectWheel}>
      <p>texture</p>
    </div>
  );
};

export default WheelsHtml;
