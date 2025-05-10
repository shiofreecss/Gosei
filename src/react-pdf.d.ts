declare module 'react-pdf' {
  import { ComponentType, ReactElement } from 'react';

  export interface DocumentProps {
    file: string | File | ArrayBuffer;
    loading?: ReactElement | string;
    error?: ReactElement | string;
    onLoadSuccess?: (pdf: { numPages: number }) => void;
    onLoadError?: (error: Error) => void;
    children?: React.ReactNode;
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    height?: number;
    scale?: number;
    rotate?: number;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
    loading?: ReactElement | string;
    error?: ReactElement | string;
    onLoadSuccess?: () => void;
    onLoadError?: (error: Error) => void;
    customTextRenderer?: (props: any) => ReactElement;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
  
  export const pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    version: string;
  };
} 