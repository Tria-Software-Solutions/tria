(function () {
  // ── Pure data (no GL dependency) ──

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r: r, g: g, b: b };
  }

  function rgbToNormalized(r, g, b) {
    return { r: r / 255, g: g / 255, b: b / 255 };
  }

  var firstColors = [
    rgbToNormalized(254, 246, 194),
    rgbToNormalized(13, 102, 221),
    rgbToNormalized(19, 8, 79),
    rgbToNormalized(80, 60, 212),
  ];
  var secondColors = [
    rgbToNormalized(147, 133, 0),
    rgbToNormalized(11, 29, 2),
    rgbToNormalized(4, 0, 17),
    rgbToNormalized(0, 0, 0),
  ];
  var thirdColors = [
    rgbToNormalized(8, 8, 10),
    rgbToNormalized(12, 12, 14),
    rgbToNormalized(6, 6, 8),
    rgbToNormalized(10, 10, 12),
  ];

  var curveStates = [
    {
      xPoints: [
        { t: 0, v: 0.3175197592936456 },
        { t: 0.5, v: 0.8134062283206731 },
        { t: 1, v: 0.2382634412497282 },
      ],
      yPoints: [
        { t: 0, v: 0.8699468872509897 },
        { t: 0.5, v: 0.5785694264341146 },
        { t: 1, v: 0.510603217408061 },
      ],
      colors: firstColors,
    },
    {
      xPoints: [
        { t: 0, v: 0.048066693590953946 },
        { t: 0.3333333333333333, v: 0.4492174554616213 },
        { t: 0.6666666666666666, v: 0.9211202280130237 },
        { t: 1, v: 0.8836013511754572 },
      ],
      yPoints: [
        { t: 0, v: 0.600493821548298 },
        { t: 0.3333333333333333, v: 0.21438065357506275 },
        { t: 0.6666666666666666, v: 0.19346000417135656 },
        { t: 1, v: 0.2495113001205027 },
      ],
      colors: secondColors,
    },
    {
      xPoints: [
        { t: 0, v: 0.17492072959430516 },
        { t: 0.3333333333333333, v: 0.16349593363702297 },
        { t: 0.6666666666666666, v: 0.30500513850711286 },
        { t: 1, v: 0.9142415248788893 },
      ],
      yPoints: [
        { t: 0, v: 0.7273478575516492 },
        { t: 0.5, v: 0.9286591317504644 },
        { t: 1, v: 0.5773449146654457 },
      ],
      colors: thirdColors,
    },
  ];

  var currentXPoints = curveStates[0].xPoints;
  var currentYPoints = curveStates[0].yPoints;
  var gradientColors = curveStates[0].colors;
  var currentScrollProgress = 0;

  var blendMode = 0;
  var noiseAmount = 0.04;
  var feather = 0.18;

  function sampleCurveAtT(points, t) {
    if (points.length === 0) return 0;
    if (points.length === 1) return points[0].v;
    for (var i = 0; i < points.length - 1; i++) {
      if (t >= points[i].t && t <= points[i + 1].t)
        return (
          points[i].v +
          (points[i + 1].v - points[i].v) *
            ((t - points[i].t) / (points[i + 1].t - points[i].t))
        );
    }
    if (t <= points[0].t) return points[0].v;
    return points[points.length - 1].v;
  }

  function interpolateColors(c1, c2, t) {
    var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    var maxLen = Math.max(c1.length, c2.length);
    var out = [];
    for (var i = 0; i < maxLen; i++) {
      var a = c1[Math.min(i, c1.length - 1)];
      var b = c2[Math.min(i, c2.length - 1)];
      out.push({
        r: a.r + (b.r - a.r) * eased,
        g: a.g + (b.g - a.g) * eased,
        b: a.b + (b.b - a.b) * eased,
      });
    }
    return out;
  }

  function interpolateCurves(s1, s2, t) {
    var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    var iX = s2.xPoints.map(function (p) {
      return {
        t: p.t,
        v:
          sampleCurveAtT(s1.xPoints, p.t) +
          (p.v - sampleCurveAtT(s1.xPoints, p.t)) * eased,
      };
    });
    var iY = s2.yPoints.map(function (p) {
      return {
        t: p.t,
        v:
          sampleCurveAtT(s1.yPoints, p.t) +
          (p.v - sampleCurveAtT(s1.yPoints, p.t)) * eased,
      };
    });
    return {
      xPoints: iX,
      yPoints: iY,
      colors: interpolateColors(s1.colors, s2.colors, eased),
    };
  }

  function catmullRom(p0, p1, p2, p3, t) {
    var t2 = t * t,
      t3 = t2 * t;
    return (
      0.5 *
      (2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
    );
  }

  function evaluateCurve(points, count) {
    var samples = new Array(count);
    for (var i = 0; i < count; i++) {
      var t = i / (count - 1);
      if (points.length === 1) samples[i] = points[0].v;
      else if (points.length === 2)
        samples[i] = points[0].v + (points[1].v - points[0].v) * t;
      else {
        var seg = 0;
        for (var j = 0; j < points.length - 1; j++) {
          if (t >= points[j].t && t <= points[j + 1].t) {
            seg = j;
            break;
          }
        }
        if (seg === 0 && t < points[0].t) samples[i] = points[0].v;
        else if (seg === points.length - 2 && t > points[points.length - 1].t)
          samples[i] = points[points.length - 1].v;
        else {
          var p0 = seg > 0 ? points[seg - 1].v : points[0].v;
          var p1 = points[seg].v;
          var p2 = points[seg + 1].v;
          var p3 =
            seg < points.length - 2
              ? points[seg + 2].v
              : points[points.length - 1].v;
          var segT = points[seg + 1].t - points[seg].t;
          samples[i] = catmullRom(
            p0,
            p1,
            p2,
            p3,
            segT > 0 ? (t - points[seg].t) / segT : 0,
          );
        }
      }
      samples[i] = Math.max(0, Math.min(1, samples[i]));
    }
    return samples;
  }

  // ── GL-dependent init ──

  var gl, container, canvas, dpr;
  var prog, posLoc, posBuf, noiseTex;
  var scrollTicking = false;
  var animPending = false;

  function compileShader(src, type) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function render() {
    var w = canvas.width;
    var h = canvas.height;
    if (w === 0 || h === 0) return;

    var xSamples = evaluateCurve(currentXPoints, w);
    var ySamples = evaluateCurve(currentYPoints, h);

    var xData = new Uint8Array(
      xSamples.map(function (v) {
        return v * 255;
      }),
    );
    var yData = new Uint8Array(
      ySamples.map(function (v) {
        return v * 255;
      }),
    );

    var xTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, xTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      w,
      1,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      xData,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    var yTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, yTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      1,
      h,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      yData,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.useProgram(prog);
    gl.uniform2f(gl.getUniformLocation(prog, "u_resolution"), w, h);
    gl.uniform1f(gl.getUniformLocation(prog, "u_noiseAmount"), noiseAmount);
    gl.uniform1f(gl.getUniformLocation(prog, "u_feather"), feather);
    gl.uniform1i(gl.getUniformLocation(prog, "u_blendMode"), blendMode);
    gl.uniform1i(
      gl.getUniformLocation(prog, "u_colorCount"),
      gradientColors.length,
    );
    gl.uniform1i(gl.getUniformLocation(prog, "u_glitterEnabled"), 1);
    gl.uniform1f(gl.getUniformLocation(prog, "u_glitterDensity"), 1500);
    gl.uniform1f(gl.getUniformLocation(prog, "u_glitterSizeMin"), 0.5);
    gl.uniform1f(gl.getUniformLocation(prog, "u_glitterSizeMax"), 3.0);
    gl.uniform1f(gl.getUniformLocation(prog, "u_distortionIntensity"), 0.04);
    gl.uniform1f(gl.getUniformLocation(prog, "u_distortionScale"), 0.5);
    gl.uniform2f(gl.getUniformLocation(prog, "u_distortionSeed"), 263.0, 131.5);
    gl.uniform1f(
      gl.getUniformLocation(prog, "u_distortionScroll"),
      currentScrollProgress,
    );
    gl.uniform1i(gl.getUniformLocation(prog, "u_distortionOctaves"), 1);
    gl.uniform1f(gl.getUniformLocation(prog, "u_distortionLacunarity"), 2.1);
    gl.uniform1f(gl.getUniformLocation(prog, "u_distortionPersistence"), 0.24);
    gl.uniform1f(gl.getUniformLocation(prog, "u_distortionWarpStrength"), 1.2);

    var colArr = new Float32Array(gradientColors.length * 3);
    for (var i = 0; i < gradientColors.length; i++) {
      colArr[i * 3] = gradientColors[i].r;
      colArr[i * 3 + 1] = gradientColors[i].g;
      colArr[i * 3 + 2] = gradientColors[i].b;
    }
    gl.uniform3fv(gl.getUniformLocation(prog, "u_colors"), colArr);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, xTex);
    gl.uniform1i(gl.getUniformLocation(prog, "u_xSamples"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, yTex);
    gl.uniform1i(gl.getUniformLocation(prog, "u_ySamples"), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    gl.uniform1i(gl.getUniformLocation(prog, "u_noise"), 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function resize() {
    var rect = container.getBoundingClientRect();
    var w = Math.round(rect.width);
    var h = Math.round(rect.height);
    if (w === 0 || h === 0) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
  }

  function updateFromScroll() {
    var hero = document.querySelector(".tria-banner");
    if (!hero) return;
    var heroRect = hero.getBoundingClientRect();
    var heroH = heroRect.height;
    var scrollY = window.scrollY;

    var featuresEndScroll = scrollY + heroRect.bottom;
    if (featuresEndScroll > 0) {
      currentScrollProgress = Math.min(1, scrollY / featuresEndScroll);
    } else {
      currentScrollProgress = 1;
    }

    var si = Math.min(2, Math.floor(currentScrollProgress * 3));
    var ni = Math.min(2, si + 1);
    var lp = currentScrollProgress * 3 - si;
    var interp = interpolateCurves(curveStates[si], curveStates[ni], lp);
    currentXPoints = interp.xPoints;
    currentYPoints = interp.yPoints;
    gradientColors = interp.colors;

    render();
    animPending = false;
  }

  function initTriaGradient() {
    container = document.querySelector(".tria-gradient");
    if (!container) return;

    var oldCanvas = container.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();

    canvas = document.createElement("canvas");
    canvas.id = "tria-gradient-canvas";
    canvas.style.cssText = "display:block;width:100%;height:100%";
    container.appendChild(canvas);

    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    dpr = window.devicePixelRatio || 1;

    // Shaders
    var vsSrc =
      "attribute vec2 a_position;varying vec2 v_uv;void main(){gl_Position=vec4(a_position,0.0,1.0);v_uv=(a_position+1.0)*0.5;}";
    var fsSrc =
      "precision mediump float;" +
      "uniform sampler2D u_xSamples;" +
      "uniform sampler2D u_ySamples;" +
      "uniform sampler2D u_noise;" +
      "uniform vec2 u_resolution;" +
      "uniform float u_noiseAmount;" +
      "uniform float u_feather;" +
      "uniform int u_blendMode;" +
      "uniform int u_colorCount;" +
      "uniform vec3 u_colors[32];" +
      "uniform int u_glitterEnabled;" +
      "uniform float u_glitterDensity;" +
      "uniform float u_glitterSizeMin;" +
      "uniform float u_glitterSizeMax;" +
      "uniform float u_distortionIntensity;" +
      "uniform float u_distortionScale;" +
      "uniform vec2 u_distortionSeed;" +
      "uniform int u_distortionOctaves;" +
      "uniform float u_distortionLacunarity;" +
      "uniform float u_distortionPersistence;" +
      "uniform float u_distortionWarpStrength;" +
      "uniform float u_distortionScroll;" +
      "varying vec2 v_uv;" +
      "float hash(vec2 p){float h=dot(p,vec2(127.1,311.7))+dot(p,vec2(269.5,183.3));return fract(sin(h)*43758.5453);}" +
      "float blend(float base,float blend,int mode){base=clamp(base,0.0,1.0);blend=clamp(blend,0.0,1.0);if(mode==11)return(base+blend)*0.5;return base*blend;}" +
      "vec3 getColorFromGradient(float t){t=clamp(t,0.0,1.0);float seg=1.0/float(u_colorCount-1);float idx=min(float(u_colorCount-2),floor(t/seg));float localT=(t-idx*seg)/seg;int i1=int(idx);int i2=i1+1;vec3 c1=vec3(0.0);vec3 c2=vec3(0.0);for(int i=0;i<32;i++){if(i<u_colorCount){if(i==i1)c1=u_colors[i];if(i==i2)c2=u_colors[i];}}return mix(c1,c2,localT);}" +
      "vec3 mod289_3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}" +
      "vec2 mod289_2(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}" +
      "vec3 permute(vec3 x){return mod289_3(((x*34.0)+1.0)*x);}" +
      "float snoise2D(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289_2(i);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}" +
      "float fbmNoise(vec2 p,int octaves,float lacunarity,float persistence){float value=0.0;float amplitude=0.5;float frequency=1.0;for(int i=0;i<8;i++){if(i>=octaves)break;value+=amplitude*snoise2D(p*frequency);frequency*=lacunarity;amplitude*=persistence;}return value;}" +
      "float domainWarpNoise(vec2 p,float warpStrength,int octaves,float lacunarity,float persistence){vec2 q=vec2(fbmNoise(p,octaves,lacunarity,persistence),fbmNoise(p+vec2(5.2,1.3),octaves,lacunarity,persistence));vec2 r=vec2(fbmNoise(p+warpStrength*q+vec2(1.7,9.2),octaves,lacunarity,persistence),fbmNoise(p+warpStrength*q+vec2(8.3,2.8),octaves,lacunarity,persistence));return fbmNoise(p+warpStrength*r,octaves,lacunarity,persistence);}" +
      "vec3 mod289_v3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}" +
      "vec4 mod289_v4(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}" +
      "vec4 permute_v4(vec4 x){return mod289_v4(((x*34.0)+1.0)*x);}" +
      "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}" +
      "float snoise3D(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289_v3(i);vec4 p=permute_v4(permute_v4(permute_v4(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}" +
      "float fbmNoise3D(vec3 p,int octaves,float lacunarity,float persistence){float value=0.0;float amplitude=0.5;float frequency=1.0;for(int i=0;i<8;i++){if(i>=octaves)break;value+=amplitude*snoise3D(p*frequency);frequency*=lacunarity;amplitude*=persistence;}return value;}" +
      "float domainWarpNoise3D(vec3 p,float warpStrength,int octaves,float lacunarity,float persistence){vec2 q=vec2(fbmNoise3D(p,octaves,lacunarity,persistence),fbmNoise3D(p+vec3(5.2,1.3,0.0),octaves,lacunarity,persistence));vec2 r=vec2(fbmNoise3D(p+vec3(warpStrength*q.x+1.7,warpStrength*q.y+9.2,0.0),octaves,lacunarity,persistence),fbmNoise3D(p+vec3(warpStrength*q.x+8.3,warpStrength*q.y+2.8,0.0),octaves,lacunarity,persistence));return fbmNoise3D(p+vec3(warpStrength*r.x,warpStrength*r.y,0.0),octaves,lacunarity,persistence);}" +
      "vec2 proceduralNormalOrganic(vec2 uv,float scale,int octaves,float lacunarity,float persistence,float warpStrength,vec2 seed,float scrollPhase){float eps=0.01/max(scale,0.1);vec2 scaledUV=uv*scale+seed;float evo=scrollPhase*1.8;vec3 pL=vec3(scaledUV.x-eps,scaledUV.y,evo);vec3 pR=vec3(scaledUV.x+eps,scaledUV.y,evo);vec3 pD=vec3(scaledUV.x,scaledUV.y-eps,evo);vec3 pU=vec3(scaledUV.x,scaledUV.y+eps,evo);float heightL=domainWarpNoise3D(pL,warpStrength,octaves,lacunarity,persistence);float heightR=domainWarpNoise3D(pR,warpStrength,octaves,lacunarity,persistence);float heightD=domainWarpNoise3D(pD,warpStrength,octaves,lacunarity,persistence);float heightU=domainWarpNoise3D(pU,warpStrength,octaves,lacunarity,persistence);float dx=(heightR-heightL)/(2.0*eps);float dy=(heightU-heightD)/(2.0*eps);return vec2(-dx,-dy);}" +
      "void main(){vec2 coord=v_uv*u_resolution;float x=coord.x;float y=coord.y;float intensity=u_distortionIntensity;vec2 distortedUV=v_uv;float aspectRatio=u_resolution.x/u_resolution.y;vec2 aspectCorrectedUV=v_uv;aspectCorrectedUV.x*=aspectRatio;vec2 procNormal=proceduralNormalOrganic(aspectCorrectedUV,u_distortionScale,u_distortionOctaves,u_distortionLacunarity,u_distortionPersistence,u_distortionWarpStrength,u_distortionSeed,u_distortionScroll);distortedUV=v_uv+procNormal*intensity;float clampedU=clamp(distortedUV.x,0.0,1.0);float clampedV=clamp(distortedUV.y,0.0,1.0);float vx=texture2D(u_xSamples,vec2(clampedU,0.5)).r;float vy=texture2D(u_ySamples,vec2(0.5,clampedV)).r;vx=clamp(vx,0.0,1.0);vy=clamp(vy,0.0,1.0);if(u_feather>0.0){float fx=pow(sin((x/u_resolution.x)*3.14159265359),u_feather);float fy=pow(sin((y/u_resolution.y)*3.14159265359),u_feather);vx=mix(vx,fx,0.2);vy=mix(vy,fy,0.2);}float diagSample=texture2D(u_xSamples,vec2(clampedV,0.5)).r;float mixVal=clamp((vx+vy+diagSample)/3.0,0.0,1.0);mixVal+=(clampedU-0.5)*0.12+(clampedV-0.5)*0.12;float jitter=(hash(v_uv*u_resolution*0.35)-0.5)*0.008;mixVal=clamp(mixVal+jitter,0.0,1.0);if(u_noiseAmount>0.0){vec2 noiseCoord=coord/256.0;float n=(texture2D(u_noise,noiseCoord).r-0.5)*u_noiseAmount;mixVal=clamp(mixVal+n,0.0,1.0);}vec3 col=getColorFromGradient(mixVal);if(u_glitterEnabled>0){float minCellSize=5.0;float maxCellSize=30.0;float densityNorm=clamp(u_glitterDensity/5000.0,0.0,1.0);float cellSize=mix(maxCellSize,minCellSize,densityNorm);vec2 cell=floor(coord/cellSize);vec2 cellUV=fract(coord/cellSize);float particleChance=hash(cell);float spawnProb=mix(0.1,1.0,densityNorm);if(particleChance<spawnProb){float sizeJitter=hash(cell+vec2(7.0,13.0));float size=mix(u_glitterSizeMin,u_glitterSizeMax,sizeJitter);vec2 center=(cell+vec2(0.5+hash(cell+vec2(3.0,5.0))*0.2,0.5+hash(cell+vec2(9.0,11.0))*0.2))*cellSize;float dist=length(coord-center)/size;float glitterT=fract(hash(cell+vec2(17.0,19.0)));vec3 glitterCol=getColorFromGradient(glitterT);float alpha=smoothstep(1.0,0.0,dist);col=mix(col,glitterCol,alpha*0.6);}}" +
      (function () {
        var s = "";
        for (var i = 0; i < 8000; i++) s += ";";
        return s;
      })() +
      "gl_FragColor=vec4(col,1.0);}";

    var vs = compileShader(vsSrc, gl.VERTEX_SHADER);
    var fs = compileShader(fsSrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    posLoc = gl.getAttribLocation(prog, "a_position");
    posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    // Noise texture
    var noiseSize = 256;
    var noiseData = new Uint8Array(noiseSize * noiseSize);
    for (var i = 0; i < noiseSize * noiseSize; i++)
      noiseData[i] = Math.random() * 255;
    noiseTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      noiseSize,
      noiseSize,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      noiseData,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    resize();
    updateFromScroll();
  }

  // ── Glue (one-time setup) ──

  window.initTriaGradient = initTriaGradient;

  window.addEventListener(
    "scroll",
    function () {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(function () {
          updateFromScroll();
          scrollTicking = false;
        });
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", function () {
    resize();
  });

  initTriaGradient();
})();
