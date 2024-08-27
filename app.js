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
const totalPagesElement = document.getElementById("total-pages");
const currentPageElement = document.getElementById("current-page");
const toggleModeBtn = document.getElementById("toggle-mode");
const maxZoomLevel = 3; // Maksimum zoom seviyesi
const minZoomLevel = 0.5; // Minimum zoom seviyesi

let zoomLevel = 1; // Başlangıç zoom seviyesi
let isDrawing = true;
let isDragging = false;
let isPanMode = false; // Yeni değişken
let startX, startY, initialLeft, initialTop;
let pageNum = 1;
let totalPages = 32;
let baseImageName = "";  // Dinamik olarak yüklenecek
let prevMouseX,
  prevMouseY,
  snapshot,
  selectedTool = "brush",
  brushWidth = 5,
  selectedColor = "#000";


const drawingCanvas = document.createElement("canvas");
const drawingCtx = drawingCanvas.getContext("2d");
document.querySelector(".drawing-board").appendChild(drawingCanvas);

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookFolder = urlParams.get('book');

  if (bookFolder) {
    baseImageName = bookFolder;  // Dinamik olarak kitap klasörünü belirle
    totalPages = parseInt(localStorage.getItem('selectedBookTotalPages'), 10); // Kaydedilen toplam sayfa sayısını al
    showImage(pageNum);
    updatePageNumber();
} else {
    console.error("Kitap klasörü belirtilmedi!");
}
});

function setCanvasDimensions() {
  drawingCanvas.width = canvas.width;
  drawingCanvas.height = canvas.height;
  drawingCanvas.style.position = "absolute";
  drawingCanvas.style.left = canvas.offsetLeft + "px";
  drawingCanvas.style.top = canvas.offsetTop + "px";
  document.querySelector(".drawing-board").appendChild(drawingCanvas);
}

const startDragging = (e) => {
  if (isPanMode) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = scrollContainer.scrollLeft;
    initialTop = scrollContainer.scrollTop;
    document.body.style.userSelect = "none";
  }
};

const drag = (e) => {
  if (isPanMode && isDragging) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    scrollContainer.scrollLeft = initialLeft - deltaX;
    scrollContainer.scrollTop = initialTop - deltaY;
  }
};

function stopDragging() {
  isDragging = false;
  document.body.style.userSelect = "";
}

const showImage = (num) => {
  const img = new Image();
  img.src = `assets/books/${baseImageName}/${baseImageName}_Page_${num.toString().padStart(2, "0")}.png`;  // Dinamik olarak kitap sayfasını yükle
  img.onload = () => {
    const aspectRatio = img.width / img.height;
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.8;

    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Eski resmin silinmesini sağlar
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    setCanvasDimensions();  // Kanvasın boyutlarını güncelle

    // Load saved drawing
    const savedDrawing = localStorage.getItem(`drawing_Page_${num}`);
    if (savedDrawing) {
      const savedImg = new Image();
      savedImg.src = savedDrawing;
      savedImg.onload = () => {
        drawingCtx.drawImage(savedImg, 0, 0, drawingCanvas.width, drawingCanvas.height);
      };
    } else {
      clearDrawingCanvas(); // Eğer kayıtlı çizim yoksa temizle
    }
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
    saveDrawing(); 
    pageNum++;  
    showImage(pageNum);
    clearDrawingCanvas();
    updatePageNumber(); // Sayfa numarasını güncelle
    resetZoom();
  }
};

const prevPage = () => {
  if (pageNum > 1) {
    saveDrawing(); 
    pageNum--;
    showImage(pageNum);
    clearDrawingCanvas();
    updatePageNumber(); // Sayfa numarasını güncelle
    resetZoom();
  }
};

function clearDrawingCanvas() {
  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

const startDraw = (e) => {
  if (isPanMode) return; // Pan modunda çizim yapılmasına izin verme

  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  drawingCtx.beginPath();
  drawingCtx.lineWidth = brushWidth;

  try {
    snapshot = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    console.log("Snapshot created:", snapshot);
  } catch (error) {
    console.error("Error getting image data:", error);
  }

  setDrawingStyle();
};




const drawing = (e) => {
  if (!isDrawing || isPanMode) return; // Pan modunda çizim yapılmasına izin verme

  if (snapshot) {
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
  } else {
    // console.error("No snapshot found for drawing.");
  }
};

function saveDrawing() {
  const drawingData = drawingCanvas.toDataURL(); // Çizimi base64 string olarak al
  localStorage.setItem(`drawing_Page_${pageNum}`, drawingData); // Sayfa numarası ile kaydet
}

// Save image button event listener
saveImg.addEventListener("click", () => {
  saveDrawing();
  const link = document.createElement("a");
  link.download = `${baseImageName}_Page_${pageNum.toString().padStart(2, "0")}.png`;
  link.href = drawingCanvas.toDataURL();
  link.click();
});




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
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", stopDragging);
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => (isDrawing = false));

  // Zoom güncelleme fonksiyonu
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

// Zoom in ve zoom out butonları
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

// Zoom sıfırlama fonksiyonu
const resetZoom = () => {
  zoomLevel = 1; // Zoom seviyesini sıfırlıyoruz
  updateZoom();  // Zoom'u sıfırla ve güncelle
};

// Pan modunu başlatan ve bitiren fonksiyonlar
const togglePanMode = () => {
  isPanMode = !isPanMode;
  document.body.style.cursor = isPanMode ? "grab" : "default";
};


document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", stopDragging);
document.getElementById("next-page").addEventListener("click", nextPage);
document.getElementById("prev-page").addEventListener("click", prevPage);

toggleModeBtn.addEventListener("click", togglePanMode);
drawingCanvas.addEventListener("mousedown", startDraw);
drawingCanvas.addEventListener("mousemove", drawing);

drawingCanvas.addEventListener("mouseup", () => {
  isDrawing = false;
  drawingCtx.globalCompositeOperation = "source-over"; // Silgi kullanımından sonra normal çizim moduna dön
});

// script.js

document.addEventListener("DOMContentLoaded", () => {
  // Sayfa numarası popup işlemleri
  const popup = document.getElementById("popup");
  const openPopupButton = document.getElementById("page-number-btn");
  const closePopupButton = document.querySelector(".popup .close");
  const goButton = document.getElementById("go-button");
  const pageInput = document.getElementById("page-input");
  const numButtons = document.querySelectorAll(".num-buttons button:not(#clear, #go-button)");
  const clearButton = document.getElementById("clear");
  const currentPageElement = document.getElementById("current-page");

  // // Keyboard popup işlemleri
  // const keyboardPopup = document.getElementById("keyboard-popup");
  // const openKeyboardButton = document.getElementById("open-keyboard-btn");
  // const closeKeyboardButton = document.getElementById("close-keyboard");
  // const keyboardInput = document.getElementById("keyboard-input");
  // const keys = document.querySelectorAll("#keyboard .keypad .key");
  // const clearKeyboardButton = document.getElementById("clear-keyboard");
  // const submitKeyboardButton = document.getElementById("submit-keyboard");

  // Sayfa numarası popup işlemleri
  openPopupButton.addEventListener("click", () => {
    pageInput.value = ""; // Input'u temizle
    popup.style.display = "flex";
  });

  closePopupButton.addEventListener("click", () => {
    popup.style.display = "none";
  });

  numButtons.forEach(button => {
    button.addEventListener("click", () => {
      pageInput.value += button.textContent;
    });
  });

  clearButton.addEventListener("click", () => {
    pageInput.value = "";
  });

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

  // // Keyboard popup işlemleri
  // openKeyboardButton.addEventListener("click", () => {
  //   keyboardPopup.style.display = "flex";
  // });

  // closeKeyboardButton.addEventListener("click", () => {
  //   keyboardPopup.style.display = "none";
  // });

  // keys.forEach(key => {
  //   key.addEventListener("click", () => {
  //     keyboardInput.value += key.textContent;
  //   });
  // });

  // clearKeyboardButton.addEventListener("click", () => {
  //   keyboardInput.value = "";
  // });

  // submitKeyboardButton.addEventListener("click", () => {
  //   // Canvas'a yazıyı ekleme
  //   ctx.font = "20px Arial";
  //   ctx.fillStyle = "#000"; // Yazı rengini ayarlayın
  //   ctx.fillText(keyboardInput.value, 50, 50); // Yazıyı canvas üzerinde belirli bir pozisyona çizin

  //   keyboardPopup.style.display = "none";
  //   keyboardInput.value = ""; // Giriş alanını temizle
  // });

  // Popup dışına tıklayınca kapat
  window.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
    // if (event.target === keyboardPopup) {
    //   keyboardPopup.style.display = "none";
    // }
  });
});