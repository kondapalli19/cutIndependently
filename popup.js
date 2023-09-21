// Variables
let image;
let canvas;
let context;
let startX, startY, endX, endY;
let isDrawing = false;

// Event listeners for canvas drawing
const imageCanvas = document.getElementById('imageCanvas');
imageCanvas.addEventListener('mousedown', startDrawing);
imageCanvas.addEventListener('mousemove', drawSelection);
imageCanvas.addEventListener('mouseup', endDrawing);

// Event listener for cut button
const cutButton = document.getElementById('cutButton');
cutButton.addEventListener('click', cutDesiredPart);

// Initialize the canvas
function initializeCanvas() {
  canvas = document.getElementById('imageCanvas');
  context = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
}

// Start drawing selection
function startDrawing(event) {
  startX = event.offsetX;
  startY = event.offsetY;
  isDrawing = true;
}

// Draw selection
function drawSelection(event) {
  if (!isDrawing) return;
  endX = event.offsetX;
  endY = event.offsetY;
  clearCanvas();
  context.drawImage(image, 0, 0);
  context.strokeStyle = 'red';
  context.lineWidth = 2;
  context.strokeRect(startX, startY, endX - startX, endY - startY);
}

// End drawing selection
function endDrawing() {
  isDrawing = false;
}

// Clear the canvas
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Cut the desired part from the image
function cutDesiredPart() {
  const resultCanvas = document.createElement('canvas');
  const resultContext = resultCanvas.getContext('2d');
  resultCanvas.width = endX - startX;
  resultCanvas.height = endY - startY;
  resultContext.drawImage(
    image,
    startX,
    startY,
    endX - startX,
    endY - startY,
    0,
    0,
    resultCanvas.width,
    resultCanvas.height
  );

  const cutImageData = resultCanvas.toDataURL("image/png");

  // Send message to the background script to save the image
  chrome.runtime.sendMessage({ imageData: cutImageData }, function (response) {
    console.log(response.message);
  });
}

// Request screenshot from the background script
chrome.runtime.sendMessage({ action: "captureScreen" }, function (response) {
  if (response && response.imageData) {
    image = new Image();
    image.src = response.imageData;
    image.onload = function () {
      initializeCanvas();
      cutButton.disabled = false;
    };
  }
});
