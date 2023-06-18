const sharp = require("sharp");
const Heap = require("heap");

// Node class for Huffman tree
class Node {
  constructor(freq, pixel = null, left = null, right = null) {
    this.freq = freq;
    this.pixel = pixel;
    this.left = left;
    this.right = right;
  }
  isLeaf() {
    return !this.left && !this.right;
  }
}

exports.Node = Node;

// Function to calculate frequency of each pixel value
function calculateFrequencies(pixels) {
  const frequencies = new Map();
  pixels.forEach((pixel) => {
    if (!frequencies.has(pixel)) {
      frequencies.set(pixel, 0);
    }
    frequencies.set(pixel, frequencies.get(pixel) + 1);
  });
  return frequencies;
}

// Function to build the Huffman tree
function buildHuffmanTree(frequencies) {
  const heap = new Heap((a, b) => a.freq - b.freq);
  frequencies.forEach((freq, pixel) => heap.push(new Node(freq, pixel)));

  while (heap.size() > 1) {
    const node1 = heap.pop();
    const node2 = heap.pop();
    const merged = new Node(node1.freq + node2.freq, null, node1, node2);
    heap.push(merged);
  }

  return heap.peek();
}

// Function to generate Huffman codes for each pixel value
function generateHuffmanCodes(root) {
  const codes = new Map();

  function traverse(node, code) {
    if (node.pixel !== null) {
      codes.set(node.pixel, code);
    } else {
      traverse(node.left, code + "0");
      traverse(node.right, code + "1");
    }
  }

  traverse(root, "");

  return codes;
}

// Function to compress the image using Huffman codes
function compressImage(image, codes) {
  let compressedData = "";
  const pixels = image;
  for (let i = 0; i < pixels.length; i += 4) {
    const code = codes.get(pixels[i]);
    compressedData += code;
  }

  return compressedData;
}

// Function to convert binary string to bytes
function convertToBytes(binaryString) {
  const byteCount = Math.ceil(binaryString.length / 8);
  const bytes = [];
  for (let i = 0; i < byteCount; i++) {
    const byte = parseInt(binaryString.substr(i * 8, 8), 2);
    bytes.push(byte);
  }
  return Uint8Array.from(bytes);
}

const inputImage = "Input-Image-1.png";
// Example usage
async function main() {
  // Load the image using sharp
  const fs = require("fs");

  const image = await sharp(inputImage).raw().toBuffer();

  const metadata = await sharp(inputImage).metadata();
  const { width, height } = metadata;
  fs.writeFileSync("imageDim.json", JSON.stringify({ width, height }));

  console.log("Original byte length: " + Buffer.byteLength(image));

  // Calculate frequencies of pixel values
  const frequencies = calculateFrequencies(image);

  // Build Huffman tree
  const huffmanTree = buildHuffmanTree(frequencies);

  // Generate Huffman codes
  const huffmanCodes = generateHuffmanCodes(huffmanTree);

  // Compress the image
  const compressedData = compressImage(image, huffmanCodes);

  fs.writeFileSync("compressed_data.txt", compressedData);

  // Convert binary string to bytes
  const compressedBytes = convertToBytes(compressedData);
  console.log("Compressed image byte length: " + compressedBytes.length);
  fs.writeFileSync("compressed_bytes.txt", compressedBytes);

  // Save the compressed image
  fs.writeFileSync("compressed_image.bin", compressedBytes);

  console.log("Image compression complete!");

  fs.writeFileSync(
    "compressed_image_data.json",
    JSON.stringify({
      huffmanCodes: Object.fromEntries(huffmanCodes),
      huffmanTree,
    })
  );
  console.log(huffmanCodes);
  return { huffmanCodes, huffmanTree };
}

main();

exports.main = main;

// // const { huffmanCodes, huffmanTree } = main();

// exports.huffmanCodes = huffmanCodes;
// exports.huffmanTree = huffmanTree;

// //

// const fs = require("fs");

// // Node class for the Huffman tree
// class Node {
//   constructor(freq, pixel, left, right) {
//     this.freq = freq;
//     this.pixel = pixel;
//     this.left = left;
//     this.right = right;
//   }

//   isLeaf() {
//     return !this.left && !this.right;
//   }
// }

// // Function to build the Huffman tree
// function buildHuffmanTree(frequencies) {
//   const heap = new Heap((a, b) => a.freq - b.freq);
//   frequencies.forEach((freq, pixel) => heap.push(new Node(freq, pixel)));

//   while (heap.size() > 1) {
//     const node1 = heap.pop();
//     const node2 = heap.pop();
//     const merged = new Node(node1.freq + node2.freq, null, node1, node2);
//     heap.push(merged);
//   }

//   return heap.peek();
// }

// // Function to decompress the Huffman-coded image
// function decompressImage(compressedImageFile, huffmanTreeFile, outputFile) {
//   // Read the Huffman tree from file
//   const huffmanTreeData = fs.readFileSync(huffmanTreeFile, "utf8");
//   const huffmanTree = JSON.parse(huffmanTreeData);

//   // Build the Huffman tree from the provided heap representation
//   const root = buildHuffmanTree(huffmanTree.heap);

//   // Read the compressed image data from file
//   const compressedData = fs.readFileSync(compressedImageFile);

//   // Convert binary data to a binary string
//   let binaryString = "";
//   for (let i = 0; i < compressedData.length; i++) {
//     binaryString += compressedData[i].toString(2).padStart(8, "0");
//   }

//   // Perform the Huffman decoding
//   let currentNode = root;
//   let decompressedPixels = [];
//   for (let i = 0; i < binaryString.length; i++) {
//     const bit = binaryString[i];
//     currentNode = bit === "0" ? currentNode.left : currentNode.right;

//     if (currentNode.isLeaf()) {
//       decompressedPixels.push(currentNode.pixel);
//       currentNode = root;
//     }
//   }

//   // Write the decompressed pixels to the output file
//   const outputData = Buffer.from(decompressedPixels);
//   fs.writeFileSync(outputFile, outputData);

//   console.log(`Decompressed image saved to ${outputFile}`);
// }

// // Example usage
// const compressedImageFile = "compressed_image.bin";
// const huffmanTreeFile = "huffman_tree.txt";
// const outputFile = "decompressed_image.png";

// decompressImage(compressedImageFile, huffmanTreeFile, outputFile);
