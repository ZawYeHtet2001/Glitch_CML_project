import { fal } from "@fal-ai/client";
import type { ImageModel } from "./types";

fal.config({
  credentials: process.env.FAL_KEY,
});

const NEGATIVE_PROMPT =
  "voxel, voxels, pixelated, blocky, cubic blocks, minecraft, lego, 8-bit, low-poly, faceted stepped surfaces, pixel art, jagged pixels, datamosh blocks, jpeg artifacts, dilapidated, abandoned, decaying, ruined, weathered, rusty, dirty, grimy, run-down, broken, old building, vintage, derelict, interior room, walls, ceiling, domestic setting, furniture details, animals, creatures, insects, pets, wildlife, unrelated objects, background scenery, landscape, environment, ground texture, floor texture, gradient background, studio backdrop, horizon line, outdoor scene, patterned background";

// --- Ideogram V2 ---

async function generateIdeogram(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/ideogram/v2", {
    input: {
      prompt,
      aspect_ratio: "1:1",
      expand_prompt: false,
      style: "design",
      negative_prompt: NEGATIVE_PROMPT,
    },
  });
  const output = result.data as { images: { url: string }[] };
  return output.images[0].url;
}

// --- Recraft V4 Pro ---
// Has background_color param for guaranteed clean backgrounds.

async function generateRecraft(
  prompt: string,
  backgroundBlack: boolean = false
): Promise<string> {
  const result = await fal.subscribe("fal-ai/recraft/v4/pro/text-to-image", {
    input: {
      prompt,
      image_size: "square_hd",
      background_color: backgroundBlack
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 },
    },
  });
  const output = result.data as { images: { url: string }[] };
  return output.images[0].url;
}

// --- Nano Banana Pro (Google Imagen) ---
// Supports up to 4K resolution.

async function generateNanoBanana(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/nano-banana-pro", {
    input: {
      prompt,
      aspect_ratio: "1:1",
      resolution: "2K",
    },
  });
  const output = result.data as { images: { url: string }[] };
  return output.images[0].url;
}

// --- Unified generation interface ---

export async function generateImage(
  prompt: string,
  model: ImageModel = "recraft",
  backgroundBlack: boolean = false
): Promise<string> {
  switch (model) {
    case "recraft":
      return generateRecraft(prompt, backgroundBlack);
    case "nanoBanana":
      return generateNanoBanana(prompt);
    case "ideogram":
    default:
      return generateIdeogram(prompt);
  }
}

// Remix endpoint (Ideogram only — other models don't support image reference)
export async function generateImageWithReference(
  prompt: string,
  referenceImageUrl: string,
  strength: number = 0.15
): Promise<string> {
  const fullPrompt = `${prompt}\n\nDo NOT include: ${NEGATIVE_PROMPT}`;

  const result = await fal.subscribe("fal-ai/ideogram/v2/remix", {
    input: {
      prompt: fullPrompt,
      image_url: referenceImageUrl,
      strength,
      aspect_ratio: "1:1",
      expand_prompt: false,
      style: "design",
    },
  });

  const output = result.data as { images: { url: string }[] };
  return output.images[0].url;
}

export async function generateVideo(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const result = await fal.subscribe("fal-ai/kling-video/v2/master/image-to-video", {
    input: {
      prompt,
      image_url: imageUrl,
      duration: "10",
    },
  });

  const output = result.data as { video: { url: string } };
  return output.video.url;
}
