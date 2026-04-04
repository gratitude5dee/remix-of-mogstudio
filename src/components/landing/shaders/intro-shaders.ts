// Cinematic intro shaders — god rays, heat distortion, film grain

export const introVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const introFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase; // 0-6 continuous
  uniform sampler2D uLogo;
  uniform sampler2D uText;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // ── Noise ──
  vec3 mod289(vec3 x) { return x - floor(x*(1.0/289.0))*289.0; }
  vec4 mod289(vec4 x) { return x - floor(x*(1.0/289.0))*289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159-0.85373472095314*r; }
  vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

  float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy)+vec4(0.0,0.0,1.0,1.0);
    vec4 Pf = fract(P.xyxy)-vec4(0.0,0.0,1.0,1.0);
    Pi = mod289(Pi);
    vec4 ix=Pi.xzxz,iy=Pi.yyww,fx=Pf.xzxz,fy=Pf.yyww;
    vec4 i=permute(permute(ix)+iy);
    vec4 gx=fract(i*(1.0/41.0))*2.0-1.0;
    vec4 gy=abs(gx)-0.5;
    vec4 tx=floor(gx+0.5);
    gx=gx-tx;
    vec2 g00=vec2(gx.x,gy.x),g10=vec2(gx.y,gy.y),g01=vec2(gx.z,gy.z),g11=vec2(gx.w,gy.w);
    vec4 norm=taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
    g00*=norm.x;g01*=norm.y;g10*=norm.z;g11*=norm.w;
    float n00=dot(g00,vec2(fx.x,fy.x)),n10=dot(g10,vec2(fx.y,fy.y));
    float n01=dot(g01,vec2(fx.z,fy.z)),n11=dot(g11,vec2(fx.w,fy.w));
    vec2 fade_xy=fade(Pf.xy);
    vec2 n_x=mix(vec2(n00,n01),vec2(n10,n11),fade_xy.x);
    return 2.3*mix(n_x.x,n_x.y,fade_xy.y);
  }

  float fbm(vec2 p) {
    float f=0.0,a=0.5;
    for(int i=0;i<6;i++){f+=a*cnoise(p);p*=2.1;a*=0.45;}
    return f;
  }

  // Film grain
  float grain(vec2 uv, float t) {
    return fract(sin(dot(uv, vec2(12.9898,78.233)) + t) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = uv - 0.5;
    float aspect = uResolution.x / uResolution.y;
    vec2 uvA = vec2(center.x * aspect, center.y);
    float distA = length(uvA);

    // Phase breakpoints
    float pDark    = smoothstep(0.0, 0.6, uPhase);
    float pRays    = smoothstep(0.6, 1.5, uPhase);
    float pBloom   = smoothstep(1.5, 2.5, uPhase);
    float pReveal  = smoothstep(2.5, 4.0, uPhase);
    float pResolve = smoothstep(4.0, 5.0, uPhase);
    float pFade    = smoothstep(5.0, 6.0, uPhase);

    // ── Pass 1: Volumetric god rays ──
    vec3 godRays = vec3(0.0);
    float rayStr = pRays * (1.0 - pResolve * 0.7);
    if (rayStr > 0.01) {
      vec2 rayUv = uv;
      float decay = 1.0;
      float totalWeight = 0.0;
      vec2 rayCenter = vec2(0.5);
      for (int i = 0; i < 30; i++) {
        rayUv -= (rayUv - rayCenter) * 0.02;
        float noise = fbm(rayUv * 4.0 + uTime * 0.1) * 0.5 + 0.5;
        godRays += vec3(0.97, 0.45, 0.09) * noise * decay * 0.03;
        totalWeight += decay;
        decay *= 0.96;
      }
      godRays *= rayStr / max(totalWeight * 0.03, 0.001) * 0.8;
    }

    // ── Pass 2: Heat distortion ──
    float heatStr = pBloom * (1.0 - pResolve);
    vec2 distortedUv = uv;
    if (heatStr > 0.01) {
      float distort = cnoise(uv * 8.0 + uTime * 0.5) * 0.006 * heatStr;
      distortedUv += vec2(distort, distort * 0.7);
    }

    // ── Logo ──
    vec2 logoUv = distortedUv * 2.5 - 0.75;
    float inBounds = step(0.0,logoUv.x)*step(logoUv.x,1.0)*step(0.0,logoUv.y)*step(logoUv.y,1.0);

    // Chromatic aberration
    float caStr = heatStr * 0.004;
    vec2 caDir = normalize(center + 0.001) * caStr;
    float logoR = texture2D(uLogo, clamp(logoUv + caDir, 0.0, 1.0)).r;
    float logoG = texture2D(uLogo, clamp(logoUv, 0.0, 1.0)).g;
    float logoB = texture2D(uLogo, clamp(logoUv - caDir, 0.0, 1.0)).b;
    float logoA = texture2D(uLogo, clamp(logoUv, 0.0, 1.0)).a;
    vec4 logoTex = vec4(logoR, logoG, logoB, logoA * inBounds);

    // Dissolve
    float noiseT = cnoise(distortedUv * 6.0 + uTime * 0.15) * 0.5 + 0.5;
    float dissolve = smoothstep(noiseT - 0.06, noiseT + 0.06, pBloom);
    float logoAlpha = logoTex.a * dissolve;

    // ── Pass 3: Edge glow (Sobel-like) ──
    float edgeDist = 0.008;
    float aL = texture2D(uLogo, clamp(logoUv + vec2(-edgeDist,0.0),0.0,1.0)).a * inBounds;
    float aR = texture2D(uLogo, clamp(logoUv + vec2( edgeDist,0.0),0.0,1.0)).a * inBounds;
    float aT = texture2D(uLogo, clamp(logoUv + vec2(0.0, edgeDist),0.0,1.0)).a * inBounds;
    float aB = texture2D(uLogo, clamp(logoUv + vec2(0.0,-edgeDist),0.0,1.0)).a * inBounds;
    float edgeDetect = abs(aR - aL) + abs(aT - aB);
    edgeDetect = smoothstep(0.05, 0.5, edgeDetect);
    vec3 edgeGlow = vec3(1.0, 0.5, 0.15) * edgeDetect * dissolve * (1.0 - pResolve) * 2.5;

    // ── Text ──
    vec2 textUv = vec2(uv.x * 3.0 - 1.0, (uv.y + 0.15) * 3.0 - 1.0);
    float textInB = step(0.0,textUv.x)*step(textUv.x,1.0)*step(0.0,textUv.y)*step(textUv.y,1.0);
    vec4 textTex = texture2D(uText, clamp(textUv, 0.0, 1.0));
    textTex.a *= textInB;
    // Per-character stagger using x-position
    float charProgress = smoothstep(textUv.x * 0.5, textUv.x * 0.5 + 0.3, pReveal);
    float textAlpha = textTex.a * charProgress;

    // ── Background ──
    float fog = fbm(uvA * 3.0 + uTime * 0.1) * 0.5 + 0.5;
    vec3 bg = mix(vec3(0.01, 0.005, 0.02), vec3(0.08, 0.03, 0.01), fog * pDark * 0.5);
    bg *= 1.0 - smoothstep(0.3, 0.9, distA) * 0.6; // vignette

    // ── Pass 4: Film grain ──
    float g = grain(uv * uResolution, uTime * 60.0);
    bg += (g - 0.5) * 0.04;

    // ── Compose ──
    vec3 color = bg + godRays;
    vec3 logoFinal = logoTex.rgb + edgeGlow;
    color = mix(color, logoFinal, logoAlpha);
    color = mix(color, textTex.rgb, textAlpha * 0.85);

    // Fade out
    float opacity = 1.0 - pFade;

    gl_FragColor = vec4(color, opacity);
  }
`;
