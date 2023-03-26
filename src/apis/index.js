const prompt =
  "a giant penis is pushing in between teenager girl's legs, which is wet and sticky, and the white liquid was splash all over her body, she was afraid and feel disgusting and helpless, she turn her head away, trying to avoid the incoming penis. shw is crying and screaming, and both of her arm was tied up, her clothes was broken and tearing apart, she is half naked, (nude:1.6), elf, fairy, child, under age, nipple, wet, pubit hair, sweaty, (sticky white liquid on her face:1.4), sharp focus, RAW photo, delicate, best quality, (intricate details:1.3), hyper detail, finely detailed, colorful, 1girl, solo, 8k uhd, film grain, (studio lighting:1.2), (Fujifilm XT3), (photorealistic:1.3), (detailed skin:1.2),1 ,(nose blush),middle breasts,beautiful detailed eyes, daylight, wet, rain, (short hair:1.2),floating hair NovaFrogStyle, full body,turtleneck,ribbed sweater,see-through,wet clothes,(ulzzang:1.2), wet dick, cum";
const negative_prompt =
  'Negative prompt: extra fingers, paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, (outdoor:1.6), manboobs, backlight,(ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331), mutated hands, (poorly drawn hands:1.331), blurry, (bad anatomy:1.21), (bad proportions:1.331), extra limbs, (disfigured:1.331), (more than 2 nipples:1.331), (missing arms:1.331), (extra legs:1.331), (fused fingers:1.61051), (too many fingers:1.61051), (unclear eyes:1.331), bad hands, missing fingers, extra digit, (futa:1.1), bad body, NG_DeepNegative_V1_75T,pubic hair, glans, (lines:1.5), (stroke:1.5)';
const defaultOptions = {
  prompt,
  negative_prompt,
  steps: 30,
  denoising_strength: 0.4,
  cfg_scale: 8,
  mask_blur: 4,
  seed: -1,
  batch_size: 1,
  width: 768,
  height: 768,
  sampler_index: 'DPM++ SDE Karras',

  // resize_mode: 0,
  // image_cfg_scale: 2,
  // inpainting_fill: 0,
  // inpaint_full_res: true,
  // inpaint_full_res_padding: 0,
  // inpainting_mask_invert: 0,
  // initial_noise_multiplier: 0,
  // subseed: -1,
  // subseed_strength: 0,
  // seed_resize_from_h: -1,
  // seed_resize_from_w: -1,
  // sampler_name: "",
  // batch_size: 1,
  // n_iter: 1,
  // steps: 50,
  // restore_faces: false,
  // tiling: false,
  // eta: 0,
  // s_churn: 0,
  // s_tmax: 0,
  // s_tmin: 0,
  // s_noise: 1,
  // override_settings: {},
  // override_settings_restore_afterwards: true,
  // include_init_images: false


};

export const img2img = async (img, options, host) => {
  const body = {
    ...defaultOptions,
    ...options,
    init_images: [img],
  };

  const response = await fetch(`${host}/sdapi/v1/img2img`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  if(!response.ok)
    throw new Error('Network Error: ' + response.status);

  const result = await response.json();

  return result.images;
};

export const upscale = async (img, options, host) => {
  const body = {
    ...defaultOptions,
    ...options,
    init_images: [img],
    script_name: "SD upscale",
    script_args: [
      0, // none
      64, // overlay
      3, // ESRGAN_4x
      1 // scale factor
    ],
  };

  // body.script_args[3] = Math.round(1024.0 / Math.max(body.width, body.height) * 100) / 100;
  // console.log(body);

  const response = await fetch(`${host}/sdapi/v1/img2img`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  if(!response.ok)
    throw new Error('Network Error: ' + response.status);

  const result = await response.json();

  return result.images;
}

export const upscale_dep = async (img, options, host) => {
  const body = {
    "upscaling_resize": 2,
    "upscaler_1": "ESRGAN_4x",
    "image": img,
  };

  const response = await fetch(`${host}/sdapi/v1/extra-single-image`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  if(!response.ok) 
    throw new Error('Network Error: ' + response.status);

  const result = await response.json();

  return result.image;
}