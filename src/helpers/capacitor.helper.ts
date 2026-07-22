import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

const CACHE_DIR = Directory.Cache;
const IMAGE_FOLDER = "exercise-images";

const getLocalPath = (fileName: string) => `${IMAGE_FOLDER}/${fileName}`;
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Check if file exists locally and get usable src
export const getCachedImageSrc = async (
  fileName: string,
): Promise<string | null> => {
  try {
    await Filesystem.stat({
      path: getLocalPath(fileName),
      directory: CACHE_DIR,
    });

    const uri = await Filesystem.getUri({
      path: getLocalPath(fileName),
      directory: CACHE_DIR,
    });

    const fileSrc = Capacitor.convertFileSrc(uri.uri);
    if (!Capacitor.isNativePlatform || !fileSrc.startsWith("http")) {
      const readResult = await Filesystem.readFile({
        path: getLocalPath(fileName),
        directory: CACHE_DIR,
      });

      const blob = await (
        await fetch(`data:image/webp;base64,${readResult.data}`)
      ).blob();

      return URL.createObjectURL(blob);
    }

    return fileSrc;
  } catch (e) {
    return null;
  }
};

// Download from Firebase and save locally
export const downloadAndCache = async (
  downloadUrl: string,
  fileName: string,
  signal?: AbortSignal,
): Promise<string> => {
  const response = await fetch(downloadUrl, {
    signal,
    mode: "cors",
    credentials: "omit",
  });
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const blob = await response.blob();
  const base64 = await blobToBase64(blob);

  await Filesystem.writeFile({
    path: getLocalPath(fileName),
    data: base64,
    directory: CACHE_DIR,
    recursive: true,
  });

  const uri = await Filesystem.getUri({
    path: getLocalPath(fileName),
    directory: CACHE_DIR,
  });

  const fileSrc = Capacitor.convertFileSrc(uri.uri);
  if (!Capacitor.isNativePlatform || !fileSrc.startsWith("http")) {
    const readResult = await Filesystem.readFile({
      path: getLocalPath(fileName),
      directory: CACHE_DIR,
    });

    const blob = await (
      await fetch(`data:image/webp;base64,${readResult.data}`)
    ).blob();

    return URL.createObjectURL(blob);
  }

  return fileSrc;
};

export async function getCacheSize(): Promise<number> {
  try {
    const result = await Filesystem.readdir({
      path: "exercise-images", // your folder
      directory: Directory.Cache,
    });

    let totalSize = 0;

    for (const file of result.files) {
      if (file.type === "file") {
        const stat = await Filesystem.stat({
          path: `exercise-images/${file.name}`,
          directory: Directory.Cache,
        });
        totalSize += stat.size || 0;
      }
    }

    return totalSize / 1048576; // in MB
  } catch (e) {
    console.warn("Cache size check failed", e);
    return 0;
  }
}

export async function clearExerciseCache() {
  try {
    await Filesystem.rmdir({
      path: "exercise-images",
      directory: Directory.Cache,
      recursive: true,
    });
    console.log("Cache cleared");
  } catch (e) {
    // Directory might not exist
  }
}
