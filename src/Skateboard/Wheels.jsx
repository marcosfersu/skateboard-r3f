import { useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";

import { wheelsInfo } from "../info.js";
import Bearings from "./Bearings.jsx";

const WheelsMaterial = ({ wheelUniformRef, wheelRoughness }) => {
  const blackTexture = useTexture("black.jpg");
  const wheelsTexture = useTexture(wheelsInfo[0].texture_url);
  const wheelsTexture2 = useTexture(wheelsInfo[1].texture_url);
  wheelsTexture.flipY = false;
  wheelsTexture2.flipY = false;

  return (
    <meshStandardMaterial
      map={blackTexture}
      transparent={true}
      needsUpdate={true}
      roughness={wheelRoughness}
      onBeforeCompile={(shader) => {
        wheelUniformRef.current = shader.uniforms;
        wheelUniformRef.current.texture1 = { value: wheelsTexture };
        wheelUniformRef.current.texture2 = { value: wheelsTexture2 };
        wheelUniformRef.current.mixValue = { value: 0 };

        shader.fragmentShader = `
              uniform sampler2D texture1;
              uniform sampler2D texture2;
              uniform float mixValue;
              ${shader.fragmentShader.replace(
                "#include <map_fragment>",
                `

                vec4 tex1 = texture2D( texture1, vMapUv );
                vec4 tex2 = texture2D( texture2, vMapUv );
                // tex2 = vec4( mix( pow( tex2.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), tex2.rgb * 0.0773993808, vec3( lessThanEqual( tex2.rgb, vec3( 0.04045 ) ) ) ), tex2.w );

                vec4 sampledDiffuseColor = mix(tex1, tex2, mixValue);

                // if(mixValue > 0.01){
                  sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
                // }

                diffuseColor *= sampledDiffuseColor;
                `
              )}
            `;
      }}
    />
  );
};

const Wheels = (props) => {
  const { nodes, materials } = useGLTF("/wheels.glb");
  const groupRef = useRef();

  const { wheelUniformRef } = props;

  const wheelsTexture = useTexture(wheelsInfo[0].texture_url);
  const wheelRoughness = materials["wheelMaterial"].roughness;

  wheelsTexture.flipY = false;

  return (
    <group {...props} ref={groupRef} visible={false}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002.geometry}
        position={[-0.706, 0.316, 1.996]}
      >
        <WheelsMaterial
          wheelUniformRef={wheelUniformRef}
          wheelRoughness={wheelRoughness}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder001.geometry}
        position={[-0.706, 0.316, 1.996]}
      >
        <WheelsMaterial
          wheelUniformRef={wheelUniformRef}
          wheelRoughness={wheelRoughness}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder003.geometry}
        position={[-0.706, 0.316, 1.996]}
      >
        <WheelsMaterial
          wheelUniformRef={wheelUniformRef}
          wheelRoughness={wheelRoughness}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder004.geometry}
        position={[-0.706, 0.316, 1.996]}
      >
        <WheelsMaterial
          wheelUniformRef={wheelUniformRef}
          wheelRoughness={wheelRoughness}
        />
      </mesh>
      {/* <WheelsMaterial
        wheelUniformRef={wheelUniformRef}
        wheelRoughness={wheelRoughness}
      /> */}
      <Bearings />
    </group>
  );
};

export default Wheels;
