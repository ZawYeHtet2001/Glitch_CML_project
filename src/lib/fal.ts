import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function generateImage(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt,
      image_size: "square_hd",
      num_images: 1,
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
