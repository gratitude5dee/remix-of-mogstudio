// Cinematic "Void Emergence" loading shaders

export const loadingVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const loadingFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase; // 0=void, 1=ignite, 2=bloom, 3=reveal, 4=resolve
  uniform sampler2D uLogo;
  uniform sampler2D uText;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // ── Noise helpers ──
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }
  vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

  float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi);
    vec4 ix = Pi.xzxz, iy = Pi.yyww;
    vec4 fx = Pf.xzxz, fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = fract(i*(1.0/41.0))*2.0-1.0;
    vec4 gy = abs(gx)-0.5;
    vec4 tx = floor(gx+0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x), g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z), g11 = vec2(gx.w,gy.w);
    vec4 norm = taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
    g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
    float n00 = dot(g00,vec2(fx.x,fy.x));
    float n10 = dot(g10,vec2(fx.y,fy.y));
    float n01 = dot(g01,vec2(fx.z,fy.z));
    float n11 = dot(g11,vec2(fx.w,fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00,n01),vec2(n10,n11),fade_xy.x);
    return 2.3 * mix(n_x.x,n_x.y,fade_xy.y);
  }

  // FBM — 5-octave
  float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      f += a * cnoise(p);
      p *= 2.1;
      a *= 0.48;
    }
    return f;
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = uv - 0.5;
    float dist = length(center);
    float aspect = uResolution.x / uResolution.y;
    vec2 uvA = vec2(center.x * aspect, center.y);
    float distA = length(uvA);

    // Phase interpolation
    float phaseVoid   = smoothstep(0.0, 0.3, uPhase);
    float phaseIgnite = smoothstep(0.8, 1.5, uPhase);
    float phaseBloom  = smoothstep(1.5, 2.2, uPhase);
    float phaseReveal = smoothstep(2.2, 3.0, uPhase);
    float phaseResolve= smoothstep(3.0, 3.8, uPhase);

    // ── Layer 1: Void fog ──
    vec2 fogUv = uvA * 3.0 + uTime * 0.15;
    float fog = fbm(fogUv) * 0.5 + 0.5;
    fog *= smoothstep(0.8, 0.0, distA); // center-weighted
    vec3 fogColor = mix(
      vec3(0.02, 0.01, 0.03),
      vec3(0.15, 0.06, 0.01),
      fog * phaseVoid
    );

    // ── Layer 2: Energy ripple ──
    float ripple = sin(distA * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    ripple *= smoothstep(0.6, 0.0, distA) * phaseIgnite;
    vec3 rippleColor = vec3(0.97, 0.45, 0.09) * ripple * 0.4;

    // ── Layer 3: Logo dissolve ──
    // Scale UV to center the logo (roughly 40% of screen)
    vec2 logoUv = uv * 2.5 - 0.75;
    vec4 logoTex = texture2D(uLogo, clamp(logoUv, 0.0, 1.0));
    // Only show if within logo UV range
    float inBounds = step(0.0, logoUv.x) * step(logoUv.x, 1.0) * step(0.0, logoUv.y) * step(logoUv.y, 1.0);
    logoTex.a *= inBounds;

    float noiseThreshold = cnoise(uv * 5.0 + uTime * 0.2) * 0.5 + 0.5;
    float dissolve = smoothstep(noiseThreshold - 0.05, noiseThreshold + 0.05, phaseBloom);
    float logoAlpha = logoTex.a * dissolve;

    // Edge glow
    float edge = smoothstep(0.0, 0.15, dissolve) * (1.0 - smoothstep(0.15, 0.4, dissolve));
    vec3 edgeGlow = vec3(1.0, 0.45, 0.1) * edge * 2.0 * (1.0 - phaseResolve);

    // ── Layer 4: Text dissolve ──
    vec2 textUv = vec2(uv.x, uv.y * 1.0 + 0.15); // shift up
    textUv = textUv * 3.0 - 1.0;
    vec4 textTex = texture2D(uText, clamp(textUv, 0.0, 1.0));
    float textInBounds = step(0.0, textUv.x) * step(textUv.x, 1.0) * step(0.0, textUv.y) * step(textUv.y, 1.0);
    textTex.a *= textInBounds;
    float textDissolve = smoothstep(0.0, 1.0, phaseReveal);
    float textAlpha = textTex.a * textDissolve;

    // ── Layer 5: Chromatic aberration (bloom phase) ──
    float caStrength = (1.0 - phaseResolve) * phaseBloom * 0.008;
    vec2 caOffset = center * caStrength;
    // Apply to background only for subtle effect
    float fogR = fbm((uvA + caOffset) * 3.0 + uTime * 0.15) * 0.5 + 0.5;
    float fogB = fbm((uvA - caOffset) * 3.0 + uTime * 0.15) * 0.5 + 0.5;

    // ── Compose ──
    vec3 bg = fogColor;
    bg.r += (fogR - fog) * phaseIgnite * 0.1;
    bg.b += (fogB - fog) * phaseIgnite * 0.05;
    bg += rippleColor;

    // Vignette
    float vig = 1.0 - smoothstep(0.3, 0.9, distA);
    bg *= mix(0.5, 1.0, vig);

    // Logo compositing
    vec3 logoColor = logoTex.rgb + edgeGlow;
    vec3 color = mix(bg, logoColor, logoAlpha);

    // Text compositing
    color = mix(color, textTex.rgb, textAlpha * 0.9);

    // Progress bar at bottom
    float barH = 0.003;
    float barProgress = phaseBloom;
    if (uv.y < barH) {
      float barMask = step(uv.x, barProgress);
      vec3 barColor = mix(vec3(0.97, 0.45, 0.09), vec3(0.96, 0.62, 0.04), uv.x);
      color = mix(color, barColor, barMask * 0.8);
    }

    // Fade out during resolve
    float fadeOut = 1.0 - smoothstep(3.5, 4.0, uPhase);

    gl_FragColor = vec4(color, fadeOut);
  }
`;
