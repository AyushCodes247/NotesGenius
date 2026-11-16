import heroTexture from "../assets/hero-texture.jpg";

type ProgressCallback = (progress: number) => void;

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = async () => {
      try {
        if ("decode" in image) {
          await image.decode();
        }
      } catch {
        // Image is already available.
      }

      resolve();
    };

    image.onerror = () => {
      resolve();
    };

    image.src = src;
  });
};

const preloadVideo = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");

    let resolved = false;

    const finish = () => {
      if (resolved) {
        return;
      }

      resolved = true;

      video.removeEventListener("loadeddata", finish);
      video.removeEventListener("error", finish);

      video.removeAttribute("src");
      video.load();

      resolve();
    };

    video.preload = "auto";
    video.muted = true;

    video.addEventListener("loadeddata", finish, {
      once: true,
    });

    video.addEventListener("error", finish, {
      once: true,
    });

    video.src = src;
    video.load();
  });
};

const waitForFonts = async (): Promise<void> => {
  if (!document.fonts) {
    return;
  }

  /*
   * Wait for the browser's font set.
   */
  await document.fonts.ready;

  /*
   * Explicitly request the font weights used
   * by the homepage.
   *
   * This prevents a fallback-font → actual-font
   * layout shift.
   */
  const fontLoads = [
    document.fonts.load("400 16px Inter"),
    document.fonts.load("500 16px Inter"),
    document.fonts.load("600 16px Inter"),
    document.fonts.load("700 16px Inter"),
  ];

  await Promise.allSettled(fontLoads);
};

const waitForBrowserPaint = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
};

export const preloadHomeAssets = async (
  onProgress?: ProgressCallback,
): Promise<void> => {
  /*
   * Add every critical homepage asset here.
   *
   * If you add another image/video later,
   * add it to the appropriate list.
   */
  const imageAssets = [heroTexture];

  const videoAssets: string[] = [];

  /*
   * Fonts are treated as one loading task.
   */
  const totalTasks = imageAssets.length + videoAssets.length + 1;

  let completedTasks = 0;

  const updateProgress = () => {
    completedTasks += 1;

    const progress = Math.min(
      100,
      Math.round((completedTasks / totalTasks) * 100),
    );

    onProgress?.(progress);
  };

  const imageTasks = imageAssets.map(async (src) => {
    await preloadImage(src);
    updateProgress();
  });

  const videoTasks = videoAssets.map(async (src) => {
    await preloadVideo(src);
    updateProgress();
  });

  const fontTask = waitForFonts().finally(updateProgress);

  /*
   * Do not allow one failed asset to block
   * the entire homepage forever.
   */
  await Promise.allSettled([...imageTasks, ...videoTasks, fontTask]);

  /*
   * Wait until the browser has had an opportunity
   * to paint the loaded resources.
   */
  await waitForBrowserPaint();

  onProgress?.(100);
};
