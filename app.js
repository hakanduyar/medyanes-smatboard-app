// Canvas ve çizim ile ilgili öğeleri seçiyoruz
// Canvas ve çizim ile ilgili öğeleri seçiyoruz
const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const toolBtns = document.querySelectorAll(".tool");
const fillColor = document.querySelector("#fill-color");
const sizeSlider = document.querySelector("#size-slider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearCanvas = document.querySelector(".clear-canvas");
const saveImg = document.querySelector(".save-img");
const toolsBoard = document.querySelector(".tools-board");
const scrollContainer = document.querySelector(".scroll-container");
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const maxZoomLevel = 3; // Maksimum zoom seviyesi
const minZoomLevel = 0.5; // Minimum zoom seviyesi
const totalPagesElement = document.getElementById("total-pages");
const currentPageElement = document.getElementById("current-page");

let zoomLevel = 1; // Başlangıç zoom seviyesi
let isDragging = false;
let startX, startY, initialLeft, initialTop;

// Araçlar panelinin sürüklenmesini başlatan fonksiyon
toolsBoard.addEventListener("mousedown", startDragging);
// Canvas ve doküman üzerinde sürüklemeyi kontrol eden fonksiyonlar
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", stopDragging);

// URL parametresinden kitabın ismini alıyoruz
const urlParams = new URLSearchParams(window.location.search);
const baseImageName = urlParams.get('book') || 'Dusunme-Becerileri-ve-Kodlama';

// Kitap klasöründeki toplam sayfa sayısını dinamik olarak belirle
let totalPages = 0;
let pageNum = 1; // Başlangıç sayfası

// Kitap klasöründeki resimlerin sayısını bulmak için bir async fonksiyon
const fetchTotalPages = async () => {
    try {
        let foundPages = 0;
        while (true) {
            const response = await fetch(`assets/books/${baseImageName}/${baseImageName}_Page_${(foundPages + 1).toString().padStart(2, "0")}.png`);
            if (response.ok) {
                foundPages++;
            } else {
                break;
            }
        }
        totalPages = foundPages;
        updatePageNumber();
    } catch (error) {
        console.error("Toplam sayfa sayısı alınamadı:", error);
    }
};


// Sayfa yüklendiğinde toplam sayfa sayısını belirliyoruz
window.addEventListener("load", async () => {
    await fetchTotalPages();
    setCanvasDimensions();
    showImage(pageNum);
});

let prevMouseX,
    prevMouseY,
    snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000";

// Çizim kanvasını yaratıyoruz ve ana kanvas üzerine ekliyoruz
const drawingCanvas = document.createElement("canvas");
const drawingCtx = drawingCanvas.getContext("2d");
document.querySelector(".drawing-board").appendChild(drawingCanvas);

// Sayfa yüklendiğinde canvas boyutlarını ve resmi gösteren fonksiyon
window.addEventListener("load", () => {
    setCanvasDimensions();
    showImage(pageNum);
});

// Canvas boyutlarını ayarlayan fonksiyon
function setCanvasDimensions() {
    drawingCanvas.width = canvas.width;
    drawingCanvas.height = canvas.height;
    drawingCanvas.style.position = "absolute";
    drawingCanvas.style.left = canvas.offsetLeft + "px";
    drawingCanvas.style.top = canvas.offsetTop + "px";
    document.querySelector(".drawing-board").appendChild(drawingCanvas);
}

// Araçlar panelinin sürüklenmesini başlatan fonksiyon
function startDragging(e) {
    if (e.target === toolsBoard || e.target.classList.contains("row")) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = toolsBoard.offsetLeft;
        initialTop = toolsBoard.offsetTop;
        document.body.style.userSelect = "none";
    }
}

// Sürükleme hareketini işleyen fonksiyon
function drag(e) {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const newLeft = initialLeft + deltaX;
    const newTop = initialTop + deltaY;

    const maxX = window.innerWidth - toolsBoard.offsetWidth;
    const maxY = window.innerHeight - toolsBoard.offsetHeight;

    toolsBoard.style.left = `${Math.max(0, Math.min(newLeft, maxX))}px`;
    toolsBoard.style.top = `${Math.max(0, Math.min(newTop, maxY))}px`;
}

// Sürüklemeyi durduran fonksiyon
function stopDragging() {
    isDragging = false;
    document.body.style.userSelect = "";
}

// Sayfa numarasını gösteren fonksiyon
const showImage = (num) => {
    const img = new Image();
    img.src = `assets/books/${baseImageName}/${baseImageName}_Page_${num.toString().padStart(2, "0")}.png`;
    img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxWidth = window.innerWidth * 1;
        const maxHeight = window.innerHeight * 1;

        let newWidth = maxWidth;
        let newHeight = newWidth / aspectRatio;

        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        setCanvasDimensions();
    };
};

// Sayfa numarasını güncelleyen fonksiyon
function updatePageNumber() {
    currentPageElement.textContent = pageNum;
    totalPagesElement.textContent = totalPages;
}

// Bir sonraki sayfayı gösteren fonksiyon
const nextPage = () => {
    if (pageNum < totalPages) {
        pageNum++;
        showImage(pageNum);
        clearDrawingCanvas();
        updatePageNumber(); // Sayfa numarasını güncelle
    }
};

// Önceki sayfayı gösteren fonksiyon
const prevPage = () => {
    if (pageNum > 1) {
        pageNum--;
        showImage(pageNum);
        clearDrawingCanvas();
        updatePageNumber(); // Sayfa numarasını güncelle
    }
};

// Çizim kanvasını temizleyen fonksiyon
function clearDrawingCanvas() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

// Çizim işlemini başlatan fonksiyon
const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    drawingCtx.beginPath();
    drawingCtx.lineWidth = brushWidth;
    snapshot = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    setDrawingStyle();
};

// Çizim işlemini gerçekleştiren fonksiyon
const drawing = (e) => {
    if (!isDrawing) return;
    drawingCtx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        drawingCtx.lineTo(e.offsetX, e.offsetY);
        drawingCtx.stroke();
    } else if (selectedTool === "rectangle" || selectedTool === "rectangle-filled") {
        drawRect(e);
    } else if (selectedTool === "circle" || selectedTool === "circle-filled") {
        drawCircle(e);
    } else if (selectedTool === "triangle" || selectedTool === "triangle-filled") {
        drawTriangle(e);
    }
};

// Çizim stilini ayarlayan fonksiyon
const setDrawingStyle = () => {
    if (selectedTool === "eraser") {
        drawingCtx.globalCompositeOperation = "destination-out";
        drawingCtx.strokeStyle = "rgba(255,255,255,1)";
    } else {
        drawingCtx.globalCompositeOperation = "source-over";
        drawingCtx.strokeStyle = selectedColor;
    }
    drawingCtx.fillStyle = selectedColor;
};

// Dikdörtgen çizen fonksiyon
const drawRect = (e) => {
    if (fillColor.checked) {
        drawingCtx.fillRect(
            Math.min(prevMouseX, e.offsetX),
            Math.min(prevMouseY, e.offsetY),
            Math.abs(prevMouseX - e.offsetX),
            Math.abs(prevMouseY - e.offsetY)
        );
    } else {
        drawingCtx.strokeRect(
            Math.min(prevMouseX, e.offsetX),
            Math.min(prevMouseY, e.offsetY),
            Math.abs(prevMouseX - e.offsetX),
            Math.abs(prevMouseY - e.offsetY)
        );
    }
};

// Çember çizen fonksiyon
const drawCircle = (e) => {
    drawingCtx.beginPath();
    let radius = Math.sqrt(
        Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
    );
    drawingCtx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    if (fillColor.checked) {
        drawingCtx.fill();
    } else {
        drawingCtx.stroke();
    }
};

// Üçgen çizen fonksiyon
const drawTriangle = (e) => {
    drawingCtx.beginPath();
    drawingCtx.moveTo(prevMouseX, prevMouseY);
    drawingCtx.lineTo(e.offsetX, e.offsetY);
    drawingCtx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    drawingCtx.closePath();
    if (fillColor.checked) {
        drawingCtx.fill();
    } else {
        drawingCtx.stroke();
    }
};

// Araç seçim butonlarına event listener ekleyen fonksiyon
toolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        if (selectedTool === "rectangle-filled") {
            fillColor.checked = true;
            selectedTool = "rectangle";
        } else if (selectedTool === "circle-filled") {
            fillColor.checked = true;
            selectedTool = "circle";
        } else if (selectedTool === "triangle-filled") {
            fillColor.checked = true;
            selectedTool = "triangle";
        } else {
            fillColor.checked = false;
        }
        setDrawingStyle();
    });
});

// Renk butonlarına event listener ekleyen fonksiyon
colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window
            .getComputedStyle(btn)
            .getPropertyValue("background-color");
    });
});

// Araçlar paneline tıklama event listener ekleyen fonksiyon
toolsBoard.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
        e.stopPropagation();
    }
});

// Renk seçiciye değişiklik event listener ekleyen fonksiyon
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

// Canvas'ı temizleyen fonksiyon
clearCanvas.addEventListener("click", () => {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

// Fırça boyutunu ayarlayan fonksiyon
sizeSlider.addEventListener("change", () => {
    brushWidth = sizeSlider.value;
});

// Resmi kaydeden fonksiyon
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${baseImageName}_Page_${pageNum.toString().padStart(2, "0")}.png`;
    link.href = drawingCanvas.toDataURL();
    link.click();
});

// RGB rengini HEX formatına çeviren fonksiyon
const rgbToHex = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toUpperCase()}`;
};

// Çizim yapmaya başlamak için event listener ekleyen fonksiyon
canvas.addEventListener("mousedown", startDraw);
// Çizim yapmayı gerçekleştiren event listener
canvas.addEventListener("mousemove", drawing);
// Çizimi bitiren event listener
canvas.addEventListener("mouseup", () => (isDrawing = false));

// Zoom seviyesini güncelleyen fonksiyon
const updateZoom = () => {
    // Zoom uygulaması
    canvas.style.transform = `scale(${zoomLevel})`;
    canvas.style.transformOrigin = "0 0";
    
    // Canvas boyutlarını güncelle
    const newWidth = canvas.width * zoomLevel;
    const newHeight = canvas.height * zoomLevel;

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    // Ekranın ortasında konumlandır
    scrollContainer.scrollLeft = (newWidth - scrollContainer.clientWidth) / 2;
    scrollContainer.scrollTop = (newHeight - scrollContainer.clientHeight) / 2;
};

// Zoom butonlarına event listener ekleyen fonksiyon
zoomInBtn.addEventListener("click", () => {
    if (zoomLevel < maxZoomLevel) {
        zoomLevel += 0.1;
        updateZoom();
    }
});

zoomOutBtn.addEventListener("click", () => {
    if (zoomLevel > minZoomLevel) {
        zoomLevel -= 0.1;
        updateZoom();
    }
});

// Sonraki ve önceki sayfa butonlarına event listener ekleyen fonksiyonlar
document.getElementById("next-page").addEventListener("click", nextPage);
document.getElementById("prev-page").addEventListener("click", prevPage);

// Çizim kanvasına event listener ekleyen fonksiyonlar
drawingCanvas.addEventListener("mousedown", startDraw);
drawingCanvas.addEventListener("mousemove", drawing);
drawingCanvas.addEventListener("mouseup", () => {
    isDrawing = false;
    drawingCtx.globalCompositeOperation = "source-over"; // Silgi kullanımından sonra normal çizim moduna dön
});

// Sayfa numarası popup işlemleri
document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("popup");
    const openPopupButton = document.getElementById("page-number-btn");
    const closePopupButton = document.querySelector(".popup .close");
    const goButton = document.getElementById("go-button");
    const pageInput = document.getElementById("page-input");
    const numButtons = document.querySelectorAll(".num-buttons button:not(#clear, #go-button)");
    const clearButton = document.getElementById("clear");
    const currentPageElement = document.getElementById("current-page");

    // Keyboard popup işlemleri
    const keyboardPopup = document.getElementById("keyboard-popup");
    const openKeyboardButton = document.getElementById("open-keyboard-btn");
    const closeKeyboardButton = document.getElementById("close-keyboard");
    const keyboardInput = document.getElementById("keyboard-input");
    const keys = document.querySelectorAll("#keyboard .keypad .key");
    const clearKeyboardButton = document.getElementById("clear-keyboard");
    const submitKeyboardButton = document.getElementById("submit-keyboard");

    // Sayfa numarası popup'ını açma işlemi
    openPopupButton.addEventListener("click", () => {
        pageInput.value = ""; // Input'u temizle
        popup.style.display = "flex";
    });

    // Sayfa numarası popup'ını kapama işlemi
    closePopupButton.addEventListener("click", () => {
        popup.style.display = "none";
    });

    // Sayfa numarası butonlarına event listener ekleyen fonksiyon
    numButtons.forEach(button => {
        button.addEventListener("click", () => {
            pageInput.value += button.textContent;
        });
    });

    // Sayfa numarasını temizleyen butona event listener ekleyen fonksiyon
    clearButton.addEventListener("click", () => {
        pageInput.value = "";
    });

    // Sayfa numarasını güncelleyen butona event listener ekleyen fonksiyon
    goButton.addEventListener("click", () => {
        const pageNumber = parseInt(pageInput.value, 10);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            pageNum = pageNumber;
            showImage(pageNum);
            clearDrawingCanvas();
            currentPageElement.textContent = pageNum; // Sayfa numarasını güncelle
            popup.style.display = "none";
        }
    });

    // Keyboard popup'ını açma işlemi
    openKeyboardButton.addEventListener("click", () => {
        keyboardPopup.style.display = "flex";
    });

    // Keyboard popup'ını kapama işlemi
    closeKeyboardButton.addEventListener("click", () => {
        keyboardPopup.style.display = "none";
    });

    // Keyboard tuşlarına event listener ekleyen fonksiyon
    keys.forEach(key => {
        key.addEventListener("click", () => {
            keyboardInput.value += key.textContent;
        });
    });

    // Keyboard input'u temizleyen butona event listener ekleyen fonksiyon
    clearKeyboardButton.addEventListener("click", () => {
        keyboardInput.value = "";
    });

    // Keyboard input'u canvas'a ekleyen butona event listener ekleyen fonksiyon
    submitKeyboardButton.addEventListener("click", () => {
        // Canvas'a yazıyı ekleme
        ctx.font = "20px Arial";
        ctx.fillStyle = "#000"; // Yazı rengini ayarlayın
        ctx.fillText(keyboardInput.value, 50, 50); // Yazıyı canvas üzerinde belirli bir pozisyona çizin

        keyboardPopup.style.display = "none";
    });
});

