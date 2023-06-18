const sharp = require("sharp");
const Heap = require("heap");
const fs = require("fs");
const { Node } = require("./HUFF");

// Function to convert bytes to binary string
function convertToBinaryString(compressedBytes) {
  let binaryString = "";
  for (let i = 0; i < compressedBytes.length; i++) {
    binaryString += compressedBytes[i].toString(2).padStart(8, "0");
  }
  return binaryString;
}
// Function to convert binary string to bytes
function convertToBytes(binaryString) {
  const byteCount = Math.ceil(binaryString.length / 8);
  const bytes = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    const byte = parseInt(binaryString.substr(i * 8, 8), 2);
    bytes[i] = byte;
  }
  return bytes;
}

// Function to reconstruct the Huffman tree using loaded data
function reconstructHuffmanTree(frequencies) {
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

// Function to decode the compressed data and reconstruct the original pixel values
function decompressImage(compressedData, huffmanTree) {
  let decompressedPixels = [];
  let currentNode = huffmanTree;

  for (let i = 0; i < compressedData.length; i++) {
    const bit = compressedData[i];
    if (bit === "0") {
      currentNode = currentNode.left;
    } else if (bit === "1") {
      currentNode = currentNode.right;
    }

    if (currentNode.isLeaf()) {
      decompressedPixels.push(currentNode.pixel);
      currentNode = huffmanTree;
    }
  }

  return decompressedPixels;
}

// Load the compressed data
startDecompress();

exports.decompressImage = decompressImage;

function startDecompress() {
  const compressedData = fs.readFileSync("compressed_data.txt", "utf-8");

  // Convert binary string to bytes
  //   const compressedBytes = convertToBytes(compressedData);

  // Load the Huffman codes and tree used for compression
  // (Assuming you have saved them using the main() function)
  const { huffmanCodes, huffmanTree } = require("./compressed_image_data.json");

  const convertedHuffmanCodes = new Map(Object.entries(huffmanCodes));

  // Reconstruct the Huffman tree using loaded data
  const reconstructedTree = reconstructHuffmanTree(convertedHuffmanCodes);

  fs.writeFileSync(
    "reconstructed_tree.json",
    JSON.stringify(reconstructedTree)
  );

  // Decode the compressed data and reconstruct the original pixel values
  const decompressedPixels = decompressImage(compressedData, reconstructedTree);

  // Convert the pixel values to a buffer for image creation
  const pixelBuffer = Buffer.from(decompressedPixels);

  // Create a sharp image from the pixel buffer
  const image = sharp(pixelBuffer, {
    raw: {
      width: 246,
      height: 64,
      channels: 4, // Assuming 4 channels (RGBA)
    },
  });

  // Save the decompressed image
  image.toFile("decompressed_image.png", (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Decompressed image saved successfully!");
    }
  });
}

exports.startDecompress = startDecompress;
