import { useEffect, useRef, type CSSProperties } from 'react';
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';

const VERT = `#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform float uCenterX;
uniform float uCenterY;
uniform float uZoom;

out vec4 fragColor;

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) +
    i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * snoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return value * 0.5 + 0.5;
}

float grain(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 applySaturation(vec3 color, float saturation) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(luma), color, saturation);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 centered = uv - 0.5 - vec2(uCenterX, uCenterY) * 0.5;
  centered.x *= uResolution.x / uResolution.y;

  float time = uTime * uTimeSpeed;
  float rotation = radians(uBlendAngle) + time * uRotationAmount * 0.00003;
  vec2 p = rotate2d(rotation) * centered / max(uZoom, 0.001);

  vec2 warpSeed = p * max(uWarpFrequency, 0.001) + time * uWarpSpeed * 0.06;
  vec2 warp = vec2(
    fbm(warpSeed),
    fbm(warpSeed + vec2(5.2, 1.3))
  ) - 0.5;
  p += warp * uWarpStrength * (uWarpAmplitude / 50.0) * 0.22;

  float noiseField = fbm(p * max(uNoiseScale, 0.001) + time * 0.08);
  float angle = radians(uBlendAngle);
  vec2 blendDir = vec2(cos(angle), sin(angle));
  float axis = dot(uv - 0.5, blendDir) + 0.5;
  float t = axis + (noiseField - 0.5) * (0.42 * uWarpStrength) + uColorBalance * 0.2;
  t = clamp(t, 0.0, 1.0);

  float softness = max(uBlendSoftness, 0.001);
  float mid = clamp(0.5 + uColorBalance * 0.25, 0.15, 0.85);
  vec3 low = mix(uColor1, uColor2, smoothstep(0.0, mid + softness, t));
  vec3 color = mix(low, uColor3, smoothstep(mid - softness, 1.0, t));

  float shade = fbm(p * 2.25 - time * 0.035);
  color *= 0.86 + shade * 0.22;

  float vignette = smoothstep(0.95, 0.18, length(centered));
  color *= 0.72 + vignette * 0.34;

  vec2 grainUv = gl_FragCoord.xy * max(uGrainScale, 0.001);
  grainUv += uGrainAnimated > 0.5 ? vec2(time * 47.0, time * 31.0) : vec2(0.0);
  color += (grain(grainUv) - 0.5) * uGrainAmount;

  color = (color - 0.5) * uContrast + 0.5;
  color = applySaturation(color, uSaturation);
  color = pow(max(color, 0.0), vec3(1.0 / max(uGamma, 0.001)));

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

export interface GrainientProps {
  color1?: string;
  color2?: string;
  color3?: string;
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  className?: string;
  style?: CSSProperties;
}

const defaults = {
  color1: '#252325',
  color2: '#3b3b3d',
  color3: '#422063',
  timeSpeed: 2.1,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0.1,
  grainScale: 2,
  grainAnimated: false,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9
};

function toRgb(hex: string) {
  const color = new Color(hex);
  return [color.r, color.g, color.b];
}

export default function Grainient(props: GrainientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<GrainientProps>(props);
  propsRef.current = props;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const renderer = new Renderer({
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    const gl = renderer.gl;
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uColor1: { value: toRgb(props.color1 ?? defaults.color1) },
        uColor2: { value: toRgb(props.color2 ?? defaults.color2) },
        uColor3: { value: toRgb(props.color3 ?? defaults.color3) },
        uTimeSpeed: { value: props.timeSpeed ?? defaults.timeSpeed },
        uColorBalance: { value: props.colorBalance ?? defaults.colorBalance },
        uWarpStrength: { value: props.warpStrength ?? defaults.warpStrength },
        uWarpFrequency: { value: props.warpFrequency ?? defaults.warpFrequency },
        uWarpSpeed: { value: props.warpSpeed ?? defaults.warpSpeed },
        uWarpAmplitude: { value: props.warpAmplitude ?? defaults.warpAmplitude },
        uBlendAngle: { value: props.blendAngle ?? defaults.blendAngle },
        uBlendSoftness: { value: props.blendSoftness ?? defaults.blendSoftness },
        uRotationAmount: { value: props.rotationAmount ?? defaults.rotationAmount },
        uNoiseScale: { value: props.noiseScale ?? defaults.noiseScale },
        uGrainAmount: { value: props.grainAmount ?? defaults.grainAmount },
        uGrainScale: { value: props.grainScale ?? defaults.grainScale },
        uGrainAnimated: { value: props.grainAnimated ? 1 : 0 },
        uContrast: { value: props.contrast ?? defaults.contrast },
        uGamma: { value: props.gamma ?? defaults.gamma },
        uSaturation: { value: props.saturation ?? defaults.saturation },
        uCenterX: { value: props.centerX ?? defaults.centerX },
        uCenterY: { value: props.centerY ?? defaults.centerY },
        uZoom: { value: props.zoom ?? defaults.zoom }
      }
    });
    const mesh = new Mesh(gl, { geometry, program });

    gl.canvas.style.display = 'block';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    root.appendChild(gl.canvas);

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    resize();

    let raf = 0;
    const update = (now: number) => {
      const current = { ...defaults, ...propsRef.current };
      program.uniforms.uTime.value = now * 0.001;
      program.uniforms.uColor1.value = toRgb(current.color1);
      program.uniforms.uColor2.value = toRgb(current.color2);
      program.uniforms.uColor3.value = toRgb(current.color3);
      program.uniforms.uTimeSpeed.value = current.timeSpeed;
      program.uniforms.uColorBalance.value = current.colorBalance;
      program.uniforms.uWarpStrength.value = current.warpStrength;
      program.uniforms.uWarpFrequency.value = current.warpFrequency;
      program.uniforms.uWarpSpeed.value = current.warpSpeed;
      program.uniforms.uWarpAmplitude.value = current.warpAmplitude;
      program.uniforms.uBlendAngle.value = current.blendAngle;
      program.uniforms.uBlendSoftness.value = current.blendSoftness;
      program.uniforms.uRotationAmount.value = current.rotationAmount;
      program.uniforms.uNoiseScale.value = current.noiseScale;
      program.uniforms.uGrainAmount.value = current.grainAmount;
      program.uniforms.uGrainScale.value = current.grainScale;
      program.uniforms.uGrainAnimated.value = current.grainAnimated ? 1 : 0;
      program.uniforms.uContrast.value = current.contrast;
      program.uniforms.uGamma.value = current.gamma;
      program.uniforms.uSaturation.value = current.saturation;
      program.uniforms.uCenterX.value = current.centerX;
      program.uniforms.uCenterY.value = current.centerY;
      program.uniforms.uZoom.value = current.zoom;

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      if (gl.canvas.parentNode === root) {
        root.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={props.className}
      style={{ width: '100%', height: '100%', position: 'relative', ...props.style }}
    />
  );
}
