import { registerFont } from "canvas";
import { fileURLToPath } from "url"
import pathForArial from "arial-for-vercel"

try {
    registerFont(pathForArial, { family: "Arial" })
}
catch(e){
    console.log(e)
}

export function analyzeImage(ctx, image) {  
    const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < pixels.length; i += 4) {
        const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        histogram[Math.round(brightness)]++;
    }

    return histogram;
}

export function buildHistogram(ctx, data) {
    const barWidth = Math.floor(ctx.canvas.width / data.length);
    const scaleFactor = ctx.canvas.height / Math.max(...data);
  
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    // Draw x and y axes
    ctx.beginPath();
    ctx.moveTo(50, ctx.canvas.height);
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
    ctx.stroke();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, ctx.canvas.height);
    ctx.stroke();
  
    // Function to adjust font size based on canvas size
    function adjustFontSize(minSize, maxSize) {
      const fontSize = Math.min(maxSize, Math.max(minSize, ctx.canvas.width / FONT_SIZE_DIVISOR));
      ctx.font = `${fontSize}px arial`;
      return fontSize; // Return the calculated font size for padding calculation
    }
  
    const FONT_SIZE_DIVISOR = 35;
  
    // Draw bars
    for (let i = 0; i < data.length; i++) {
      const barHeight = data[i] * scaleFactor;
      ctx.fillStyle = `hsl(${i / data.length * 360}, 100%, 50%)`;
      ctx.fillRect(50 + i * barWidth, ctx.canvas.height - barHeight, barWidth, barHeight);
    }
  
    // Draw labels with adjusted font size
    const fontSize = adjustFontSize(16, 150); // Minimum and maximum font size
    const padding = fontSize / 1.8; // Adjust padding based on font size
  
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('Brightness', ctx.canvas.width / 2, ctx.canvas.height - padding); // Add padding to y position
  
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    adjustFontSize(16, 150); // Adjust minimum and maximum for vertical label
    ctx.fillText('Frequency', -ctx.canvas.height / 2, 20);
    ctx.restore();
  }

  export function getMean(data, offset) {
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += data[i + offset];
    }
    return sum / (data.length / 4);
  }

  export function analyzeImageExtra(ctx, imageData) {
    const imageDataCopy = ctx.getImageData(0, 0, imageData.width, imageData.height);
    const data = imageDataCopy.data;
  
    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const averageBrightness = totalBrightness / (data.length / 4);
  
    // Analyze clipping (assuming values outside 0-255 are clipped)
    let clippedPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 0 || data[i] > 255 || data[i + 1] < 0 || data[i + 1] > 255 || data[i + 2] < 0 || data[i + 2] > 255) {
        clippedPixels++;
      }
    }
    const clippingPercentage = (clippedPixels / (data.length / 4)) * 100;
  
    // Dynamic range (assuming 8-bit image, adjust if needed)
    const dynamicRange = 255;
  
    // Noise analysis (basic approach using standard deviation, more advanced techniques exist)
    let redVariance = 0;
    let greenVariance = 0;
    let blueVariance = 0;
    const meanRed = getMean(data, 0);
    const meanGreen = getMean(data, 1);
    const meanBlue = getMean(data, 2);
    for (let i = 0; i < data.length; i += 4) {
      redVariance += Math.pow(data[i] - meanRed, 2);
      greenVariance += Math.pow(data[i + 1] - meanGreen, 2);
      blueVariance += Math.pow(data[i + 2] - meanBlue, 2);
    }
    const averageNoise = Math.sqrt((redVariance + greenVariance + blueVariance) / (data.length / 4));
  
    // White balance (basic check for average R, G, B values)
    const isWhiteBalanced = Math.abs(meanRed - meanGreen) < 10 &&   Math.abs(meanGreen - meanBlue) < 10;

    // Color space (basic check based on dominant channel)
    let dominantChannel = 'R';
    if (meanGreen > meanRed && meanGreen > meanBlue) {
      dominantChannel = 'G';
    } else if (meanBlue > meanRed && meanBlue > meanGreen) {
      dominantChannel = 'B';
    }
    const colorSpace = dominantChannel === 'R' ? 'Likely RGB' : (dominantChannel === 'G' ? 'Likely GBR' : 'Likely BGR');
  
    // Brightness assumption (adjust threshold as needed)
    const brightness = averageBrightness > 128 ? 'Bright' : 'Dark';
  
    return {
      averageBrightness,
      clippingPercentage,
      dynamicRange,
      averageNoise,
      isWhiteBalanced,
      colorSpace,
      brightness,
    };
  }