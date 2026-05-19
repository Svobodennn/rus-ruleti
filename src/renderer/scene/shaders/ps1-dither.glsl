/*
 * PS1 bayer-matrix dither — fragment shader for the post-fx pass.
 *
 * Why this looks like a PS1: the PSX framebuffer was 5-bits-per-channel
 * (~32k colours total), but the GTE shaded triangles in 8-bit precision.
 * Without dithering, the truncation would produce visible banding on smooth
 * gradients. Sony's dev kit included an ordered-dither pass that traded
 * smoothness for the harsh-but-distinctive pixel-checkerboard look that
 * defines the PSX aesthetic. We reproduce that pass directly.
 *
 * Algorithm:
 *   1. Sample the input texture (the rendered scene).
 *   2. Look up a 4x4 Bayer threshold matrix value for the current pixel.
 *   3. Add (threshold - 0.5) * intensity / levels  to the RGB triplet.
 *   4. Snap each channel to the nearest level by floor(rgb * levels)/levels.
 *
 * The added pre-quantise threshold biases each pixel either up or down
 * according to its position in the Bayer cell, so neighbouring pixels end
 * up at different quantised levels — the eye then averages them back into
 * the original tone. This is "ordered" dither (vs error-diffusion dither
 * like Floyd-Steinberg, which would require multiple passes).
 *
 * Uniforms (auto-injected by pmndrs Effect base class):
 *   - inputBuffer        sampler2D  — the scene texture.
 *   - uv                 vec2       — current pixel UV in 0..1.
 * Uniforms we add via the Effect options:
 *   - ditherIntensity    float      — 0..1 blend strength.
 *   - ditherLevels       float      — colour levels per channel.
 *
 * pmndrs Effect convention: this file is the fragment-shader BODY only.
 * The base class wraps it in a `void mainImage(in vec4 inputColor, in vec2 uv,
 * out vec4 outputColor)` function. We can read `inputColor` and write
 * `outputColor` directly.
 */

uniform float ditherIntensity;
uniform float ditherLevels;

// 4x4 Bayer ordered-dither matrix, normalised to 0..1. Values are the
// classic Bayer-4 pattern; the 1/16 factor maps them into the unit range.
float bayer4(in vec2 pixelCoord) {
  int x = int(mod(pixelCoord.x, 4.0));
  int y = int(mod(pixelCoord.y, 4.0));
  int idx = y * 4 + x;
  // Bayer-4 matrix flattened to a 16-entry table.
  if (idx == 0)  return  0.0 / 16.0;
  if (idx == 1)  return  8.0 / 16.0;
  if (idx == 2)  return  2.0 / 16.0;
  if (idx == 3)  return 10.0 / 16.0;
  if (idx == 4)  return 12.0 / 16.0;
  if (idx == 5)  return  4.0 / 16.0;
  if (idx == 6)  return 14.0 / 16.0;
  if (idx == 7)  return  6.0 / 16.0;
  if (idx == 8)  return  3.0 / 16.0;
  if (idx == 9)  return 11.0 / 16.0;
  if (idx == 10) return  1.0 / 16.0;
  if (idx == 11) return  9.0 / 16.0;
  if (idx == 12) return 15.0 / 16.0;
  if (idx == 13) return  7.0 / 16.0;
  if (idx == 14) return 13.0 / 16.0;
  return 5.0 / 16.0; // idx == 15
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Reconstruct pixel-space coordinate from UV + resolution. resolution
  // is provided by pmndrs Effect base — `resolution.xy` is the texel size,
  // so the inverse gives us the framebuffer pixel grid.
  vec2 pixelCoord = uv * resolution.xy;
  float threshold = bayer4(pixelCoord);

  // Bias each channel by (threshold - 0.5) * intensity * 1/levels then
  // floor-snap to the level grid. Sequence preserves the bayer ordering.
  float bias = (threshold - 0.5) * ditherIntensity / ditherLevels;
  vec3 biased = inputColor.rgb + vec3(bias);
  vec3 quantised = floor(biased * ditherLevels) / ditherLevels;

  outputColor = vec4(quantised, inputColor.a);
}
