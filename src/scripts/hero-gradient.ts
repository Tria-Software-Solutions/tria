import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function buildFragShader(octaves: number): string {
  return `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTimeSpeed;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform float uCenterX;
uniform float uCenterY;
uniform float uZoom;
uniform vec2 uMouse;        // mouse UV position (0-1)
uniform float uReveal;      // 0→1 GSAP reveal progress

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
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 0.5;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < ${octaves}; i++) {
    value += amp * snoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return value * 0.5 + 0.5;
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

  /* ── Mouse interaction ── */
  // Shift the noise field center toward the mouse (subtle pull)
  vec2 mouseDelta = (uMouse - 0.5) * 0.18 * uReveal;
  centered += mouseDelta;

  float rotation = radians(uBlendAngle) + time * uRotationAmount * 0.00003;
  vec2 p = rotate2d(rotation) * centered / max(uZoom, 0.001);

  // Additional mouse-driven warping
  float mouseMag = length(uMouse - 0.5) * 2.0;
  float mouseWarp = smoothstep(0.0, 1.0, mouseMag) * 0.25 * uReveal;
  vec2 mouseWarpDir = normalize(uMouse - 0.5 + vec2(0.001));
  p += mouseWarpDir * mouseWarp * 0.1;

  vec2 warpSeed = p * max(uWarpFrequency, 0.001) + time * uWarpSpeed * 0.06;
  vec2 warp = vec2(fbm(warpSeed), fbm(warpSeed + vec2(5.2, 1.3))) - 0.5;
  p += warp * uWarpStrength * (uWarpAmplitude / 50.0) * 0.22;

  float noiseField = fbm(p * max(uNoiseScale, 0.001) + time * 0.08);

  float angle = radians(uBlendAngle);
  vec2 blendDir = vec2(cos(angle), sin(angle));
  float axis = dot(uv - 0.5, blendDir) + 0.5;
  float t = axis + (noiseField - 0.5) * (0.42 * uWarpStrength);
  t = clamp(t, 0.0, 1.0);

  float softness = max(uBlendSoftness, 0.001);
  float mid = 0.5;
  vec3 low = mix(uColor1, uColor2, smoothstep(0.0, mid + softness, t));
  vec3 color = mix(low, uColor3, smoothstep(mid - softness, 1.0, t));

  /* ── Mouse glow ── */
  vec2 mouseUV = uv - uMouse;
  mouseUV.x *= uResolution.x / uResolution.y;
  float mouseDist = length(mouseUV);
  float mouseGlow = exp(-mouseDist * 3.5) * 0.18 * uReveal;
  color += mouseGlow;

  float shade = fbm(p * 2.25 - time * 0.035);
  color *= 0.86 + shade * 0.22;

  float vignette = smoothstep(0.95, 0.18, length(centered));
  color *= 0.72 + vignette * 0.34;

  color = (color - 0.5) * uContrast + 0.5;
  color = applySaturation(color, uSaturation);
  color = pow(max(color, 0.0), vec3(1.0 / max(uGamma, 0.001)));

  /* ── Reveal: gracefully fade in ── */
  color *= smoothstep(0.0, 1.0, uReveal);

  // Subtle brightness ramp during reveal
  color *= 0.4 + 0.6 * uReveal;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
}

/** Pick shader complexity and DPR based on device class */
function getDeviceConfig() {
  const w = window.innerWidth;
  if (w < 576) {
    return { octaves: 3, dpr: 1 };
  }
  if (w < 992) {
    return { octaves: 3, dpr: 1.5 };
  }
  return {
    octaves: 4,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  };
}

function toRgb(hex: string) {
  const c = new Color(hex);
  return [c.r, c.g, c.b];
}

export interface GradProps {
  color1?: string;
  color2?: string;
  color3?: string;
  timeSpeed?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  /** Master intensity: 0=off, 1=full. Overridden during GSAP reveal. */
  revealInitial?: number;
  /** Enable mouse-interactive effects (default true) */
  enableMouse?: boolean;
  /** How strongly the noise field pulls toward cursor */
  mouseStrength?: number;
}

const DEFAULTS: Required<GradProps> = {
  color1: "#252325",
  color2: "#3b3b3d",
  color3: "#422063",
  timeSpeed: 2.1,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
  revealInitial: 0,
  enableMouse: true,
  mouseStrength: 1,
};

export function initGradient(container: HTMLElement, props?: GradProps) {
  const p = { ...DEFAULTS, ...props };

  const config = getDeviceConfig();
  const FRAG = buildFragShader(config.octaves);

  const renderer = new Renderer({
    alpha: false,
    antialias: false,
    dpr: config.dpr,
  });
  const gl = renderer.gl;
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uColor1: { value: toRgb(p.color1) },
      uColor2: { value: toRgb(p.color2) },
      uColor3: { value: toRgb(p.color3) },
      uTimeSpeed: { value: p.timeSpeed },
      uWarpStrength: { value: p.warpStrength },
      uWarpFrequency: { value: p.warpFrequency },
      uWarpSpeed: { value: p.warpSpeed },
      uWarpAmplitude: { value: p.warpAmplitude },
      uBlendAngle: { value: p.blendAngle },
      uBlendSoftness: { value: p.blendSoftness },
      uRotationAmount: { value: p.rotationAmount },
      uNoiseScale: { value: p.noiseScale },
      uContrast: { value: p.contrast },
      uGamma: { value: p.gamma },
      uSaturation: { value: p.saturation },
      uCenterX: { value: p.centerX },
      uCenterY: { value: p.centerY },
      uZoom: { value: p.zoom },
      uMouse: { value: [0.5, 0.5] },
      uReveal: { value: p.revealInitial },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });

  gl.canvas.style.display = "block";
  gl.canvas.style.width = "100%";
  gl.canvas.style.height = "100%";
  gl.canvas.style.willChange = "transform";

  // Start invisible for reveal animation (set via inline style to avoid flash)
  gl.canvas.style.opacity = "0";

  container.appendChild(gl.canvas);

  /* ── Parallax: find sibling content element ── */
  const heroSection = container.parentElement;
  const heroContent =
    heroSection && heroSection.querySelector<HTMLElement>(".tria-banner-content");

  const resize = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = [w, h];

    const baseZoom = p.zoom;
    const responsiveZoom = w < 576
      ? baseZoom * 1.6
      : w < 768
        ? baseZoom * 1.25
        : baseZoom;
    program.uniforms.uZoom.value = responsiveZoom;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  /* ── Mouse tracking with smooth lerp ── */
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  function onPointerMove(e: PointerEvent) {
    const rect = container.getBoundingClientRect();
    mouse.tx = (e.clientX - rect.left) / rect.width;
    mouse.ty = (e.clientY - rect.top) / rect.height;
  }

  if (p.enableMouse) {
    container.addEventListener("pointermove", onPointerMove, { passive: true });

    // Touch devices: reset to center on touch end
    container.addEventListener("touchend", () => {
      mouse.tx = 0.5;
      mouse.ty = 0.5;
    }, { passive: true });
  }

  /* ── Render loop ── */
  let raf = 0;
  let paused = false;
  let lastTime = 0;
  let elapsed = 0;

  const update = (now: number) => {
    if (!paused) {
      if (lastTime === 0) lastTime = now;
      elapsed += now - lastTime;
      lastTime = now;

      // Smooth mouse interpolation (lerp)
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      // Update uniforms
      program.uniforms.uTime.value = elapsed * 0.001;
      program.uniforms.uMouse.value = [mouse.x, mouse.y];
      renderer.render({ scene: mesh });

      // ── Parallax ──
      if (heroContent && heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const heroH = rect.height;
        const scrollP = Math.max(0, Math.min(1, -rect.top / heroH));
        heroContent.style.transform = `translateY(${-scrollP * 60}px)`;
        heroContent.style.opacity = String(1 - scrollP * 0.5);
      }

      raf = requestAnimationFrame(update);
    } else {
      raf = 0;
    }
  };

  raf = requestAnimationFrame(update);

  /* ── Auto-pause via IntersectionObserver ── */
  const io = new IntersectionObserver(
    ([entry]) => {
      const wasPaused = paused;
      paused = !entry.isIntersecting;
      if (entry.isIntersecting) {
        lastTime = 0;
        if (wasPaused && !raf) {
          raf = requestAnimationFrame(update);
        }
      }
    },
    { threshold: 0 }
  );
  io.observe(container);

  /* ── GSAP-powered reveal animation ── */
  // We schedule the reveal on the next microtask to ensure GSAP is registered.
  // If GSAP is not yet available, we fall back to a simple opacity tween via CSS.
  const revealTarget = { val: p.revealInitial };

  function startReveal() {
    if (revealTarget.val >= 1) return;

    // Animate the uReveal uniform with GSAP
    const gsapGlobal = (window as any).gsap;
    if (gsapGlobal && typeof gsapGlobal.to === "function") {
      gsapGlobal.to(revealTarget, {
        val: 1,
        duration: 1.6,
        ease: "power3.out",
        onUpdate: () => {
          program.uniforms.uReveal.value = revealTarget.val;
        },
      });

      // Fade the canvas in simultaneously
      gsapGlobal.to(gl.canvas, {
        opacity: 1,
        duration: 1.2,
        delay: 0.1,
        ease: "power2.out",
      });
    } else {
      // Fallback: CSS transition
      gl.canvas.style.transition = "opacity 1.2s ease";
      requestAnimationFrame(() => {
        gl.canvas.style.opacity = "1";
      });

      // Lerp reveal uniform in the update loop
      const fallbackReveal = () => {
        if (revealTarget.val < 1) {
          revealTarget.val = Math.min(1, revealTarget.val + 0.015);
          program.uniforms.uReveal.value = revealTarget.val;
          if (revealTarget.val < 1) {
            requestAnimationFrame(fallbackReveal);
          }
        }
      };
      requestAnimationFrame(fallbackReveal);
    }
  }

  // Run reveal immediately (handles both initial load and Swup re-init)
  startReveal();

  /* ── Cleanup ── */
  return () => {
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    if (p.enableMouse) {
      container.removeEventListener("pointermove", onPointerMove);
    }
    if (gl.canvas.parentNode === container) {
      container.removeChild(gl.canvas);
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
