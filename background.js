// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "captureScreen") {
    // Capture the screen and send the screenshot data back to the popup script
    chrome.tabs.captureVisibleTab(null, { format: "png" }, function (screenshotDataUrl) {
      sendResponse({ imageData: screenshotDataUrl });
    });

    // Return true to indicate that the sendResponse function will be called asynchronously
    return true;
  } else if (request.imageData) {
    // Save the cut image
    saveCutImage(request.imageData)
      .then(function () {
        sendResponse({ message: "Image saved successfully" });
      })
      .catch(function (error) {
        sendResponse({ message: "Error saving image: " + error });
      });

    // Return true to indicate that the sendResponse function will be called asynchronously
    return true;
  }
});

// Save the cut image

function saveCutImage(imageData) {
  return new Promise(function (resolve, reject) {
    const filename = 'cut_image.png';

    fetch(imageData)
      .then(function (response) {
        return response.blob();
      })
      .then(function (blob) {
        const reader = new FileReader();
        reader.onloadend = function () {
          const base64Data = reader.result.split(',')[1];

          const downloadOptions = {
            url: 'data:image/png;base64,' + base64Data,
            filename: filename,
            saveAs: true
          };

          chrome.downloads.download(downloadOptions, function (downloadId) {
            if (chrome.runtime.lastError) {
              reject('Error saving image: ' + chrome.runtime.lastError.message);
            } else {
              resolve();
            }
          });
        };

        reader.readAsDataURL(blob);
      })
      .catch(function (error) {
        reject('Error saving image: ' + error);
      });
  });
}






