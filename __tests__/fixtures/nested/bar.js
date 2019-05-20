const bar = "bar";
export default bar;

export function importChunk() {
  import("../chunked.js").then(({ default: chunked }) => console.log(chunked));
}
