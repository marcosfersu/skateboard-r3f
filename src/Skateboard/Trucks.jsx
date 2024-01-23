import { useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Wheels from "./Wheels";

const Trucks = (props) => {
  const { nodes, materials } = useGLTF("/trucks.glb");
  const { index, info, currentSection, absorbersColor, wheelUniformRef } =
    props;

  const trucksTexture = useTexture(info.texture_url);
  const trucksMaterial = materials["Material.003"].clone();
  const trucksMaterial2 = materials["Material.002"].clone();

  trucksTexture.flipY = false;
  trucksMaterial.map = trucksTexture;
  trucksMaterial.transparent = true;
  trucksMaterial2.transparent = true;

  useFrame(({ scene }) => {
    if (currentSection === "trucks") {
      const currentTrucksGroup =
        scene.children[0].children[0].children[0].children[0].children[0]
          .children[1];
      trucksMaterial.opacity =
        1 - Math.abs(currentTrucksGroup.children[index].position.z * 10);
      trucksMaterial2.opacity =
        1 - Math.abs(currentTrucksGroup.children[index].position.z * 10);
    }

    if (currentSection === "absorberCurrent") {
      trucksMaterial.opacity = 0.1;
    }

    if (currentSection === "wheels") {
      const newColor = new THREE.Color(absorbersColor);
      trucksMaterial2.color = newColor;
    }
  });

  return (
    <group {...props}>
      <group position={[0.003, 0.372, 1.977]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube007.geometry}
          material={trucksMaterial}
        />
        <mesh
          name="suspensores"
          castShadow
          receiveShadow
          geometry={nodes.Cube007_1.geometry}
          material={trucksMaterial2}
        />
      </group>
      <group position={[-0.005, 0.372, -1.991]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube008.geometry}
          material={trucksMaterial}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube008_1.geometry}
          material={trucksMaterial2}
        />
      </group>
    </group>
  );
};

export default Trucks;
