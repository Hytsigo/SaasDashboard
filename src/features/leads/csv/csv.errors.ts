export class CsvImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvImportError";
  }
}
