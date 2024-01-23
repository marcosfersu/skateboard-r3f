import { useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import Trucks from "./Trucks";

import { trucksInfo } from "../info.js";
import Wheels from "./Wheels.jsx";

const Deck = (props) => {
  const { nodes, materials } = useGLTF("/skate.glb");
  const {
    info,
    position,
    index,
    snapScroll,
    currentSection,
    absorbersColor,
    wheelUniformRef,
  } = props;

  const groupRef = useRef();

  const { texture_url } = info;

  const texture = useTexture(texture_url);
  texture.flipY = false;

  const { camera } = useThree();

  useEffect(() => {
    groupRef.current.position.copy(position);
  }, []);

  useFrame((state, delta) => {
    if (currentSection === "board") {
      const cameraX = camera.position.x;
      const scaleFactor = Math.cos((cameraX - position.x) * 1);

      groupRef.current.scale.x = 0.8 * Math.max(0.8, scaleFactor);
      groupRef.current.scale.y = 0.8 * Math.max(0.8, scaleFactor);
      groupRef.current.scale.z = 0.8 * Math.max(0.8, scaleFactor);
    }
  });

  const moveCameraToDeck = () => {
    if (currentSection === "board") {
      snapScroll(index);
    }
  };

  return (
    <group ref={groupRef} name="deck-group" onClick={moveCameraToDeck}>
      <mesh
        geometry={nodes.Deck.geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        scale={0.15}
      >
        <meshBasicMaterial
          side={2}
          map={texture}
          transparent={true}
          opacity={1}
        />
      </mesh>

      <group visible={false} name="trucks-group-2" position-z={0.18}>
        {trucksInfo.map((t, i) => (
          <Trucks
            key={i}
            index={i}
            info={t}
            scale={0.15}
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, 0, 0.1]}
            currentSection={currentSection}
            absorbersColor={absorbersColor}
            wheelUniformRef={wheelUniformRef}
          />
        ))}
      </group>
      <group name="wheels-group-2">
        <Wheels
          wheelUniformRef={wheelUniformRef}
          scale={0.15}
          rotation={[-Math.PI * 0.5, 0, 0]}
          position={[0, 0, 0.14]}
        />
      </group>
    </group>
  );
};

useGLTF.preload("/skate.glb");

export default Deck;
