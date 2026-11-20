import homeWaveWebp from '../assets/illustrations/home-wave.webp';
import homeWavePng from '../assets/illustrations/home-wave.png';

const MAX_DPR = 1.5;
const MAX_PIXELS = 2_000_000;
const QUALITY_TIERS = [
  { scale: 1.0, detail: 1.0 },
  { scale: 0.75, detail: 0.7 },
  { scale: 0.55, detail: 0.45 }
];

const VERTEX_SHADER = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_detail;
varying vec2 v_uv;

void main() {
  float t = u_time;
  float diag = v_uv.x * 1.15 - v_uv.y * 0.85;

  // Calm multi-harmonic fold flow (14-18s characteristic period, seamless cycle)
  float waveA = sin(diag * 4.4 - t * 0.38) * 0.0085;
  float waveB = cos(v_uv.y * 5.8 + v_uv.x * 2.2 - t * 0.29) * 0.006;
  float waveC = sin((v_uv.x + v_uv.y) * 6.5 - t * 0.44) * 0.0035 * u_detail;

  // Attenuate displacement near edges so silhouette never clips
  float edgeX = smoothstep(0.0, 0.14, v_uv.x) * smoothstep(1.0, 0.92, v_uv.x);
  float edgeY = smoothstep(0.0, 0.12, v_uv.y) * smoothstep(1.0, 0.86, v_uv.y);
  float mask = edgeX * edgeY;

  vec2 uv = v_uv + vec2(waveA + waveC, waveB - waveA * 0.65) * mask;
  vec4 base = texture2D(u_tex, clamp(uv, 0.002, 0.998));

  // Secondary soft silk layer offset for gentle internal depth
  vec2 uv2 = v_uv + vec2(-waveB * 0.85, waveA * 0.9) * mask;
  vec4 fold = texture2D(u_tex, clamp(uv2, 0.002, 0.998));

  vec3 color = mix(base.rgb, fold.rgb, 0.24 * u_detail);
  float alpha = max(base.a, fold.a * 0.82);

  // Gliding warm sand-gold (#F2E2B5 / #E5D29B) & sage (#98A472) sheen along folds
  float sheenPhase = sin(diag * 5.2 - t * 0.42 + waveB * 18.0);
  float sheen = smoothstep(0.25, 0.98, sheenPhase * 0.5 + 0.5) * 0.14 * u_detail;
  float shadePhase = cos(diag * 3.8 + t * 0.31);
  float shade = smoothstep(0.35, 1.0, shadePhase * 0.5 + 0.5) * 0.06 * u_detail;

  vec3 goldTint = vec3(0.949, 0.886, 0.710);
  vec3 oliveTint = vec3(0.490, 0.561, 0.349);
  color = mix(color, goldTint, sheen * alpha);
  color = mix(color, oliveTint, shade * alpha);

  // Soft outer fade to guarantee zero rectangular seams on #FAF0E5
  float softBorder = smoothstep(0.0, 0.08, v_uv.x) * smoothstep(0.0, 0.06, v_uv.y) * smoothstep(1.0, 0.9, v_uv.y);
  float outAlpha = clamp(alpha * softBorder, 0.0, 1.0);

  gl_FragColor = vec4(color * outAlpha, outAlpha);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create WebGL shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || 'Shader compile error';
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function loadWaveImage() {
  return new Promise((resolve, reject) => {
    const tryLoad = (src, fallbackSrc) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (fallbackSrc) tryLoad(fallbackSrc, null);
        else reject(new Error('Failed to load home-wave texture'));
      };
      img.src = src;
    };
    tryLoad(homeWaveWebp, homeWavePng);
  });
}

export async function createHomeWaveRenderer(canvas, callbacks = {}) {
  const gl =
    canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power'
    }) ||
    canvas.getContext('experimental-webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true
    });

  if (!gl) {
    throw new Error('WebGL unavailable');
  }

  const image = await loadWaveImage();

  let program = null;
  let vertShader = null;
  let fragShader = null;
  let buffer = null;
  let texture = null;
  let uTimeLoc = null;
  let uDetailLoc = null;
  let uTexLoc = null;

  let cssWidth = 0;
  let cssHeight = 0;
  let qualityIndex = 0;
  let contextLost = false;
  let destroyed = false;

  // Pre-allocated ring buffer for adaptive quality hysteresis (no per-frame allocations)
  const sampleWindow = new Float32Array(30);
  let sampleCount = 0;
  let sampleCursor = 0;
  let fastStreak = 0;

  const setupGpu = () => {
    vertShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    program = gl.createProgram();
    if (!program) throw new Error('Failed to create WebGL program');
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
    }

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    uTimeLoc = gl.getUniformLocation(program, 'u_time');
    uDetailLoc = gl.getUniformLocation(program, 'u_detail');
    uTexLoc = gl.getUniformLocation(program, 'u_tex');

    gl.useProgram(program);
    gl.uniform1i(uTexLoc, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);
  };

  const releaseGpu = () => {
    if (texture) { gl.deleteTexture(texture); texture = null; }
    if (buffer) { gl.deleteBuffer(buffer); buffer = null; }
    if (program) { gl.deleteProgram(program); program = null; }
    if (vertShader) { gl.deleteShader(vertShader); vertShader = null; }
    if (fragShader) { gl.deleteShader(fragShader); fragShader = null; }
  };

  const applySize = () => {
    if (cssWidth <= 0 || cssHeight <= 0 || contextLost || destroyed) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const tier = QUALITY_TIERS[qualityIndex];
    let targetW = Math.max(1, Math.round(cssWidth * dpr * tier.scale));
    let targetH = Math.max(1, Math.round(cssHeight * dpr * tier.scale));

    const pixels = targetW * targetH;
    if (pixels > MAX_PIXELS) {
      const factor = Math.sqrt(MAX_PIXELS / pixels);
      targetW = Math.max(1, Math.floor(targetW * factor));
      targetH = Math.max(1, Math.floor(targetH * factor));
    }

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    return true;
  };

  setupGpu();

  const onContextLost = (event) => {
    event.preventDefault();
    contextLost = true;
    callbacks.onContextLost?.();
  };

  const onContextRestored = () => {
    if (destroyed) return;
    try {
      contextLost = false;
      setupGpu();
      applySize();
      callbacks.onContextRestored?.();
    } catch {
      callbacks.onFallback?.('context-restore-failed');
    }
  };

  canvas.addEventListener('webglcontextlost', onContextLost, false);
  canvas.addEventListener('webglcontextrestored', onContextRestored, false);

  return {
    resize(width, height) {
      cssWidth = Math.max(0, width);
      cssHeight = Math.max(0, height);
      return applySize();
    },

    render(elapsedSeconds, frameIntervalMs) {
      if (destroyed || contextLost || cssWidth <= 0 || cssHeight <= 0) return false;

      if (frameIntervalMs > 0) {
        sampleWindow[sampleCursor] = frameIntervalMs;
        sampleCursor = (sampleCursor + 1) % sampleWindow.length;
        if (sampleCount < sampleWindow.length) sampleCount += 1;

        if (sampleCount === sampleWindow.length && sampleCursor === 0) {
          let sum = 0;
          let slowCount = 0;
          for (let i = 0; i < sampleWindow.length; i += 1) {
            sum += sampleWindow[i];
            if (sampleWindow[i] > 24) slowCount += 1;
          }
          const avg = sum / sampleWindow.length;

          if (avg > 22 || slowCount >= 6) {
            fastStreak = 0;
            if (qualityIndex < QUALITY_TIERS.length - 1) {
              qualityIndex += 1;
              applySize();
            } else if (avg > 30) {
              callbacks.onFallback?.('budget-exceeded');
              return false;
            }
          } else if (avg < 15 && qualityIndex > 0) {
            fastStreak += sampleWindow.length;
            if (fastStreak >= 90) {
              qualityIndex -= 1;
              fastStreak = 0;
              applySize();
            }
          } else {
            fastStreak = 0;
          }
        }
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTimeLoc, elapsedSeconds);
      gl.uniform1f(uDetailLoc, QUALITY_TIERS[qualityIndex].detail);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return true;
    },

    getState() {
      return {
        qualityIndex,
        scale: QUALITY_TIERS[qualityIndex].scale,
        width: canvas.width,
        height: canvas.height
      };
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      canvas.removeEventListener('webglcontextlost', onContextLost, false);
      canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
      releaseGpu();
    }
  };
}
