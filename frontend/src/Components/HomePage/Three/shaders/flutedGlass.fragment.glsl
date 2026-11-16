precision mediump float;

uniform sampler2D uTexture;
uniform vec4 resolution;
uniform float uImageAspect;
uniform vec3 uOverlayColor;
uniform vec3 uOverlayColorWhite;
uniform float uMotionValue;
uniform float uRotation;
uniform float uSegments;
uniform float uOverlayOpacity;

varying vec2 vUv;

void main() {
    float canvasAspect = resolution.x / max(resolution.y,1.0);
    float numSlices = uSegments;

    float rotationRadians = uRotation * (3.14159265 / 180.0);

  // --------------------------------
  // Aspect ratio correction
  // --------------------------------

    vec2 scaledUV = vUv;

    if(uImageAspect > canvasAspect) {
        float scale = canvasAspect / uImageAspect;

        scaledUV.x = (vUv.x - 0.5) * scale + 0.5;
    } else {
        float scale = uImageAspect / canvasAspect;

        scaledUV.y = (vUv.y - 0.5) * scale + 0.5;
    }

  // --------------------------------
  // Rotate UVs
  // --------------------------------

    vec2 rotatedUV = vec2(cos(rotationRadians) *
        (scaledUV.x - 0.5) -
        sin(rotationRadians) *
        (scaledUV.y - 0.5) +
        0.5, sin(rotationRadians) *
        (scaledUV.x - 0.5) +
        cos(rotationRadians) *
        (scaledUV.y - 0.5) +
        0.5);

  // --------------------------------
  // Fluted distortion
  // --------------------------------

    float sliceProgress = fract(rotatedUV.x *
        numSlices +
        uMotionValue);

    float amplitude = 0.015;

    rotatedUV.x += amplitude *
        sin(sliceProgress *
        3.14159265 *
        2.0) *
        (1.0 -
        0.5 *
        abs(sliceProgress - 0.5));

  // --------------------------------
  // Rotate back
  // --------------------------------

    vec2 finalUV = vec2(cos(-rotationRadians) *
        (rotatedUV.x - 0.5) -
        sin(-rotationRadians) *
        (rotatedUV.y - 0.5) +
        0.5, sin(-rotationRadians) *
        (rotatedUV.x - 0.5) +
        cos(-rotationRadians) *
        (rotatedUV.y - 0.5) +
        0.5);

  // --------------------------------
  // Mirrored tiling
  // --------------------------------

    vec2 tileIndex = floor(finalUV);

    vec2 oddTile = mod(tileIndex, 2.0);

    vec2 mirroredUV = mix(fract(finalUV), 1.0 - fract(finalUV), oddTile);

    vec4 color = texture2D(uTexture, mirroredUV);

  // --------------------------------
  // Overlay
  // --------------------------------

    if(uOverlayOpacity > 0.0) {

        float blackOverlayAlpha = 0.05 *
            (1.0 -
            abs(sin(sliceProgress *
            3.14159265 *
            0.5 +
            1.57))) *
            (uOverlayOpacity / 100.0);

        color.rgb *= 1.0 -
            blackOverlayAlpha;

        float whiteOverlayAlpha = 0.15 *
            (1.0 -
            abs(sin(sliceProgress *
            3.14159265 *
            0.7 -
            0.7))) *
            (uOverlayOpacity / 100.0);

        color.rgb = mix(color.rgb, uOverlayColorWhite, whiteOverlayAlpha);
    }

    gl_FragColor = color;
}