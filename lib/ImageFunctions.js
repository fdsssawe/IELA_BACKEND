import { registerFont } from "canvas";
import { fileURLToPath } from "url"
import { dirname } from "path"; 
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
      return fontSize;
    }
  
    const FONT_SIZE_DIVISOR = 35;
    const LABEL_MARGIN = 30; // Adjust margin size as needed
  
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
  
    // Draw "Brightness" label with padding at bottom
    ctx.fillText('Brightness', ctx.canvas.width / 2, ctx.canvas.height - padding);
  
    // Draw "Frequency" label inside y-axis with adjusted positioning and margin
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Frequency', -(ctx.canvas.height / 2 + fontSize / 2 + LABEL_MARGIN), 20); // Adjust y position, padding, and margin
    ctx.restore();
  
    // You can now use canvas.toDataURL() to generate the image
  }