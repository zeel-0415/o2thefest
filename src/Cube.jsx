// src/Cube.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import img1Url from "/assets/IMG_6576.jpeg";
import img2Url from "/assets/IMG_5764.png";
import "./style.css";

export default function Cube({ className }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#071826");

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    // load textures
    const loader = new THREE.TextureLoader();
    const tex1 = loader.load(img1Url);
    const tex2 = loader.load(img2Url);

    // Materials for 6 faces: [px, nx, py, ny, pz, nz]
    const materials = [
      new THREE.MeshStandardMaterial({ map: tex1 }), // +X
      new THREE.MeshStandardMaterial({ map: tex2 }), // -X
      new THREE.MeshStandardMaterial({ color: 0xffb300 }), // +Y (accent)
      new THREE.MeshStandardMaterial({ color: 0x0a2940 }), // -Y (dark blue)
      new THREE.MeshStandardMaterial({ map: tex1 }), // +Z
      new THREE.MeshStandardMaterial({ map: tex2 }) // -Z
    ];

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(geometry, materials);
    cube.rotation.x = 0.4;
    cube.rotation.y = 0.4;
    scene.add(cube);

    let frameId;
    function animate() {
      cube.rotation.x += 0.007;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}
