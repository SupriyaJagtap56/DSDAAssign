const { decompressImage } = require("./decompress");
const { main } = require("./HUFF");

start();
async function start() {
  const { huffmanCodes, huffmanTree } = await main();
  const compressedData = fs.readFileSync("compressed_data.txt", "utf-8");

  // Example usage
  const compressedImageFile = "compressed_image.bin";
  const outputFile = "decompressed_image.png";
  decompressImage();
}
