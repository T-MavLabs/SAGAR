import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Import all 7 of your new GeoJSON files ---
import africaData from './assets/AF.json';
import antarcticaData from './assets/AN.json';
import asiaData from './assets/AS.json';
import europeData from './assets/EU.json';
import northAmericaData from './assets/NA.json';
import oceaniaData from './assets/OC.json';
import southAmericaData from './assets/SA.json';

// --- Helper function to convert Lat/Lon to a 3D vector ---
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// --- Helper function to robustly extract features from any GeoJSON structure ---
function extractFeatures(geoJson) {
  if (!geoJson) return [];
  if (geoJson.type === 'FeatureCollection') {
    return geoJson.features || [];
  }
  if (geoJson.type === 'Feature') {
    return [geoJson];
  }
  if (geoJson.type === 'Polygon' || geoJson.type === 'MultiPolygon') {
    return [{
      type: 'Feature',
      geometry: geoJson,
      properties: {}
    }];
  }
  return [];
}

// (Removed point-sphere approach)

// --- Component to generate Landmasses and Borders ---
function Landmasses() {
  // Build an alpha map for land and 3D border lines
  const {
    landTexture,
    borderLines
  } = useMemo(() => {
    const width = 4096;
    const height = 2048;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    // start transparent
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    const linePoints = [];
    const allFeatures = [...extractFeatures(africaData), ...extractFeatures(antarcticaData), ...extractFeatures(asiaData), ...extractFeatures(europeData), ...extractFeatures(northAmericaData), ...extractFeatures(oceaniaData), ...extractFeatures(southAmericaData)];
    const lngLatToXY = (lng, lat) => ({
      x: (lng + 180) / 360 * width,
      y: (-lat + 90) / 180 * height
    });
    const drawRing = ring => {
      if (!Array.isArray(ring) || ring.length < 3) return;
      ring.forEach((coord, i) => {
        if (!Array.isArray(coord) || coord.length < 2) return;
        const {
          x,
          y
        } = lngLatToXY(coord[0], coord[1]);
        if (i === 0) ctx.moveTo(x, y);else ctx.lineTo(x, y);
      });
    };
    allFeatures.forEach(feature => {
      const geom = feature && feature.geometry;
      if (!geom || !geom.coordinates) return;
      const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      if (!Array.isArray(polygons)) return;
      polygons.forEach(poly => {
        if (!Array.isArray(poly) || poly.length === 0) return;
        const exterior = poly[0];
        const holes = poly.slice(1) || [];

        // Fill with even-odd to cut out holes
        ctx.beginPath();
        drawRing(exterior);
        holes.forEach(drawRing);
        ctx.closePath();
        ctx.fill('evenodd');

        // Build 3D border lines slightly above the surface
        const border = (exterior || []).filter(c => Array.isArray(c) && c.length >= 2).map(c => latLonToVector3(c[1], c[0], 2.04));
        for (let i = 0; i < border.length - 1; i++) {
          linePoints.push(border[i], border[i + 1]);
        }
        if (border.length > 1) linePoints.push(border[border.length - 1], border[0]);
      });
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const borderGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    return {
      landTexture: texture,
      borderLines: borderGeometry
    };
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("mesh", {
    renderOrder: 1
  }, /*#__PURE__*/React.createElement("sphereGeometry", {
    args: [2.02, 64, 64]
  }), /*#__PURE__*/React.createElement("meshBasicMaterial", {
    color: "#021631",
    toneMapped: false,
    transparent: false,
    opacity: 1,
    depthWrite: false,
    depthTest: false
  })), /*#__PURE__*/React.createElement("mesh", {
    renderOrder: 2
  }, /*#__PURE__*/React.createElement("sphereGeometry", {
    args: [2.03, 64, 64]
  }), /*#__PURE__*/React.createElement("meshStandardMaterial", {
    color: "#000000",
    alphaMap: landTexture,
    transparent: true,
    opacity: 1.5,
    depthWrite: false,
    depthTest: false
  })), /*#__PURE__*/React.createElement("mesh", {
    renderOrder: -1
  }, /*#__PURE__*/React.createElement("sphereGeometry", {
    args: [2.025, 64, 64]
  }), /*#__PURE__*/React.createElement("meshBasicMaterial", {
    colorWrite: false,
    depthWrite: true,
    depthTest: true
  })), /*#__PURE__*/React.createElement("lineSegments", {
    geometry: borderLines,
    renderOrder: 3
  }, /*#__PURE__*/React.createElement("lineBasicMaterial", {
    color: "#ffffff",
    depthTest: true,
    depthWrite: false
  })));
}

// --- Main Scene Content ---
function GlobeContent(props) {
  const groupRef = useRef();
  const dataPoints = (props && props.dataPoints) || [];
  const [isHovered, setIsHovered] = React.useState(false);
  
  useFrame((_, delta) => {
    if (groupRef.current && !isHovered) {
      groupRef.current.rotation.y += delta * 0.02; // Slower, smoother rotation
    }
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ambientLight", {
    intensity: 0.5
  }), /*#__PURE__*/React.createElement("directionalLight", {
    position: [5, 10, 5],
    intensity: 0.8
  }), /*#__PURE__*/React.createElement("group", {
    ref: groupRef
  }, /*#__PURE__*/React.createElement("mesh", {
    renderOrder: 2.2
  }, /*#__PURE__*/React.createElement("sphereGeometry", {
    args: [2.031, 64, 64]
  }), /*#__PURE__*/React.createElement("meshBasicMaterial", {
    wireframe: true,
    color: "rgb(17, 50, 90)",
    depthTest: true,
    depthWrite: false
  })), /*#__PURE__*/React.createElement(Suspense, {
    fallback: null
  }, /*#__PURE__*/React.createElement(Landmasses, null)), dataPoints && dataPoints.length > 0 && /*#__PURE__*/React.createElement("group", null, dataPoints.map((p, i) => {
    const v = latLonToVector3(p.decimalLatitude, p.decimalLongitude, 2.06);
    return /*#__PURE__*/React.createElement("mesh", {
      key: i,
      position: [v.x, v.y, v.z],
      renderOrder: 5,
      onPointerOver: (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setIsHovered(true); // Pause globe rotation
        // Dispatch custom event with data point info
        window.dispatchEvent(new CustomEvent('globe-point-hover', { 
          detail: { 
            dataPoint: p, 
            position: { x: e.clientX, y: e.clientY }
          } 
        }));
      },
      onPointerOut: (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        setIsHovered(false); // Resume globe rotation
        window.dispatchEvent(new CustomEvent('globe-point-leave'));
      }
    }, /*#__PURE__*/React.createElement("sphereGeometry", {
      args: [0.005, 8, 8]
    }), /*#__PURE__*/React.createElement("meshBasicMaterial", {
      color: "#ef4444",
      depthTest: true,
      depthWrite: false
    }));
  }))));
}

// --- Main Exported Globe Component ---
function CameraMonitor({ onChange }) {
  const { camera } = useThree();
  useFrame(() => {
    if (typeof onChange === 'function') {
      const distance = Math.sqrt(camera.position.x * camera.position.x + camera.position.y * camera.position.y + camera.position.z * camera.position.z);
      onChange(distance);
    }
  });
  return null;
}

// Camera Reset Component
function CameraReset({ onReset }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  
  // Store initial camera position and target
  const initialPosition = useRef([0, 0, 7.5]);
  const initialTarget = useRef([0, 0, 0]);
  
  // Expose reset function to parent
  React.useEffect(() => {
    if (onReset) {
      onReset(() => {
        if (controlsRef.current) {
          // Reset camera position
          camera.position.set(...initialPosition.current);
          camera.lookAt(...initialTarget.current);
          // Reset controls
          controlsRef.current.target.set(...initialTarget.current);
          controlsRef.current.update();
        }
      });
    }
  }, [camera, onReset]);
  
  return /*#__PURE__*/React.createElement(OrbitControls, {
    ref: controlsRef,
    enablePan: false,
    enableZoom: true,
    minDistance: 4.5,
    maxDistance: 10,
    autoRotate: false
  });
}

export function Globe(props) {
  const onCameraDistanceChange = props && props.onCameraDistanceChange;
  const onResetCamera = props && props.onResetCamera;
  const showStarsOnly = !!(props && props.showStarsOnly);
  const dataPoints = (props && props.dataPoints) || [];
  return /*#__PURE__*/React.createElement(Canvas, {
    camera: {
      position: [0, 0, 7.5],
      fov: 45
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    radius: 100,
    depth: 50,
    count: 4000,
    factor: 4,
    saturation: 0,
    fade: true,
    speed: 1
  }), /*#__PURE__*/React.createElement(Sparkles, {
    count: 250,
    size: 2.5,
    speed: 0.4,
    opacity: 0.5,
    color: "white",
    scale: [200, 200, 200]
  }), /*#__PURE__*/React.createElement(Suspense, {
    fallback: null
  }, showStarsOnly ? null : /*#__PURE__*/React.createElement(GlobeContent, { dataPoints: dataPoints })), /*#__PURE__*/React.createElement(CameraReset, { onReset: onResetCamera }), /*#__PURE__*/React.createElement(CameraMonitor, { onChange: onCameraDistanceChange }));
}
