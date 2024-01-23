import { useGLTF, useTexture } from "@react-three/drei";

const Bearings = (props) => {
  const { nodes, materials } = useGLTF("/bearings.glb");
  return (
    <group {...props}>
      <mesh
        name="part2"
        castShadow
        receiveShadow
        geometry={nodes.part2.geometry}
        material={materials["Material.003"]}
        position={[0.762, 0.316, 1.996]}
      />
      <group position={[0.785, 0.317, 1.996]} name="part3">
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.part3_1.geometry}
          material={materials.bearingsMaterial}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.part3_2.geometry}
          material={materials.bearingsBlack}
        />
      </group>
      <mesh
        name="part4"
        castShadow
        receiveShadow
        geometry={nodes.part4.geometry}
        material={materials["Material.004"]}
        position={[0.766, 0.317, 1.996]}
      />
      <mesh
        name="part1"
        castShadow
        receiveShadow
        geometry={nodes.part1.geometry}
        material={materials["Material.003"]}
        position={[0.769, 0.316, 1.996]}
      />
      <mesh
        name="part5"
        castShadow
        receiveShadow
        geometry={nodes.part5.geometry}
        material={materials["Material.003"]}
        position={[0.77, 0.316, 1.996]}
      />
      <group position={[0.001, 0.316, -0.009]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bearings_1.geometry}
          material={materials.bearingsBlack}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bearings_2.geometry}
          material={materials.bearingsMaterial}
        />
      </group>
      <group position={[0.001, 0.316, -0.009]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.bearings002_1.geometry}
          material={materials.bearingsBlack}
        />
        <mesh
          visible={false}
          castShadow
          receiveShadow
          geometry={nodes.bearings002_2.geometry}
          material={materials.bearingsMaterial}
        />
      </group>
    </group>
  );
};

export default Bearings;
