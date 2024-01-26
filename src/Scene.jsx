import { useRef, useState, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import {
  Environment,
  CameraControls,
  Center,
  Html,
  useTexture,
} from "@react-three/drei";

import gsap from "gsap";

import { useThree } from "@react-three/fiber";

import { deckInfo, trucksInfo, wheelsInfo } from "./info";
import Deck from "./Skateboard/Deck";
import TrucksHtml from "./HTML/TrucksHtml";

import { HexColorPicker } from "react-colorful";
import WheelsHtml from "./HTML/WheelsHtml";

const texture_urls = wheelsInfo.map((w) => w.texture_url);

const Scene = () => {
  const positions = [];
  const deckInfoHaft =
    (deckInfo.length % 2 === 0 ? deckInfo.length : deckInfo.length - 1) / 2;
  const initialAbsorbersColor = "#232323";

  const meshGroupRef = useRef();
  const cameraControlsRef = useRef();
  const wheelsGroupContainerRef = useRef();
  const bottomGroupHtmlRef = useRef();
  const trucksGroupContainerRef = useRef();
  const wheelUniformRef = useRef(null);
  const absorbersGroupContainerRef = useRef();
  const gsapCtx = useRef();

  const [currentDeckIndex, setCurrentDeckIndex] = useState(deckInfoHaft);
  const [currentTruckIndex, setCurrentTruckIndex] = useState(0);
  const [currentWheelIndex, setCurrentWheelIndex] = useState(0);
  const [bearingRestPositon, setBearingRestPositon] = useState(0);
  const [lastTruckIndex, setLastTruckIndex] = useState(null);
  const [currentSection, setCurrentSection] = useState("board");
  const [cameraActive, setCameraActiveStatus] = useState(false);
  const [absorbersColor, setAbsorbersColor] = useState(initialAbsorbersColor);
  const [animationActive, setAnimationActive] = useState(false);
  const [selections, addSelection] = useState([]);

  useEffect(() => {
    cameraControlsRef.current._removeAllEventListeners();

    cameraControlsRef.current.addEventListener("rest", () => {
      snapScroll();
    });
  }, []);

  const { camera, scene } = useThree();
  const wheelTextures = useTexture(texture_urls);

  useEffect(() => {
    gsapCtx.current.introAnimation();
    wheelTextures.forEach((t) => {
      t.needsUpdate = true;
      t.flipY = false;
    });
  }, []);

  useLayoutEffect(() => {
    gsapCtx.current = gsap.context((self) => {
      const introTL = gsap.timeline();
      const boardMaterials = meshGroupRef.current.children.map(
        (g) => g.children[0].material
      );
      self.add("introAnimation", () => {
        introTL
          .to(boardMaterials, {
            opacity: 1,
            ease: "power2.out",
            duration: 1,
          })
          .to(
            meshGroupRef.current.position,
            {
              z: 0,
              ease: "power2.out",
              duration: 1,
            },
            0
          );
      });
      self.add("boardToTrucksTransition", (deckIndex) => {
        const tl = gsap.timeline();
        const currentDeckGroup = meshGroupRef.current.children[deckIndex];
        const trucksGroup = currentDeckGroup.children[1];

        console.log(currentDeckGroup);
        const boardsToRemoveMaterial = boardMaterials.filter(
          (m, i) => i !== deckIndex
        );

        // const sectionLabels = document.getElementById(
        //   "section-label-container"
        // ).children;

        tl.to(boardsToRemoveMaterial, {
          opacity: 0,
          ease: "power2.in",
          duration: 0.5,
          onComplete: () => {
            meshGroupRef.current.children = [currentDeckGroup];
          },
        })
          .to(currentDeckGroup.rotation, {
            x: -Math.PI * 0.4,
            y: Math.PI * 2.03,
            z: Math.PI * 0.1,
            ease: "power3.out",
            duration: 1,
          })
          .to(
            ".info-container",
            {
              display: "none",
            },
            "<"
          )
          .to(
            currentDeckGroup.position,
            {
              x: cameraControlsRef.current.camera.position.x - 0.2,
              z: 3,
              y: 0.02,
              duration: 1,
            },
            "<"
          )
          .to(trucksGroup.position, {
            z: 0.16,
            duration: 0.5,
            delay: 0.2,
            ease: "power3.out",
            onStart: () => {
              trucksGroup.visible = true;
            },
            onComplete: () => {
              snapTruckScroll(currentTruckIndex);
            },
          });
      });

      self.add("scrollPosX", (items, xDelta) => {
        gsap.to([...items], {
          x: xDelta,
          duration: 0.1,
        });
      });

      self.add("scrollTrucks", (snapIndex) => {
        const trucksGroup =
          scene.children[0].children[0].children[0].children[0].children[0]
            .children[1];

        const tl = gsap.timeline();

        if (animationActive || snapIndex === lastTruckIndex) return;

        if (lastTruckIndex === null) {
          tl.to(trucksGroup.children[0].position, {
            z: 0,
            duration: 0.5,
            onStart: () => {
              setAnimationActive(true);
            },
            onComplete: () => {
              setLastTruckIndex(0);
              setAnimationActive(false);
            },
          }).to(".truck-html-right", {
            pointerEvents: "auto",
            opacity: 1,
            duration: 0.5,
          });
        } else {
          tl.to(trucksGroup.children[lastTruckIndex].position, {
            z: -0.1,
            duration: 0.5,
            onStart: () => {
              setAnimationActive(true);
            },
          })
            .set(trucksGroup.children[lastTruckIndex].position, {
              z: 0.1,
            })
            .to(trucksGroup.children[snapIndex].position, {
              z: 0,
              duration: 0.5,
              onComplete: () => {
                setLastTruckIndex(snapIndex);
                setAnimationActive(false);
              },
            });
        }
      });

      self.add("trucksToAbsorbersTransition", () => {
        const currentBoardGroup = meshGroupRef.current.children[0];
        const tl = gsap.timeline();
        tl.to(currentBoardGroup.children[1].children[0].position, {
          z: -0.02,
          duration: 0.5,
        })
          .to(".truck-html-right", {
            pointerEvents: "none",
            opacity: 0,
            duration: 0.5,
          })
          .to(currentBoardGroup.rotation, {
            z: Math.PI * 0.5,
            x: Math.PI * 0.5,
            y: Math.PI * 0.5,
            duration: 1.5,
            ease: "power3.out",
          })
          .to(currentBoardGroup.position, {
            y: -0.25,
            x: cameraControlsRef.current.camera.position.x - 0.1,
            z: 4.3,
            duration: 1.5,
            ease: "power3.out",
            delay: -1,
            onStart: () => {
              setCurrentSection("absorberCurrent");
            },
          })
          .to(".truck-html-right2", {
            pointerEvents: "auto",
            opacity: 1,
            duration: 0.5,
          });
      });

      self.add("colorAbsorbers", (selectColor) => {
        const tl = gsap.timeline();
        const target =
          meshGroupRef.current.children[0].children[1].children[0].children[0]
            .children[1];
        const initial = new THREE.Color(initialAbsorbersColor);
        const newColor = new THREE.Color(selectColor);
        tl.to(initial, {
          r: newColor.r,
          g: newColor.g,
          b: newColor.b,
          duration: 0,
          onUpdate: () => {
            target.material.color = initial;
          },
        });
      });
      self.add("absorbersToWheelsTransition", () => {
        const currentBoardGroup = meshGroupRef.current.children[0];
        const wheelsGroup = currentBoardGroup.children[2].children[0];

        const frontWheel = wheelsGroup.children[2];
        const frontWheelPositionX = frontWheel.position.x;
        const frontBearing = wheelsGroup.children[4].children[6];
        const bearingPart1 = wheelsGroup.children[4].children[3];
        const bearingPart2 = wheelsGroup.children[4].children[0];
        const bearingPart3 = wheelsGroup.children[4].children[1];
        const bearingPart4 = wheelsGroup.children[4].children[2];
        const bearingPart5 = wheelsGroup.children[4].children[4];

        const bearingRestPositonX = bearingPart1.position.x;

        setBearingRestPositon({ bearingRestPositonX, frontWheelPositionX });

        const tl = gsap.timeline();

        tl.to(".truck-html-right2", {
          pointerEvents: "none",
          opacity: 0,
          duration: 0.5,
        })
          .to(currentBoardGroup.rotation, {
            x: Math.PI * 0.55,
            y: Math.PI * 1,
            z: Math.PI * 2.62,
            duration: 1,
            ease: "power3.out",
          })
          .to(currentBoardGroup.position, {
            x: cameraControlsRef.current.camera.position.x - 0.4,
            z: 4,
            y: -0.06,
            duration: 1.5,
            ease: "power3.out",
            delay: -1,
          })
          .to(wheelsGroup, {
            delay: -1.5,
            onStart: () => {
              wheelsGroup.visible = true;
              bearingPart1.position.x = bearingRestPositonX;
              bearingPart2.position.x = bearingRestPositonX;
              bearingPart3.position.x = bearingRestPositonX + 0.03;
              bearingPart4.position.x = bearingRestPositonX;
              bearingPart5.position.x = bearingRestPositonX;
            },
          })
          .to(frontWheel.position, {
            x: frontWheelPositionX + 0.4,
            delay: -0.3,
            duration: 1,
            ease: "power3.out",
          })
          .to(frontWheel.rotation, {
            x: Math.PI * 2,
            duration: 1.5,
            delay: -1,
            ease: "power3.out",
          })
          .to(bearingPart5.position, {
            x: bearingRestPositonX + 2.4,
            duration: 0.8,
            delay: -1.3,
            ease: "power3.out",
          })
          .to(bearingPart4.position, {
            x: bearingRestPositonX + 2.2,
            duration: 0.8,
            delay: -1.3,
            ease: "power3.out",
          })
          .to(bearingPart3.position, {
            x: bearingRestPositonX + 1.9,
            duration: 0.8,
            delay: -1.3,
            ease: "power3.out",
          })
          .to(bearingPart2.position, {
            x: bearingRestPositonX + 1.6,
            duration: 0.8,
            delay: -1.3,
            ease: "power3.out",
          })
          .to(bearingPart1.position, {
            x: bearingRestPositonX + 1.3,
            duration: 0.8,
            delay: -1.3,
            ease: "power3.out",
          })
          .to(".w-html-container", {
            pointerEvents: "auto",
            opacity: 1,
            duration: 0.5,
          });
      });
      self.add("scrollWheels", (snapIndex) => {
        if (
          animationActive ||
          wheelTextures[snapIndex] === wheelUniformRef.current.texture2.value
        )
          return;

        wheelUniformRef.current.texture2.value = wheelTextures[snapIndex];
        const currentBoardGroup = meshGroupRef.current.children[0];
        const wheelsGroup = currentBoardGroup.children[2].children[0];
        const frontWheel = wheelsGroup.children[2];

        const tl = gsap.timeline();
        tl.to(
          wheelUniformRef.current.mixValue,
          {
            value: 1,

            onComplete: () => {
              wheelUniformRef.current.texture1.value = wheelTextures[snapIndex];
              wheelUniformRef.current.mixValue.value = 0;
            },
          },
          0
        ).to(
          frontWheel.rotation,
          {
            x: frontWheel.rotation.x - Math.PI * 1.5,
            duration: 0.5,
            onStart: () => {
              setAnimationActive(true);
            },
            onComplete: () => {
              setAnimationActive(false);
            },
          },
          0
        );
      });
      self.add("wheelsToFinishTransition", () => {
        const currentBoardGroup = meshGroupRef.current.children[0];
        const wheelsGroup = currentBoardGroup.children[2].children[0];

        const frontWheel = wheelsGroup.children[2];

        const frontBearing = wheelsGroup.children[4].children[6];
        const bearingPart1 = wheelsGroup.children[4].children[3];
        const bearingPart2 = wheelsGroup.children[4].children[0];
        const bearingPart3 = wheelsGroup.children[4].children[1];
        const bearingPart4 = wheelsGroup.children[4].children[2];
        const bearingPart5 = wheelsGroup.children[4].children[4];
        const tl = gsap.timeline();
        console.log(bearingRestPositon);
        tl.to(frontWheel.position, {
          x: bearingRestPositon.frontWheelPositionX,
          duration: 0.5,
          ease: "power3.out",
        })
          .to(
            bearingPart5.position,
            {
              x: bearingRestPositon.bearingRestPositonX,
              duration: 0.4,
              delay: -0.3,
              ease: "power3.out",
            },
            "bearing"
          )
          .to(
            bearingPart4.position,
            {
              x: bearingRestPositon.bearingRestPositonX,
              duration: 0.4,
              delay: -0.3,
              ease: "power3.out",
            },
            "bearing"
          )
          .to(
            bearingPart3.position,
            {
              x: bearingRestPositon.bearingRestPositonX + 0.02,
              duration: 0.4,
              delay: -0.3,
              ease: "power3.out",
            },
            "bearing"
          )
          .to(
            bearingPart2.position,
            {
              x: bearingRestPositon.bearingRestPositonX,
              duration: 0.4,
              delay: -0.3,
              ease: "power3.out",
            },
            "bearing"
          )
          .to(
            bearingPart1.position,
            {
              x: bearingRestPositon.bearingRestPositonX,
              duration: 0.4,
              delay: -0.3,
              ease: "power3.out",
            },
            "bearing"
          )
          .to(
            currentBoardGroup.rotation,
            {
              x: -Math.PI * 2,
              y: Math.PI,
              z: Math.PI * 0.05,
              duration: 1.6,
            },
            "position"
          )
          .to(
            currentBoardGroup.position,
            {
              x: currentBoardGroup.position.x - 0.2,
              z: currentBoardGroup.position.z - 4,
              y: currentBoardGroup.position.y + 0.05,
              duration: 1.6,
              onComplete: () => {
                setCurrentSection("finish");
              },
            },
            "position"
          )
          .to(currentBoardGroup.rotation, {
            y: Math.PI * 3,
            duration: 6,
            delay: 0.1,
            ease: "none",
            repeat: -1,
          });
      });
    });
  });

  const snapScroll = (indexToSnapTo) => {
    setCameraActiveStatus(false);
    if (indexToSnapTo !== undefined) {
      setCurrentDeckIndex(indexToSnapTo);

      cameraControlsRef.current.truck(
        positions[indexToSnapTo].x - camera.position.x,
        0,
        true
      );
      return;
    }
  };

  const selectDeck = () => {
    if (cameraActive) return;
    addSelection([...selections, deckInfo[currentDeckIndex]]);
    setCurrentSection("trucks");

    if (gsapCtx.current)
      gsapCtx.current.boardToTrucksTransition(currentDeckIndex);
  };

  const snapTruckScroll = (indexToSnapTo) => {
    if (indexToSnapTo !== undefined) {
      setCurrentTruckIndex(indexToSnapTo);
      gsapCtx.current.scrollTrucks(indexToSnapTo);
      return;
    }

    if (currentSection !== "trucks") return;
    let snapIndex = null;
    let minDistance = Infinity;

    // trucksHtmlPositions.forEach((p, i) => {
    //   const d = Math.abs(-p - trucksGroupContainerRef.current.position.x);

    //   if (d < minDistance) {
    //     snapIndex = i;
    //     minDistance = d;
    //   }
    //   setCurrentTruckIndex(snapIndex);
    // });
    gsapCtx.current.scrollTrucks(snapIndex);
  };

  const selectTrucks = () => {
    addSelection([...selections, trucksInfo[currentTruckIndex]]);
    setCurrentSection("absorber");
    const selectedTrucks =
      meshGroupRef.current.children[0].children[1].children[currentTruckIndex];

    meshGroupRef.current.children[0].children[1].children = [selectedTrucks];

    gsapCtx.current.trucksToAbsorbersTransition();
  };

  const selectAbsorber = () => {
    setCurrentSection("wheels");
    const color =
      meshGroupRef.current.children[0].children[1].children[0].children[0]
        .children[1].material.color;

    addSelection([...selections, color]);
    setAbsorbersColor(color);

    gsapCtx.current.absorbersToWheelsTransition();
  };

  const selectItem = () => {
    if (currentSection === "trucks") {
      selectTrucks();
    } else if (currentSection === "wheels") {
      // selectWheels();
    }
  };

  const snapWheelsScroll = (wheelskIndex) => {
    if (wheelskIndex !== undefined) {
      setCurrentWheelIndex(wheelskIndex);
      if (gsapCtx.current) gsapCtx.current.scrollWheels(wheelskIndex);
      return;
    }
  };

  const selectWheels = () => {
    addSelection([...selections, wheelsInfo[currentWheelIndex]]);

    gsapCtx.current.wheelsToFinishTransition();
  };

  return (
    <>
      <Center>
        <Environment files="warehouse.hdr" />
        <CameraControls
          ref={cameraControlsRef}
          onChange={(e) => {
            bottomGroupHtmlRef.current.position.setX(
              e.target.camera.position.x
            );
            trucksGroupContainerRef.current.position.setX(
              e.target.camera.position.x
            );
            absorbersGroupContainerRef.current.position.setX(
              e.target.camera.position.x
            );
            wheelsGroupContainerRef.current.position.setX(
              e.target.camera.position.x
            );
          }}
        />

        <group ref={meshGroupRef}>
          {deckInfo.map((info, i) => {
            const w = 0.2;
            const gap = 0.15;
            const xW = w + gap;

            const position = new THREE.Vector3(
              i * xW - deckInfoHaft * xW,
              0,
              0
            );

            positions.push(position);
            return (
              <Deck
                key={i}
                index={i}
                position={position}
                info={info}
                snapScroll={snapScroll}
                currentSection={currentSection}
                absorbersColor={absorbersColor}
                wheelUniformRef={wheelUniformRef}
              />
            );
          })}
        </group>
      </Center>
      <group ref={bottomGroupHtmlRef} position-y={-0.54}>
        <Html center wrapperClass="info-container">
          <div className="text-select-container">
            <p className="text-xs">{deckInfo[currentDeckIndex].name}</p>
            <p>{deckInfo[currentDeckIndex].price}</p>
            <div>
              <button
                onClick={selectDeck}
                className="px-8 py-2 rounded-xl uppercase text-xs bg-black text-white"
              >
                Select
              </button>
            </div>
          </div>
        </Html>
      </group>

      <group ref={trucksGroupContainerRef} name="trucks-container">
        <Html center className="t-html-container">
          <div className="truck-html-container">
            <div className="truck-html-right">
              {trucksInfo.map((t, i) => {
                return (
                  <TrucksHtml
                    info={t}
                    index={i}
                    snapTruckScroll={snapTruckScroll}
                    currentSection={currentSection}
                    key={i}
                    color={true}
                    img={false}
                  />
                );
              })}

              <button
                onClick={selectItem}
                className="px-8 py-2 rounded-xl uppercase text-xs bg-black text-white"
              >
                Select
              </button>
            </div>
          </div>
        </Html>
      </group>
      <group ref={wheelsGroupContainerRef}>
        <Html
          center
          className="w-html-container w-html-container truck-html-right3 container-html"
        >
          <div className="html-right ">
            <div className="container-html-right">
              {wheelsInfo.map((w, i) => {
                return (
                  <WheelsHtml
                    info={w}
                    index={i}
                    key={i}
                    currentSection={currentSection}
                    snapWheelsScroll={snapWheelsScroll}
                  />
                );
              })}
            </div>
          </div>
          <button
            onClick={selectWheels}
            className="px-8 py-2 rounded-xl uppercase text-xs bg-black text-white"
          >
            Select
          </button>
        </Html>
      </group>
      <group ref={absorbersGroupContainerRef} name="trucks-container">
        <Html center className="t-html-container">
          <div className="truck-html-container">
            <div className="truck-html-right2">
              <HexColorPicker
                className="picker"
                color={initialAbsorbersColor}
                onChange={(color) => gsapCtx.current.colorAbsorbers(color)}
              />

              <button
                onClick={selectAbsorber}
                className="px-8 py-2 rounded-xl uppercase text-xs bg-black text-white"
              >
                Select
              </button>
            </div>
          </div>
        </Html>
      </group>
    </>
  );
};

export default Scene;
