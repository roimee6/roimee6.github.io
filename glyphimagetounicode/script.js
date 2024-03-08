const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

dropZone.addEventListener("click", function() {
    fileInput.click();
});

fileInput.addEventListener("change", function(e) {
    if (e.target.files.length) {
        processImage(e.target.files[0]);
    }
});

dropZone.addEventListener("dragover", function(e) {
    e.preventDefault();
    dropZone.style.borderColor = "green";
});

dropZone.addEventListener("dragleave", function(e) {
    dropZone.style.borderColor = "white";
});

dropZone.addEventListener("drop", function(e) {
    e.preventDefault();
    dropZone.style.borderColor = "white";
    
    if (e.dataTransfer.files.length) {
        processImage(e.dataTransfer.files[0]);
    }
});

function processImage(file) {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();

        img.onload = function() {
            const fileName = file.name;
            const glyphName = fileName.split("_")[1].split(".")[0]

            let segments = Array(16).fill().map(() => []);
            let segmentCount = 0;

            const dropzone = document.getElementById("dropZone");
            dropzone.remove();

            const separator = img.width / 16;

            for (let x = 0; x < img.width; x += separator) {
                for (let y = 0; y < img.height; y += separator, segmentCount++) {
                    const segmentCanvas = document.createElement("canvas");
                    
                    segmentCanvas.width = separator;
                    segmentCanvas.height = separator;

                    const segmentCtx = segmentCanvas.getContext("2d");
                    segmentCanvas.classList.add("segment");
                
                    segmentCtx.drawImage(img, x, y, separator, separator, 0, 0, separator, separator);

                    segments[segmentCount % 16].push(segmentCanvas);
                }
            }

            let k = 0;

            for (const segmentIcon of segments) {
                let i = 0;

                for (const segmentCanvas of segmentIcon) {

                    const segmentWrapper = document.createElement("div");
                    segmentWrapper.classList.add("segmentWrapper");

                    const label = document.createElement("span");
                    const unicode = "U+" + glyphName + numberToLetter(k) + numberToLetter(i);
                    
                    label.classList.add("segmentLabel");
                    label.textContent = `Unicode: ${unicode} | Caracter: ${unicodeToChar(unicode)}`;
                    
                    segmentWrapper.appendChild(label);
                
                    segmentWrapper.appendChild(segmentCanvas);
                    segmentsContainer.appendChild(segmentWrapper);
                  
                    i++;
                }
            
                k++;
            }
        }

        img.src = e.target.result;
    }

    reader.readAsDataURL(file);
}

function unicodeToChar(input) {
    return input.replace(/U\+([0-9A-F]{4})/g, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

function numberToLetter(num) {
    if (num > 9) {
        return String.fromCharCode(65 + (num - 10)); // ASCII pour A commence à 65
    } else {
        return num.toString(); // Renvoie le nombre tel quel s'il est inférieur ou égal à 9
    }
}