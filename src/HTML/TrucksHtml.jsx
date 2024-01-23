const TrucksHtml = (props) => {
  const { snapTruckScroll, currentSection, index, info, color, img } = props;

  const { url, hexa } = info;

  const selectTruck = () => {
    if (currentSection !== "trucks") return;
    snapTruckScroll(index);
  };

  const divStyle = {
    backgroundColor: hexa,
  };

  return (
    <div onClick={selectTruck} index={index} className="box">
      {color && <div className="color-box" style={divStyle}></div>}
      {img && <img src={url} alt="" />}
    </div>
  );
};

export default TrucksHtml;
