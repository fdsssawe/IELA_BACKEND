import { registerFont } from "canvas";
import path from "path";
import { fileURLToPath } from "url"
import { dirname } from "path"; 

registerFont(process.cwd() + '/lib/Arial.TTF', { family: "Arial" }); // Register the Arial font

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

    // Draw bars
    for (let i = 0; i < data.length; i++) {
        const barHeight = data[i] * scaleFactor;
        ctx.fillStyle = `hsl(${i / data.length * 360}, 100%, 50%)`; // Color the bars using HSL
        ctx.fillRect(50 + i * barWidth, ctx.canvas.height - barHeight, barWidth, barHeight);
    }

    // Draw labels
    ctx.fillStyle = '#000';
    ctx.font = '16px arial'; // Specify the font family explicitly
    ctx.textBaseline = 'middle'; // Set the text baseline to middle
    ctx.textAlign = 'center'; // Set the text alignment to center
    ctx.fillText('Brightness', ctx.canvas.width / 2, ctx.canvas.height - 10);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Frequency', -ctx.canvas.height / 2, 20);
    ctx.restore();
}
