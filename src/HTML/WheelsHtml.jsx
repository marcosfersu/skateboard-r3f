import React from "react";

const WheelsHtml = ({ index, snapWheelsScroll, currentSection, info }) => {
  function selectWheel() {
    if (currentSection !== "wheels") return;

    snapWheelsScroll(index);
  }
  return (
    <div onClick={selectWheel} className="wheels-container">
      <img src={info.url} alt="" />
    </div>
  );
};

export default WheelsHtml;
