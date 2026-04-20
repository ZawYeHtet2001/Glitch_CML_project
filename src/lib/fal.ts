import { fal } from "@fal-ai/client";
import type { ImageModel, Model3D } from "./types";

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

// --- Image to 3D helpers ---

/** Hard wall-clock cap on any fal.subscribe() call. Prevents a silently
 * dead job on fal's side from hanging our Next.js handler forever. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        Object.assign(new Error(`${label} timed out after ${ms / 1000}s`), {
          status: 504,
        })
      );
    }, ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

/** Streams fal's in-queue / in-progress log lines to the Next.js terminal
 * so we can tell WHY a job is slow (queue depth vs actual compute). */
function onQueueUpdate(update: { status?: string; logs?: { message: string }[] }) {
  if (update.status) {
    // eslint-disable-next-line no-console
    console.log(`[fal] status: ${update.status}`);
  }
  if (update.logs?.length) {
    for (const l of update.logs) {
      // eslint-disable-next-line no-console
      console.log(`[fal] ${l.message}`);
    }
  }
}

// --- Image to 3D: Trellis (Microsoft) ---
// Cheap (~$0.02), fast, preserves input form fidelity.

async function generate3DTrellis(imageUrl: string): Promise<string> {
  const result = await withTimeout(
    fal.subscribe("fal-ai/trellis", {
      input: { image_url: imageUrl },
      logs: true,
      onQueueUpdate,
    }),
    6 * 60 * 1000,
    "trellis"
  );
  const output = result.data as { model_mesh: { url: string } };
  return output.model_mesh.url;
}

// --- Image to 3D: Hunyuan3D V3 (Tencent) ---
// Higher quality with PBR materials, returns multiple format URLs.

async function generate3DHunyuan(imageUrl: string): Promise<string> {
  const result = await withTimeout(
    fal.subscribe("fal-ai/hunyuan3d-v3/image-to-3d", {
      input: {
        input_image_url: imageUrl,
        enable_pbr: true,
        generate_type: "Normal",
        face_count: 500000,
      },
      logs: true,
      onQueueUpdate,
    }),
    10 * 60 * 1000,
    "hunyuan3d"
  );
  const output = result.data as { model_glb: { url: string } };
  return output.model_glb.url;
}

export async function generate3DModel(
  imageUrl: string,
  model: Model3D = "trellis"
): Promise<string> {
  switch (model) {
    case "hunyuan3d":
      return generate3DHunyuan(imageUrl);
    case "trellis":
    default:
      return generate3DTrellis(imageUrl);
  }
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
