var fileInput = document.getElementById('fileInput');
var imageCanvas = document.getElementById('imageCanvas');
var imageCtx = imageCanvas.getContext('2d');
var histogramCanvas = document.getElementById('histogramCanvas');
var histogramCtx = histogramCanvas.getContext('2d');
var segmentedCanvas = document.getElementById('segmentedCanvas');
var segmentedCtx = segmentedCanvas.getContext('2d');

fileInput.addEventListener('change', function(event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var width = img.width;
            var height = img.height;

            if (width > 700 || height > 700) {
                if (width > height) {
                    height = Math.round((700 / width) * height);
                    width = 700;
                } else {
                    width = Math.round((700 / height) * width);
                    height = 700;
                }
            }

            imageCanvas.width = width;
            imageCanvas.height = height;
            imageCtx.drawImage(img, 0, 0, width, height);

            var imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
            var histogramData = analyzeImage(imageData);
            buildHistogram(histogramData);

            var pixels = [];
            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                pixels.push([r, g, b]);
            }

            const k = 5; // Кількість кластерів (зон)
            const kmeans = new KMeans();
            kmeans.init({data: pixels, k});
            const { clusters } = kmeans.run();

            const segmentedData = segmentedCtx.createImageData(imageCanvas.width, imageCanvas.height);
            for (let i = 0; i < pixels.length; i++) {
                const cluster = clusters[i];
                segmentedData.data[i * 4] = cluster.centroid[0];
                segmentedData.data[i * 4 + 1] = cluster.centroid[1];
                segmentedData.data[i * 4 + 2] = cluster.centroid[2];
                segmentedData.data[i * 4 + 3] = 255; // Альфа-канал
            }
            segmentedCtx.putImageData(segmentedData, 0, 0);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

function analyzeImage(imageData) {
    var pixels = imageData.data;
    var histogram = new Array(256).fill(0);

    for (var i = 0; i < pixels.length; i += 4) {
        var brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        histogram[Math.round(brightness)]++;
    }

    return histogram;
}

function buildHistogram(data) {
    histogramCanvas.width = 500;
    histogramCanvas.height = 300;
    var barWidth = Math.floor(histogramCanvas.width / data.length);
    var scaleFactor = histogramCanvas.height / Math.max(...data);

    histogramCtx.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);

    // Відобразити осі x та y
    histogramCtx.beginPath();
    histogramCtx.moveTo(50, histogramCanvas.height);
    histogramCtx.lineTo(histogramCanvas.width, histogramCanvas.height);
    histogramCtx.stroke();
    histogramCtx.moveTo(50, 0);
    histogramCtx.lineTo(50, histogramCanvas.height);
    histogramCtx.stroke();

    // Підписи осі x
    histogramCtx.font = "12px Arial";
    histogramCtx.textAlign = "center";
    for (var i = 0; i < data.length; i += 50) {
        histogramCtx.fillText(i, 50 + i * barWidth, histogramCanvas.height + 15);
    }

    // Підписи осі y
    histogramCtx.textAlign = "right";
    for (var i = 0; i <= Math.max(...data); i += 50) {
        histogramCtx.fillText(i, 45, histogramCanvas.height - i * scaleFactor);
    }

    // Побудувати гістограму
    for (var i = 0; i < data.length; i++) {
        var barHeight = data[i] * scaleFactor;
        histogramCtx.fillStyle = 'black';
        histogramCtx.fillRect(50 + i * barWidth, histogramCanvas.height - barHeight, barWidth, barHeight);
    }

    // Відобразити легенду
    histogramCtx.fillStyle = 'black';
    histogramCtx.fillText("Brightness", histogramCanvas.width / 2, histogramCanvas.height + 40);
    histogramCtx.fillText("Frequency", 15, histogramCanvas.height / 2);
}
