const HOST = 'https://edd53833-27fd-4f58.gradio.live';
const prompt =
  "right hand touching herself, (naked:1.6), (nude:1.2), nipple, pussy, legs open, stand in front of beach, best quality, ultra high res, photoshoot, (photorealistic:1.4), 1girl, singlet, sleeveless, (light brown hair:1), looking at viewer, smiling, cute, full body, wet clothes, wet skin, transparent clothes, see through, (ulzzang:1.2)";
const negative_prompt =
  'Negative prompt: extra fingers, paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, (outdoor:1.6), manboobs, backlight,(ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331), mutated hands, (poorly drawn hands:1.331), blurry, (bad anatomy:1.21), (bad proportions:1.331), extra limbs, (disfigured:1.331), (more than 2 nipples:1.331), (missing arms:1.331), (extra legs:1.331), (fused fingers:1.61051), (too many fingers:1.61051), (unclear eyes:1.331), bad hands, missing fingers, extra digit, (futa:1.1), bad body, NG_DeepNegative_V1_75T,pubic hair, glans, (lines:1.5), (stroke:1.5)';
const defaultOptions = {
  prompt,
  negative_prompt,
  steps: 24,
  denoising_strength: 0.48,
  cfg_scale: 8.5,
  mask_blur: 4,
  seed: -1,
  batch_size: 1,
  width: 512,
  height: 512,
  sampler_index: 'DPM++ SDE Karras'
};

export const img2img = async (img, options) => {
  const body = {
    ...defaultOptions,
    ...options,
    init_images: [img],
  };

  const response = await fetch(`${HOST}/sdapi/v1/img2img`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  return result.images[0];
};
