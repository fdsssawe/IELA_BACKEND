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

    // X-axis labels
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    for (let i = 0; i < data.length; i += 50) {
        ctx.fillText(i, 50 + i * barWidth, ctx.canvas.height + 15);
    }

    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i <= Math.max(...data); i += 50) {
        ctx.fillText(i, 45, ctx.canvas.height - i * scaleFactor);
    }

    // Draw histogram bars
    for (let i = 0; i < data.length; i++) {
        const barHeight = data[i] * scaleFactor;
        ctx.fillStyle = 'black';
        ctx.fillRect(50 + i * barWidth, ctx.canvas.height - barHeight, barWidth, barHeight);
    }

    // Legend
    ctx.fillStyle = 'black';
    ctx.fillText("Brightness", ctx.canvas.width / 2, ctx.canvas.height + 40);
    ctx.fillText("Frequency", 15, ctx.canvas.height / 2);
}