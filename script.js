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

toolsBoard.addEventListener("mousedown", startDragging);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", stopDragging);

const baseImageName = "Dusunme-Becerileri-ve-Kodlama";
let pageNum = 1;
const totalPages = 32;

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = "brush",
  brushWidth = 5,
  selectedColor = "#000";

const drawingCanvas = document.createElement("canvas");
const drawingCtx = drawingCanvas.getContext("2d");
document.querySelector(".drawing-board").appendChild(drawingCanvas);

window.addEventListener("load", () => {
  setCanvasDimensions();
  showImage(pageNum);
});

function setCanvasDimensions() {
  drawingCanvas.width = canvas.width;
  drawingCanvas.height = canvas.height;
  drawingCanvas.style.position = "absolute";
  drawingCanvas.style.left = canvas.offsetLeft + "px";
  drawingCanvas.style.top = canvas.offsetTop + "px";
  document.querySelector(".drawing-board").appendChild(drawingCanvas);
}

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

function stopDragging() {
  isDragging = false;
  document.body.style.userSelect = "";
}

const showImage = (num) => {
  const img = new Image();
  img.src = `assets/images/${baseImageName}_Page_${num.toString().padStart(2, "0")}.png`;
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

// Sayfa yüklenirken toplam sayfa sayısını ve mevcut sayfa numarasını güncelle
window.addEventListener("load", () => {
  updatePageNumber();
});

// Sayfa değiştirme fonksiyonlarını güncelle
const nextPage = () => {
  if (pageNum < totalPages) {
    pageNum++;
    showImage(pageNum);
    clearDrawingCanvas();
    updatePageNumber(); // Sayfa numarasını güncelle
  }
};

const prevPage = () => {
  if (pageNum > 1) {
    pageNum--;
    showImage(pageNum);
    clearDrawingCanvas();
    updatePageNumber(); // Sayfa numarasını güncelle
  }
};

function clearDrawingCanvas() {
  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  drawingCtx.beginPath();
  drawingCtx.lineWidth = brushWidth;
  snapshot = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
  setDrawingStyle();
};

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

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window
      .getComputedStyle(btn)
      .getPropertyValue("background-color");
  });
});

toolsBoard.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
    e.stopPropagation();
  }
});

colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

sizeSlider.addEventListener("change", () => {
  brushWidth = sizeSlider.value;
});

saveImg.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${baseImageName}_Page_${pageNum.toString().padStart(2, "0")}.png`;
  link.href = drawingCanvas.toDataURL();
  link.click();
});

const rgbToHex = (rgb) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
};

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => (isDrawing = false));



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
  // const scrollContainer = document.querySelector(".scroll-container");
  scrollContainer.scrollLeft = (newWidth - scrollContainer.clientWidth) / 2;
  scrollContainer.scrollTop = (newHeight - scrollContainer.clientHeight) / 2;
};

// Zoom butonlarına event listener eklenmiş
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



document.getElementById("next-page").addEventListener("click", nextPage);
document.getElementById("prev-page").addEventListener("click", prevPage);

drawingCanvas.addEventListener("mousedown", startDraw);
drawingCanvas.addEventListener("mousemove", drawing);
drawingCanvas.addEventListener("mouseup", () => {
  isDrawing = false;
  drawingCtx.globalCompositeOperation = "source-over"; // Silgi kullanımından sonra normal çizim moduna dön
});

// script.js

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  const openPopupButton = document.getElementById("page-number-btn");
  const closePopupButton = document.querySelector(".popup .close");
  const goButton = document.getElementById("go-button");
  const pageInput = document.getElementById("page-input");
  const numButtons = document.querySelectorAll(".num-buttons button:not(#clear, #go-button)");
  const clearButton = document.getElementById("clear");
  const currentPageElement = document.getElementById("current-page");

  // Popup'ı aç
  openPopupButton.addEventListener("click", () => {
    pageInput.value = ""; // Input'u temizle
    popup.style.display = "flex";
  });

  // Popup'ı kapat
  closePopupButton.addEventListener("click", () => {
    popup.style.display = "none";
  });

  // Sayfa numarasını gir
  numButtons.forEach(button => {
    button.addEventListener("click", () => {
      pageInput.value += button.textContent;
    });
  });

  // Input'u temizle
  clearButton.addEventListener("click", () => {
    pageInput.value = "";
  });

  // Sayfaya git
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

  // Popup dışına tıklayınca kapat
  window.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });
});







