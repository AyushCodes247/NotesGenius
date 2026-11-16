import { useEffect, useMemo, useRef } from "react";

import { Canvas , useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, useTexture } from "@react-three/drei";

import * as THREE from "three";

import vertexShader from "./shaders/flutedGlass.vertex.glsl?raw";
import fragmentShader from "./shaders/flutedGlass.fragment.glsl?raw";

import heroTexture from "../../../assets/hero-texture.jpg";

type FlutedGlassProps = {
  texture?: string;
  segments?: number;
  rotation?: number;
  overlayOpacity?: number;
};

const FlutedGlass = ({
  texture: textureSource = heroTexture,
  segments = 80,
  rotation = 0,
  overlayOpacity = 25,
}: FlutedGlassProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const mouseTarget = useRef(0.5);

  const texture = useTexture(textureSource);

  const { size, camera } = useThree();

  const image = texture.image as HTMLImageElement;

  const imageAspect =
    image.naturalWidth > 0 && image.naturalHeight > 0
      ? image.naturalWidth / image.naturalHeight
      : 1;

  const uniforms = useMemo(
    () => ({
      resolution: {
        value: new THREE.Vector4(size.width, Math.max(size.height, 1), 0, 0),
      },

      uTexture: {
        value: texture,
      },

      uMotionValue: {
        value: 0.5,
      },

      uRotation: {
        value: rotation,
      },

      uSegments: {
        value: segments,
      },

      uOverlayColor: {
        value: new THREE.Vector3(0, 0, 0),
      },

      uOverlayColorWhite: {
        value: new THREE.Vector3(1, 1, 1),
      },

      uImageAspect: {
        value: imageAspect,
      },

      uOverlayOpacity: {
        value: overlayOpacity,
      },
    }),
    [
      texture,
      imageAspect,
      size.width,
      size.height,
      segments,
      rotation,
      overlayOpacity,
    ],
  );

  useEffect(() => {
    const orthographicCamera = camera as THREE.OrthographicCamera;

    const aspect = size.width / Math.max(size.height, 1);

    orthographicCamera.left = -aspect;
    orthographicCamera.right = aspect;
    orthographicCamera.top = 1;
    orthographicCamera.bottom = -1;

    orthographicCamera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useEffect(() => {
    if (!meshRef.current) {
      return;
    }

    const aspect = size.width / Math.max(size.height, 1);

    meshRef.current.scale.set(aspect, 1, 1);
  }, [size.width, size.height]);

  useEffect(() => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.resolution.value.set(
      size.width,
      Math.max(size.height, 1),
      0,
      0,
    );
  }, [size.width, size.height]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const normalizedX = event.clientX / window.innerWidth;

      const centeredX = 0.5 - normalizedX;

      mouseTarget.current = 0.5 + centeredX * 5;
    };

    const handlePointerLeave = () => {
      mouseTarget.current = 0.5;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  useFrame((_, delta) => {
    if (!materialRef.current) {
      return;
    }

    const current = materialRef.current.uniforms.uMotionValue.value;

    const target = mouseTarget.current;

    const smoothness = 6;

    const nextValue = THREE.MathUtils.lerp(
      current,
      target,
      1 - Math.exp(-smoothness * delta),
    );

    materialRef.current.uniforms.uMotionValue.value = nextValue;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />

      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
      />
    </mesh>
  );
};

type FlutedSceneProps = {
  texture?: string;
  segments?: number;
  rotation?: number;
  overlayOpacity?: number;
};

const FlutedScene = ({
  texture,
  segments = 80,
  rotation = 0,
  overlayOpacity = 25,
}: FlutedSceneProps) => {
  return (
    <Canvas
      className="!absolute !inset-0 !h-full !w-full"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      <OrthographicCamera
        makeDefault
        position={[0, 0, 1]}
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={0.1}
        far={10}
      />

      <FlutedGlass
        texture={texture}
        segments={segments}
        rotation={rotation}
        overlayOpacity={overlayOpacity}
      />
    </Canvas>
  );
};

export default FlutedScene;
