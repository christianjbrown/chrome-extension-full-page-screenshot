// Vite hands a file's text to a test that imports it with ?raw.
declare module "*?raw" {
  const text: string;
  export default text;
}
