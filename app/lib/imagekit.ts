type UploadOptions = {
  file: Buffer;
  fileName: string;
  folder?: string;
};

type ImageKitUploadResult = {
  url: string;
  fileId?: string;
  name?: string;
  filePath?: string;
  [key: string]: unknown;
};

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

function getPrivateKey() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not configured.");
  }

  return privateKey;
}

async function upload(options: UploadOptions): Promise<ImageKitUploadResult> {
  const formData = new FormData();
  formData.append("file", new Blob([options.file]), options.fileName);
  formData.append("fileName", options.fileName);

  if (options.folder) {
    formData.append("folder", options.folder);
  }

  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${getPrivateKey()}:`).toString(
        "base64"
      )}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ImageKit upload failed (${response.status}): ${errorText}`
    );
  }

  return (await response.json()) as ImageKitUploadResult;
}

const imagekit = {
  upload,
};

export default imagekit;
