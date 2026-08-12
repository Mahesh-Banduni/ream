declare module "imagekit" {
  interface ImageKitOptions {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
  }

  interface UploadOptions {
    file: Buffer;
    fileName: string;
    folder?: string;
  }

  export default class ImageKit {
    constructor(options: ImageKitOptions);
    upload(options: UploadOptions): Promise<Record<string, unknown>>;
  }
}

declare module "nodemailer" {
  interface TransportOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user?: string;
      pass?: string;
    };
    tls?: {
      rejectUnauthorized?: boolean;
    };
  }

  interface SendMailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
  }

  const nodemailer: {
    createTransport(options: TransportOptions): {
      sendMail(options: SendMailOptions): Promise<unknown>;
    };
  };

  export default nodemailer;
}
