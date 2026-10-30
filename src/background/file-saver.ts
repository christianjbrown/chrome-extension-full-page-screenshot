export interface FileSaver {
  save(url: string, filename: string): Promise<void>;
}
