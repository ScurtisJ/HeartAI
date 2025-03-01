declare module 'tesseract.js' {
  interface Worker {
    loadLanguage(lang: string): Promise<void>
    initialize(lang: string): Promise<void>
    terminate(): Promise<void>
    recognize(image: File | string | HTMLImageElement): Promise<{
      data: {
        text: string
      }
    }>
  }

  interface CreateWorkerOptions {
    logger?: (message: string) => void
    errorHandler?: (error: Error) => void
  }

  export function createWorker(options?: CreateWorkerOptions): Promise<Worker>
} 