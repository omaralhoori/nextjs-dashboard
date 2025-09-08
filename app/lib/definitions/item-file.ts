export interface ItemFile {
  id: string;
  file_type: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
}

export interface ItemWithFiles {
  item: any; // Item data
  files: ItemFile[];
}

export interface UploadImageResponse {
  message: string;
  fileId: string;
  filename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  fileType: string;
}
