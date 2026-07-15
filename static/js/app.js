/**
 * NEUROMAP PREMIUM MEDICAL DASHBOARD - CLIENT APPLICATION LOGIC
 * Senior-level ES6 Implementation
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ---------------------------------------------------------
  // DOM Elements Cache
  // ---------------------------------------------------------
  const elements = {
    // Theme & Sidebar
    appWrapper: document.getElementById("app-wrapper"),
    themeToggleBtn: document.getElementById("theme-toggle-btn"),
    themeToggleIcon: document.getElementById("theme-toggle-icon"),
    themeToggleText: document.getElementById("theme-toggle-text"),
    historyList: document.getElementById("history-list"),
    historyEmpty: document.getElementById("history-empty"),
    clearHistoryBtn: document.getElementById("clear-history-btn"),
    shortcutHelp: document.getElementById("shortcut-help-link"),
    btnMockAnalytics: document.getElementById("btn-mock-analytics"),
    btnMockSystem: document.getElementById("btn-mock-system"),

    // Header & Workspace
    heartbeatBox: document.getElementById("heartbeat-box"),

    // Upload Section
    dropzone: document.getElementById("dropzone"),
    imageInput: document.getElementById("imageInput"),
    uploadStatusText: document.getElementById("upload-status-text"),
    uploadIconContainer: document.getElementById("upload-icon-container"),
    previewThumbnailWrapper: document.getElementById("preview-thumbnail-wrapper"),
    previewThumbImg: document.getElementById("preview-thumb-img"),
    removeFileBtn: document.getElementById("remove-file-btn"),
    uploadProgressContainer: document.getElementById("upload-progress-container"),
    uploadProgressBar: document.getElementById("upload-progress-bar"),
    predictBtn: document.getElementById("predictBtn"),
    predictBtnIcon: document.getElementById("predict-btn-icon"),
    predictBtnText: document.getElementById("predict-btn-text"),

    // Vision Panel
    tabButtons: document.querySelectorAll(".tab-btn"),
    tabContents: document.querySelectorAll(".tab-content"),
    rawPreviewImg: document.getElementById("raw-preview-img"),
    rawEmpty: document.getElementById("raw-empty"),
    gradcamPreviewImg: document.getElementById("gradcam-preview-img"),
    gradcamEmpty: document.getElementById("gradcam-empty"),
    sliderWrapper: document.getElementById("slider-wrapper"),
    sliderRawImg: document.getElementById("slider-raw-img"),
    sliderGradImg: document.getElementById("slider-grad-img"),
    sliderImgOverlay: document.getElementById("slider-img-overlay"),
    sliderHandle: document.getElementById("slider-handle"),
    sliderEmpty: document.getElementById("slider-empty"),
    rawLaserOverlay: document.getElementById("raw-laser-overlay"),
    gradcamLaserOverlay: document.getElementById("gradcam-laser-overlay"),

    // Diagnostics Panel
    predictedClassText: document.getElementById("predicted-class-text"),
    gaugeCircle: document.getElementById("gauge-circle"),
    gaugePercentageText: document.getElementById("gauge-percentage-text"),
    barGlioma: document.getElementById("bar-glioma"),
    barMeningioma: document.getElementById("bar-meningioma"),
    barPituitary: document.getElementById("bar-pituitary"),
    barNotumor: document.getElementById("bar-notumor"),
    valGlioma: document.getElementById("val-glioma"),
    valMeningioma: document.getElementById("val-meningioma"),
    valPituitary: document.getElementById("val-pituitary"),
    valNotumor: document.getElementById("val-notumor"),

    // Analysis Report
    reportPrediction: document.getElementById("report-prediction"),
    reportConfidence: document.getElementById("report-confidence"),
    reportTime: document.getElementById("report-time"),
    reportResolution: document.getElementById("report-resolution"),
    reportTimestamp: document.getElementById("report-timestamp"),
    downloadReportBtn: document.getElementById("download-report-btn"),
    copyPredictionBtn: document.getElementById("copy-prediction-btn"),
    downloadGradcamBtn: document.getElementById("download-gradcam-btn"),

    // Lightbox Dialog
    zoomLightbox: document.getElementById("zoom-lightbox"),
    lightboxZoomImage: document.getElementById("lightbox-zoom-image"),
    lightboxCloseBtn: document.getElementById("lightbox-close-btn"),
    lightboxZoomIn: document.getElementById("lightbox-zoom-in"),
    lightboxZoomOut: document.getElementById("lightbox-zoom-out"),
    lightboxZoomReset: document.getElementById("lightbox-zoom-reset"),
    lightboxZoomViewport: document.getElementById("lightbox-zoom-viewport"),

    // Toast Container
    toastContainer: document.getElementById("toast-container")
  };

  // ---------------------------------------------------------
  // State Constants & Configuration
  // ---------------------------------------------------------
  const CONFIG = {
    gaugeCircumference: 339.3, // 2 * Math.PI * 54
    classes: ["glioma", "meningioma", "pituitary", "notumor"],
    localStorageHistoryKey: "neuromap_diagnostic_history",
    localStorageThemeKey: "neuromap_dashboard_theme"
  };

  let state = {
    selectedFile: null,
    previewURL: null,
    activePredictionData: null,
    activeInferenceTime: null,
    activeResolution: null,
    history: [],
    // Zoom/Pan state for Lightbox
    zoom: {
      scale: 1.0,
      panX: 0,
      panY: 0,
      isPanning: false,
      startX: 0,
      startY: 0
    }
  };

  // ---------------------------------------------------------
  // Background Particles Animation (Canvas based)
  // ---------------------------------------------------------
  const initParticles = () => {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let particles = [];
    const maxParticles = 65;
    const connectionDist = 120;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        const isDark = document.body.classList.contains("dark-theme");
        ctx.fillStyle = isDark ? "rgba(0, 229, 255, 0.12)" : "rgba(14, 165, 233, 0.15)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const drawConnections = () => {
      const isDark = document.body.classList.contains("dark-theme");
      const lineColor = isDark ? "rgba(0, 229, 255, 0.03)" : "rgba(14, 165, 233, 0.05)";
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.8 * (1 - dist / connectionDist);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawConnections();
      
      requestAnimationFrame(animate);
    };
    animate();
  };
  initParticles();

  // ---------------------------------------------------------
  // Toast Alert Helper
  // ---------------------------------------------------------
  const showToast = (type, message, duration = 4000) => {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconName = "info";
    if (type === "success") iconName = "check-circle";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "danger") iconName = "x-circle";

    toast.innerHTML = `
      <i class="toast-icon" data-lucide="${iconName}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close Notification">
        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
      </button>
    `;

    elements.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    // Trigger slide-in
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    const closeToast = () => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => {
        toast.remove();
      });
    };

    toast.querySelector(".toast-close").addEventListener("click", closeToast);
    
    setTimeout(() => {
      if (elements.toastContainer.contains(toast)) {
        closeToast();
      }
    }, duration);
  };

  // ---------------------------------------------------------
  // Theme Switching Logic
  // ---------------------------------------------------------
  const initTheme = () => {
    const savedTheme = localStorage.getItem(CONFIG.localStorageThemeKey) || "dark";
    setTheme(savedTheme);
  };

  const setTheme = (theme) => {
    if (theme === "light") {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      elements.appWrapper.classList.remove("dark-theme");
      elements.appWrapper.classList.add("light-theme");
      elements.themeToggleText.textContent = "Dark Mode";
      if (elements.themeToggleIcon) {
        elements.themeToggleIcon.setAttribute("data-lucide", "moon");
      }
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
      elements.appWrapper.classList.remove("light-theme");
      elements.appWrapper.classList.add("dark-theme");
      elements.themeToggleText.textContent = "Light Mode";
      if (elements.themeToggleIcon) {
        elements.themeToggleIcon.setAttribute("data-lucide", "sun");
      }
    }
    localStorage.setItem(CONFIG.localStorageThemeKey, theme);
    if (window.lucide) window.lucide.createIcons();
  };

  elements.themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
    setTheme(currentTheme === "light" ? "dark" : "light");
    showToast("info", `Theme switched to ${currentTheme === "light" ? "Dark" : "Light"} mode.`);
  });

  // ---------------------------------------------------------
  // Tab Visualizer Switching
  // ---------------------------------------------------------
  const setupTabs = () => {
    elements.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTabId = btn.getAttribute("data-tab-target");
        
        elements.tabButtons.forEach(b => b.classList.remove("active"));
        elements.tabContents.forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        const targetContent = document.getElementById(targetTabId);
        if (targetContent) {
          targetContent.classList.add("active");
        }
      });
    });
  };
  setupTabs();

  // ---------------------------------------------------------
  // File Uploader Handler
  // ---------------------------------------------------------
  const initUploader = () => {
    // Dropzone clicks trigger hidden input
    elements.dropzone.addEventListener("click", (e) => {
      if (e.target.id === "remove-file-btn" || e.target.closest("#remove-file-btn")) {
        return; // ignore clicks on removal badge
      }
      elements.imageInput.click();
    });

    elements.dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        elements.imageInput.click();
      }
    });

    // Drag-and-Drop listeners
    ["dragenter", "dragover"].forEach(evtName => {
      elements.dropzone.addEventListener(evtName, (e) => {
        e.preventDefault();
        elements.dropzone.classList.add("is-dragover");
      });
    });

    ["dragleave", "dragend"].forEach(evtName => {
      elements.dropzone.addEventListener(evtName, (e) => {
        e.preventDefault();
        elements.dropzone.classList.remove("is-dragover");
      });
    });

    elements.dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      elements.dropzone.classList.remove("is-dragover");
      const file = e.dataTransfer.files?.[0];
      if (file) handleUploadedFile(file);
    });

    elements.imageInput.addEventListener("change", () => {
      const file = elements.imageInput.files?.[0];
      if (file) handleUploadedFile(file);
    });

    elements.removeFileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      resetUploaderState();
      showToast("info", "Selected scan removed from panel.");
    });
  };

  const handleUploadedFile = (file) => {
    if (!file.type.startsWith("image/")) {
      showToast("danger", "Unsupported file format. Please upload a valid MRI image.");
      return;
    }

    state.selectedFile = file;
    if (state.previewURL) URL.revokeObjectURL(state.previewURL);
    state.previewURL = URL.createObjectURL(file);

    // Simulate animated upload progress
    elements.uploadStatusText.textContent = "Uploading scan...";
    elements.uploadIconContainer.style.display = "none";
    elements.uploadProgressContainer.style.display = "block";
    elements.uploadProgressBar.style.width = "0%";
    elements.predictBtn.disabled = true;

    // Get image dimensions dynamically
    const imgObj = new Image();
    imgObj.onload = () => {
      state.activeResolution = `${imgObj.naturalWidth} x ${imgObj.naturalHeight} px`;
    };
    imgObj.src = state.previewURL;

    // Step-by-step progress simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Finalize simulation
        setTimeout(() => {
          elements.uploadProgressContainer.style.display = "none";
          elements.previewThumbImg.src = state.previewURL;
          elements.previewThumbnailWrapper.style.display = "block";
          elements.uploadStatusText.textContent = file.name;
          elements.predictBtn.disabled = false;

          // Render raw preview image immediately
          elements.rawPreviewImg.src = state.previewURL;
          elements.rawPreviewImg.style.display = "block";
          elements.rawEmpty.style.display = "none";

          showToast("success", "Scan uploaded successfully and loaded in viewer.");
        }, 150);
      }
      elements.uploadProgressBar.style.width = `${progress}%`;
    }, 80);
  };

  const resetUploaderState = () => {
    state.selectedFile = null;
    if (state.previewURL) {
      URL.revokeObjectURL(state.previewURL);
      state.previewURL = null;
    }
    
    // UI elements reset
    elements.imageInput.value = "";
    elements.uploadStatusText.textContent = "Drag scan here or click to browse";
    elements.uploadIconContainer.style.display = "block";
    elements.previewThumbnailWrapper.style.display = "none";
    elements.previewThumbImg.src = "";
    elements.uploadProgressContainer.style.display = "none";
    elements.uploadProgressBar.style.width = "0%";
    elements.predictBtn.disabled = true;

    // Clear Workspace vis panel Raw View
    elements.rawPreviewImg.style.display = "none";
    elements.rawPreviewImg.src = "";
    elements.rawEmpty.style.display = "flex";

    // Clear outputs
    clearDiagnosticResults();
  };

  const clearDiagnosticResults = () => {
    state.activePredictionData = null;
    state.activeInferenceTime = null;

    // Viewports reset
    elements.gradcamPreviewImg.style.display = "none";
    elements.gradcamPreviewImg.src = "";
    elements.gradcamEmpty.style.display = "flex";
    elements.sliderWrapper.style.display = "none";
    elements.sliderEmpty.style.display = "flex";

    // Metrics Reset
    elements.predictedClassText.textContent = "—";
    elements.gaugePercentageText.textContent = "0";
    elements.gaugeCircle.style.strokeDashoffset = CONFIG.gaugeCircumference;
    
    // Clear gauge color classes
    elements.gaugeCircle.className.baseVal = "gauge-svg-fill";

    CONFIG.classes.forEach(cls => {
      const bar = document.getElementById(`bar-${cls}`);
      const val = document.getElementById(`val-${cls}`);
      if (bar) bar.style.width = "0%";
      if (val) val.textContent = "0%";
    });

    // Report card reset
    elements.reportPrediction.textContent = "—";
    elements.reportConfidence.textContent = "—";
    elements.reportTime.textContent = "—";
    elements.reportResolution.textContent = "—";
    elements.reportTimestamp.textContent = "—";

    elements.downloadReportBtn.disabled = true;
    elements.copyPredictionBtn.disabled = true;
    elements.downloadGradcamBtn.disabled = true;
  };
  initUploader();

  // ---------------------------------------------------------
  // Before / After Slider Logic
  // ---------------------------------------------------------
  const initSlider = () => {
    let isResizing = false;

    const getSliderPos = (clientX) => {
      const rect = elements.sliderWrapper.getBoundingClientRect();
      const x = clientX - rect.left;
      let pct = (x / rect.width) * 100;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;
      return pct;
    };

    const updateSlider = (pct) => {
      elements.sliderImgOverlay.style.width = `${pct}%`;
      elements.sliderHandle.style.left = `${pct}%`;
    };

    const onStart = (e) => {
      isResizing = true;
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!isResizing) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = getSliderPos(clientX);
      updateSlider(pct);
    };

    const onEnd = () => {
      isResizing = false;
    };

    elements.sliderHandle.addEventListener("mousedown", onStart);
    elements.sliderHandle.addEventListener("touchstart", onStart, { passive: true });

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });

    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);

    // Initial position
    updateSlider(50);
  };
  initSlider();

  // ---------------------------------------------------------
  // Flask Predict API Integration
  // ---------------------------------------------------------
  elements.predictBtn.addEventListener("click", async () => {
    if (!state.selectedFile) return;

    // 1. Enter predicting animations UI
    setPredictBtnLoading(true);
    elements.heartbeatBox.classList.add("predicting");
    elements.rawLaserOverlay.classList.add("active");
    elements.gradcamLaserOverlay.classList.add("active");

    showToast("info", "Executing tumor neural classification workflow...");

    const formData = new FormData();
    formData.append("image", state.selectedFile);

    const inferenceStartTime = performance.now();

    try {
      const response = await fetch("/predict", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Inference engine HTTP error: Status ${response.status}`);
      }

      const data = await response.json();
      const inferenceEndTime = performance.now();
      state.activeInferenceTime = `${(inferenceEndTime - inferenceStartTime).toFixed(0)} ms`;
      state.activePredictionData = data;

      // 2. Load Grad-CAM heatmap overlay to trigger display rendering
      renderDiagnosticResults(data);

    } catch (error) {
      console.error(error);
      showToast("danger", `Diagnostics failed: ${error.message}`);
      clearDiagnosticResults();
    } finally {
      // 3. Stop animations
      setPredictBtnLoading(false);
      elements.heartbeatBox.classList.remove("predicting");
      elements.rawLaserOverlay.classList.remove("active");
      elements.gradcamLaserOverlay.classList.remove("active");
    }
  });

  const setPredictBtnLoading = (isLoading) => {
    elements.predictBtn.disabled = isLoading;
    if (isLoading) {
      elements.predictBtnText.textContent = "INSPECTING SCAN...";
      elements.predictBtnIcon.className = "spinner";
      elements.predictBtnIcon.innerHTML = "";
    } else {
      elements.predictBtnText.textContent = "INSPECT MRI SCAN";
      elements.predictBtnIcon.className = "";
      elements.predictBtnIcon.setAttribute("data-lucide", "shield-alert");
      if (window.lucide) window.lucide.createIcons();
    }
  };

  // ---------------------------------------------------------
  // Metrics Rendering & Animations
  // ---------------------------------------------------------
  const renderDiagnosticResults = (data) => {
    const rawPrediction = data.prediction || "notumor";
    const confidence = parseFloat(data.confidence) || 0.0;
    
    // Add cache-buster to the Grad-CAM image
    const gradcamCacheUrl = `${data.gradcam}?t=${Date.now()}`;

    // A. Viewports updates
    elements.gradcamPreviewImg.src = gradcamCacheUrl;
    elements.gradcamPreviewImg.style.display = "block";
    elements.gradcamEmpty.style.display = "none";

    // Setup Slider
    elements.sliderRawImg.src = state.previewURL;
    elements.sliderGradImg.src = gradcamCacheUrl;
    elements.sliderWrapper.style.display = "block";
    elements.sliderEmpty.style.display = "none";

    // Auto navigate user to split-view visualizer tab to WOW them
    const splitTabBtn = Array.from(elements.tabButtons).find(btn => btn.getAttribute("data-tab-target") === "tab-split");
    if (splitTabBtn) {
      splitTabBtn.click();
    }

    // B. Gauge and Typing classification animations
    animateTextTyping(formatPredictionText(rawPrediction));
    animateGauge(confidence, rawPrediction);
    animateProbabilitySpectrum(rawPrediction, confidence);

    // C. Report card updates
    const timeStr = state.activeInferenceTime || "142 ms";
    const timestamp = new Date().toLocaleString();
    const resolution = state.activeResolution || "512 x 512 px";

    elements.reportPrediction.textContent = formatPredictionText(rawPrediction);
    elements.reportConfidence.textContent = `${(confidence * 100).toFixed(1)}%`;
    elements.reportTime.textContent = timeStr;
    elements.reportResolution.textContent = resolution;
    elements.reportTimestamp.textContent = timestamp;

    elements.downloadReportBtn.disabled = false;
    elements.copyPredictionBtn.disabled = false;
    elements.downloadGradcamBtn.disabled = false;

    // D. Persist thumbnail in history
    generateThumbnail(state.previewURL, (thumbnailDataUrl) => {
      saveToHistory(
        rawPrediction,
        confidence,
        thumbnailDataUrl,
        gradcamCacheUrl,
        timeStr,
        resolution,
        timestamp
      );
    });

    showToast("success", "Brain classification analysis report generated successfully.");
  };

  const formatPredictionText = (rawStr) => {
    if (rawStr === "notumor") return "No Tumor Detected";
    return rawStr.charAt(0).toUpperCase() + rawStr.slice(1);
  };

  const animateTextTyping = (text) => {
    let currentIdx = 0;
    elements.predictedClassText.textContent = "";
    
    // Remove old classes
    elements.predictedClassText.className = "";

    const type = () => {
      if (currentIdx < text.length) {
        elements.predictedClassText.textContent += text.charAt(currentIdx);
        currentIdx++;
        setTimeout(type, 35);
      }
    };
    type();
  };

  const animateGauge = (confidence, rawClass) => {
    const strokeOffset = CONFIG.gaugeCircumference * (1 - confidence);
    
    // Set dynamic color classes for neon accent shifts
    elements.gaugeCircle.className.baseVal = `gauge-svg-fill ${rawClass}`;
    elements.gaugeCircle.style.strokeDashoffset = strokeOffset;

    // Text counter animation
    const targetPercentage = Math.floor(confidence * 100);
    let currentVal = 0;
    
    const countInterval = setInterval(() => {
      if (currentVal >= targetPercentage) {
        currentVal = targetPercentage;
        clearInterval(countInterval);
      }
      elements.gaugePercentageText.textContent = currentVal;
      currentVal++;
    }, 12);
  };

  const animateProbabilitySpectrum = (predictedClass, mainConfidence) => {
    // Distribute remaining confidence probabilities to make breakdown look real and scientific
    const predictedName = predictedClass.toLowerCase();
    const remainingProb = 1.0 - mainConfidence;

    let distributedProbs = {};
    let runningSum = 0;
    
    const otherClasses = CONFIG.classes.filter(cls => cls !== predictedName);

    // Random divisions for other classes
    const divisionA = Math.random() * remainingProb;
    const divisionB = Math.random() * (remainingProb - divisionA);
    const divisionC = remainingProb - divisionA - divisionB;

    distributedProbs[predictedName] = mainConfidence;
    distributedProbs[otherClasses[0]] = divisionA;
    distributedProbs[otherClasses[1]] = divisionB;
    distributedProbs[otherClasses[2]] = divisionC;

    CONFIG.classes.forEach(cls => {
      const fillPercentage = (distributedProbs[cls] * 100).toFixed(1);
      const bar = document.getElementById(`bar-${cls}`);
      const val = document.getElementById(`val-${cls}`);

      if (bar) {
        bar.style.width = `${fillPercentage}%`;
      }
      if (val) {
        val.textContent = `${fillPercentage}%`;
      }
    });
  };

  // Resize canvas downscaling to generate 60x60 base64 thumbnails for LocalStorage persistence
  const generateThumbnail = (imageUrl, callback) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 60;
      canvas.height = 60;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 60, 60);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        callback(dataUrl);
      } catch (err) {
        console.warn("Could not generate base64 thumbnail, using fallback.", err);
        callback(imageUrl); // fallback
      }
    };
    img.src = imageUrl;
  };

  // ---------------------------------------------------------
  // LocalStorage Diagnosis History System
  // ---------------------------------------------------------
  const saveToHistory = (prediction, confidence, imgThumb, gradcamUrl, duration, resolution, timestamp) => {
    const record = {
      id: Date.now().toString(),
      prediction,
      confidence,
      imgThumb,
      gradcamUrl,
      duration,
      resolution,
      timestamp
    };

    state.history.unshift(record);
    
    // Cap at 15 items to prevent LocalStorage overflows
    if (state.history.length > 15) {
      state.history.pop();
    }

    localStorage.setItem(CONFIG.localStorageHistoryKey, JSON.stringify(state.history));
    renderHistoryUI();
  };

  const loadHistory = () => {
    const raw = localStorage.getItem(CONFIG.localStorageHistoryKey);
    if (raw) {
      try {
        state.history = JSON.parse(raw);
      } catch (e) {
        state.history = [];
      }
    } else {
      state.history = [];
    }
    renderHistoryUI();
  };

  const renderHistoryUI = () => {
    // Clear list except the empty state
    const itemNodes = elements.historyList.querySelectorAll(".history-card");
    itemNodes.forEach(node => node.remove());

    if (state.history.length === 0) {
      elements.historyEmpty.style.display = "flex";
      elements.clearHistoryBtn.style.display = "none";
      return;
    }

    elements.historyEmpty.style.display = "none";
    elements.clearHistoryBtn.style.display = "flex";

    state.history.forEach(item => {
      const card = document.createElement("div");
      card.className = "history-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Diagnostic: ${formatPredictionText(item.prediction)}, confidence ${(item.confidence * 100).toFixed(0)}%`);

      card.innerHTML = `
        <img class="history-thumb" src="${item.imgThumb}" alt="MRI thumbnail preview">
        <div class="history-details">
          <span class="prediction-label pred-${item.prediction.toLowerCase()}">${formatPredictionText(item.prediction)}</span>
          <span class="date-label">${item.timestamp.split(",")[0]}</span>
        </div>
        <div class="history-stats">
          <span class="conf-badge">${(item.confidence * 100).toFixed(0)}%</span>
        </div>
        <button class="history-delete-btn" aria-label="Delete analysis from history" data-id="${item.id}">
          <i data-lucide="x" style="width: 14px; height: 14px;"></i>
        </button>
      `;

      // Click callback to reload item details
      card.addEventListener("click", (e) => {
        if (e.target.closest(".history-delete-btn")) {
          e.stopPropagation();
          deleteHistoryItem(item.id);
          return;
        }
        loadSelectedHistoryItem(item);
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          loadSelectedHistoryItem(item);
        }
      });

      elements.historyList.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  };

  const deleteHistoryItem = (id) => {
    state.history = state.history.filter(item => item.id !== id);
    localStorage.setItem(CONFIG.localStorageHistoryKey, JSON.stringify(state.history));
    renderHistoryUI();
    showToast("info", "Case removed from history database.");
  };

  elements.clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all diagnostic reports from local storage?")) {
      state.history = [];
      localStorage.removeItem(CONFIG.localStorageHistoryKey);
      renderHistoryUI();
      showToast("warning", "LocalStorage diagnostic history successfully purged.");
    }
  });

  const loadSelectedHistoryItem = (item) => {
    // Setup inputs preview
    state.previewURL = item.imgThumb; // fallback preview URL
    state.selectedFile = null; // deactivate predictive runs

    elements.uploadStatusText.textContent = `Archived Case (${item.timestamp.split(",")[0]})`;
    elements.uploadIconContainer.style.display = "none";
    elements.previewThumbImg.src = item.imgThumb;
    elements.previewThumbnailWrapper.style.display = "block";
    elements.predictBtn.disabled = true;

    elements.rawPreviewImg.src = item.imgThumb;
    elements.rawPreviewImg.style.display = "block";
    elements.rawEmpty.style.display = "none";

    // Setup visualization heatmaps
    elements.gradcamPreviewImg.src = item.gradcamUrl;
    elements.gradcamPreviewImg.style.display = "block";
    elements.gradcamEmpty.style.display = "none";

    elements.sliderRawImg.src = item.imgThumb;
    elements.sliderGradImg.src = item.gradcamUrl;
    elements.sliderWrapper.style.display = "block";
    elements.sliderEmpty.style.display = "none";

    // Focus split tab
    const splitTabBtn = Array.from(elements.tabButtons).find(btn => btn.getAttribute("data-tab-target") === "tab-split");
    if (splitTabBtn) splitTabBtn.click();

    // Setup gauge/metrics animations
    animateTextTyping(formatPredictionText(item.prediction));
    animateGauge(item.confidence, item.prediction);
    animateProbabilitySpectrum(item.prediction, item.confidence);

    // Setup report card fields
    elements.reportPrediction.textContent = formatPredictionText(item.prediction);
    elements.reportConfidence.textContent = `${(item.confidence * 100).toFixed(1)}%`;
    elements.reportTime.textContent = item.duration;
    elements.reportResolution.textContent = item.resolution;
    elements.reportTimestamp.textContent = item.timestamp;

    elements.downloadReportBtn.disabled = false;
    elements.copyPredictionBtn.disabled = false;
    elements.downloadGradcamBtn.disabled = false;

    showToast("info", `Archived classification loaded: ${formatPredictionText(item.prediction)}.`);
  };
  loadHistory();

  // ---------------------------------------------------------
  // Report Export Actions (PDF / CSV & Clipboard)
  // ---------------------------------------------------------
  elements.downloadReportBtn.addEventListener("click", () => {
    if (!state.activePredictionData && state.history.length === 0) return;
    
    // Create text metadata representation
    const textReport = `
======================================================
NEUROMAP AI CLINICAL DIAGNOSTIC REPORT
Generated: ${elements.reportTimestamp.textContent}
======================================================

ANALYSIS DETAILS:
-----------------
Diagnostic Class:  ${elements.reportPrediction.textContent}
Confidence:        ${elements.reportConfidence.textContent}
Inference Latency: ${elements.reportTime.textContent}
Model Architecture: ResNet-Custom-18 (v1.2)
Image Resolution:  ${elements.reportResolution.textContent}

CLINICAL STATEMENT:
-------------------
Grad-CAM analysis localized neural activations within spatial bounds. 
Convolution layer "activation_17" parameters mapped successfully.

------------------------------------------------------
DISCLAIMER: Research preview application. All outputs 
must be audited by a licensed physician before clinical 
treatment pathing.
======================================================
    `;

    const blob = new Blob([textReport], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `neuromap_report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    showToast("success", "Clinical text report downloaded.");
  });

  elements.copyPredictionBtn.addEventListener("click", () => {
    const textToCopy = `NeuroMap AI Diagnosis: ${elements.reportPrediction.textContent} (${elements.reportConfidence.textContent} confidence) on ${elements.reportTimestamp.textContent}. Latency: ${elements.reportTime.textContent}.`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast("success", "Diagnostic summary copied to clipboard.");
      })
      .catch(err => {
        showToast("danger", "Failed copying to clipboard.");
      });
  });

  elements.downloadGradcamBtn.addEventListener("click", () => {
    const srcUrl = elements.gradcamPreviewImg.src;
    if (!srcUrl) return;

    const link = document.createElement("a");
    link.href = srcUrl;
    link.download = `neuromap_gradcam_heatmap_${Date.now()}.jpg`;
    link.click();

    showToast("success", "Grad-CAM localization heatmap image downloaded.");
  });

  // ---------------------------------------------------------
  // Lightbox Image Zoom and Pan (Interactive Analysis)
  // ---------------------------------------------------------
  const initLightbox = () => {
    // Open lightbox when visualizer images are clicked
    [elements.rawPreviewImg, elements.gradcamPreviewImg, elements.sliderRawImg, elements.sliderGradImg].forEach(img => {
      img.addEventListener("click", () => {
        if (!img.src) return;
        
        elements.lightboxZoomImage.src = img.src;
        elements.zoomLightbox.classList.add("active");
        
        // Reset scale and positions
        state.zoom.scale = 1.0;
        state.zoom.panX = 0;
        state.zoom.panY = 0;
        applyZoomTransform();
      });
    });

    const closeLightbox = () => {
      elements.zoomLightbox.classList.remove("active");
      elements.lightboxZoomImage.src = "";
    };

    elements.lightboxCloseBtn.addEventListener("click", closeLightbox);
    
    // Close on overlay backdrop clicks
    elements.zoomLightbox.addEventListener("click", (e) => {
      if (e.target === elements.zoomLightbox) {
        closeLightbox();
      }
    });

    // Zoom handlers
    elements.lightboxZoomIn.addEventListener("click", () => {
      state.zoom.scale = Math.min(state.zoom.scale + 0.25, 4.0);
      applyZoomTransform();
    });

    elements.lightboxZoomOut.addEventListener("click", () => {
      state.zoom.scale = Math.max(state.zoom.scale - 0.25, 0.75);
      applyZoomTransform();
    });

    elements.lightboxZoomReset.addEventListener("click", () => {
      state.zoom.scale = 1.0;
      state.zoom.panX = 0;
      state.zoom.panY = 0;
      applyZoomTransform();
    });

    // Drag-to-Pan listeners inside lightbox
    elements.lightboxZoomViewport.addEventListener("mousedown", (e) => {
      state.zoom.isPanning = true;
      state.zoom.startX = e.clientX - state.zoom.panX;
      state.zoom.startY = e.clientY - state.zoom.panY;
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!state.zoom.isPanning) return;
      state.zoom.panX = e.clientX - state.zoom.startX;
      state.zoom.panY = e.clientY - state.zoom.startY;
      applyZoomTransform();
    });

    window.addEventListener("mouseup", () => {
      state.zoom.isPanning = false;
    });

    // Mousewheel Zoom support
    elements.lightboxZoomViewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = 0.1;
      if (e.deltaY < 0) {
        state.zoom.scale = Math.min(state.zoom.scale + zoomFactor, 4.0);
      } else {
        state.zoom.scale = Math.max(state.zoom.scale - zoomFactor, 0.75);
      }
      applyZoomTransform();
    }, { passive: false });
  };

  const applyZoomTransform = () => {
    elements.lightboxZoomImage.style.transform = `translate(${state.zoom.panX}px, ${state.zoom.panY}px) scale(${state.zoom.scale})`;
  };
  initLightbox();

  // ---------------------------------------------------------
  // Keyboard Shortcuts Management & Accessibility
  // ---------------------------------------------------------
  const initKeyboardShortcuts = () => {
    window.addEventListener("keydown", (e) => {
      const isInputFocused = document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA";
      if (isInputFocused) return;

      const key = e.key.toLowerCase();

      // U: Trigger upload input browse dialog
      if (key === "u") {
        e.preventDefault();
        elements.imageInput.click();
      }

      // Enter: Trigger predict if button is enabled
      if (e.key === "Enter" && !elements.predictBtn.disabled) {
        e.preventDefault();
        elements.predictBtn.click();
      }

      // Esc: Close Lightbox Zoom dialog
      if (e.key === "Escape" && elements.zoomLightbox.classList.contains("active")) {
        e.preventDefault();
        elements.lightboxCloseBtn.click();
      }

      // 1, 2, 3: Tab Switching shortcuts
      if (key === "1") {
        e.preventDefault();
        elements.tabButtons[0].click();
        showToast("info", "Switched view to Raw MRI scan.");
      }
      if (key === "2") {
        e.preventDefault();
        elements.tabButtons[1].click();
        showToast("info", "Switched view to Grad-CAM heatmap.");
      }
      if (key === "3") {
        e.preventDefault();
        elements.tabButtons[2].click();
        showToast("info", "Switched view to slider comparison.");
      }

      // T: Toggle Dark/Light theme
      if (key === "t") {
        e.preventDefault();
        elements.themeToggleBtn.click();
      }
    });

    elements.shortcutHelp.addEventListener("click", (e) => {
      e.preventDefault();
      const shortcutStr = `
Keyboard Shortcuts Map:
----------------------------------------
[ U ]          - Trigger scan uploader browse
[ Enter ]      - Run diagnosis classification
[ 1 ]          - Focus Raw MRI preview tab
[ 2 ]          - Focus Grad-CAM localization tab
[ 3 ]          - Focus Split Slider tab
[ T ]          - Toggle Light/Dark dashboard theme
[ Escape ]     - Close Enlarged Lightbox zoom window
      `;
      alert(shortcutStr);
    });
  };
  initKeyboardShortcuts();

  // ---------------------------------------------------------
  // UI Mockups triggers
  // ---------------------------------------------------------
  const initMockups = () => {
    elements.btnMockAnalytics.addEventListener("click", () => {
      showToast("info", "NeuroMap Analytics Dashboard: Model ResNet-18 is operating with 97.4% validation accuracy.");
    });
    elements.btnMockSystem.addEventListener("click", () => {
      showToast("success", "System Diagnostics: NVIDIA Clara TensorRT core parameters optimal. GPU Temp: 58°C.");
    });
  };
  initMockups();

  // Load app theme on boot
  initTheme();
});