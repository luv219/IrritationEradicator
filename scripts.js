/* scripts.js */

// Global variables
let clickCount = 0;
const maxClicks = 50;

// Utility function to get mouse position on canvas
function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
  const scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  };
}

// Load image to canvas
function loadImageToCanvas(inputElement, canvasElement, callback) {
  const ctx = canvasElement.getContext('2d');
  inputElement.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const img = new Image();
    img.onload = () => {
      canvasElement.width = img.width;
      canvasElement.height = img.height;
      ctx.drawImage(img, 0, 0);
      if (callback) callback(ctx, img);
    };
    img.src = URL.createObjectURL(file);
  });
}

// Love Feature
function initializeLoveFeature() {
  const imageUpload = document.getElementById('imageUpload');
  const canvas = document.getElementById('loveCanvas');
  const ctx = canvas.getContext('2d');

  let loadedImage = null;

  loadImageToCanvas(imageUpload, canvas, (ctx, img) => {
    loadedImage = img;
  });

  canvas.addEventListener('click', (e) => {
    const pos = getMousePos(canvas, e);
    clickCount++;
    if (clickCount < maxClicks) {
      showHeartAnimation(pos.x, pos.y, canvas);
    } else if (clickCount === maxClicks) {
      displayImageInHeart(canvas, loadedImage);
    }
  });
}

function showHeartAnimation(x, y, canvas) {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.style.left = `${canvas.offsetLeft + x}px`;
  heart.style.top = `${canvas.offsetTop + y}px`;
  heart.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'64\' height=\'64\' viewBox=\'0 0 64 64\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M32 57s-1-.6-1-1c0-.4-.3-.6-.7-.8C23.5 51 8 37.9 8 24.4 8 14.3 15.5 8 24.5 8c5.3 0 10.3 3.4 12.5 8.4C39.3 11.4 44.3 8 49.5 8 58.5 8 66 14.3 66 24.4c0 13.5-15.5 26.6-22.3 30.8-.4.2-.7.4-.7.8 0 .4-1 .9-1 .9z\' fill=\'%23e74c3c\'/%3E%3C/svg%3E")';
  heart.style.position = 'absolute';
  heart.style.width = '30px';
  heart.style.height = '30px';
  heart.style.backgroundSize = 'contain';
  heart.style.pointerEvents = 'none';
  heart.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(heart);

  anime({
    targets: heart,
    translateY: -100,
    opacity: [1, 0],
    scale: [1, 1.5],
    duration: 1500,
    easing: 'easeOutCubic',
    complete: () => heart.remove(),
  });
}

// Improved function to display the image inside an enhanced, centered heart shape
function displayImageInHeart(canvas, loadedImage) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Create a temporary canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  // Clear the main canvas
  ctx.clearRect(0, 0, width, height);

  // Draw the improved heart shape path on the temporary canvas
  tempCtx.beginPath();
  const x = width / 2;
  const y = height / 2;
  const heartWidth = width * 0.5;
  const heartHeight = height * 0.5;

  tempCtx.moveTo(x, y + heartHeight / 4);
  tempCtx.bezierCurveTo(
    x + heartWidth / 2, y - heartHeight / 4,
    x + heartWidth, y + heartHeight / 2,
    x, y + heartHeight
  );
  tempCtx.bezierCurveTo(
    x - heartWidth, y + heartHeight / 2,
    x - heartWidth / 2, y - heartHeight / 4,
    x, y + heartHeight / 4
  );
  tempCtx.closePath();

  // Clip to the heart shape
  tempCtx.clip();

  // Calculate the scaling factor to fit the image inside the heart
  const scale = Math.min(heartWidth / loadedImage.width, heartHeight / loadedImage.height);

  // Calculate the position to center the image
  const imgX = x - (loadedImage.width * scale) / 2;
  const imgY = y - (loadedImage.height * scale) / 2;

  // Draw the loaded image into the heart-shaped clip, centered
  tempCtx.drawImage(
    loadedImage,
    imgX, imgY,
    loadedImage.width * scale,
    loadedImage.height * scale
  );

  // Animate drawing the heart image onto the main canvas
  let alpha = { value: 0 };

  anime({
    targets: alpha,
    value: 1,
    duration: 2000,
    easing: 'linear',
    update: function() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = alpha.value;
      ctx.drawImage(tempCanvas, 0, 0);
    },
    complete: function() {
      ctx.globalAlpha = 1; // Reset alpha
    }
  });
}

// Burn Feature
function initializeBurnFeature() {
  const imageUpload = document.getElementById('imageUpload');
  const canvas = document.getElementById('burnCanvas');
  const ctx = canvas.getContext('2d');

  loadImageToCanvas(imageUpload, canvas);

  canvas.addEventListener('click', (e) => {
    const pos = getMousePos(canvas, e);
    clickCount++;
    if (clickCount < maxClicks) {
      burnClickedArea(ctx, pos.x, pos.y);
    } else if (clickCount === maxClicks) {
      burnFullImage(ctx, canvas);
    }
  });
}

// Function to burn (erase) the clicked area with visible colors
function burnClickedArea(ctx, x, y) {
  const burnRadius = 100;

  // First, draw the flame effect
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, burnRadius);
  gradient.addColorStop(0, 'rgba(255, 69, 0, 0.8)'); // Bright flame color
  gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.5)'); // Orange color
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent

  ctx.globalCompositeOperation = 'source-over'; // Draw over the image
  ctx.beginPath();
  ctx.arc(x, y, burnRadius, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Then, erase the center to simulate burning
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, burnRadius * 0.7, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fill();

  // Reset composite operation to default
  ctx.globalCompositeOperation = 'source-over';
}

// Function for aggressive final burning animation with colors
function burnFullImage(ctx, canvas) {
  const burnSpeed = 7; // Adjust for faster or slower burn
  const pointCount = 30; // Number of points defining the burn edge
  const points = [];

  // Initialize points along the bottom of the image
  for (let i = 0; i <= pointCount; i++) {
    points.push({
      x: (canvas.width / pointCount) * i,
      y: canvas.height,
    });
  }

  function animateBurn() {
    // Check if all points have moved off the top of the canvas
    if (points.every(point => point.y <= 0)) {
      return;
    }

    // Update points to move upwards with randomness
    for (let i = 0; i <= pointCount; i++) {
      points[i].y -= burnSpeed + Math.random() * 3; // Randomize movement
      if (points[i].y < 0) points[i].y = 0; // Prevent points from going below 0
    }

    // First, draw the flame effect
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= pointCount; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    // Create a gradient for a more realistic burn edge
    const minY = points.reduce((min, p) => (p.y < min ? p.y : min), canvas.height);
    const gradient = ctx.createLinearGradient(0, minY, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 69, 0, 0.8)'); // Bright flame color
    gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.5)'); // Orange color
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent

    ctx.fillStyle = gradient;
    ctx.fill();

    // Then, erase the area that has burned
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= pointCount; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fill();

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animateBurn);
  }

  animateBurn();
}

// Hurt Feature
function initializeHurtFeature() {
  const canvas = document.getElementById('hurtCanvas');
  const ctx = canvas.getContext('2d');
  const wallImage = new Image();
  wallImage.src = 'https://i.imgur.com/A3dN0eB.jpg'; // Brick wall image URL
  wallImage.crossOrigin = 'anonymous';
  wallImage.onload = () => {
    canvas.width = wallImage.width;
    canvas.height = wallImage.height;
    ctx.drawImage(wallImage, 0, 0);
  };

  canvas.addEventListener('click', (e) => {
    const pos = getMousePos(canvas, e);
    showCrackAnimation(pos.x, pos.y, canvas);
  });
}

function showCrackAnimation(x, y, canvas) {
  const crack = document.createElement('div');
  crack.className = 'crack-line';
  crack.style.left = `${canvas.offsetLeft + x}px`;
  crack.style.top = `${canvas.offsetTop + y}px`;
  crack.style.width = '2px';
  crack.style.height = '2px';
  document.body.appendChild(crack);

  anime({
    targets: crack,
    width: `${Math.random() * 50 + 50}px`,
    rotate: `${Math.random() * 360}deg`,
    duration: 1000,
    easing: 'easeOutExpo',
    complete: () => crack.remove(),
  });
}

// Love Feature
function initializeLoveFeature() {
  const imageUpload = document.getElementById('imageUpload');
  const canvas = document.getElementById('loveCanvas');
  const ctx = canvas.getContext('2d');

  loadImageToCanvas(imageUpload, canvas);

  canvas.addEventListener('click', (e) => {
    const pos = getMousePos(canvas, e);
    clickCount++;
    if (clickCount < maxClicks) {
      showHeartAnimation(pos.x, pos.y, canvas);
    } else if (clickCount === maxClicks) {
      displayImageInHeart(canvas);
    }
  });
}

function showHeartAnimation(x, y, canvas) {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.style.left = `${canvas.offsetLeft + x}px`;
  heart.style.top = `${canvas.offsetTop + y}px`;
  heart.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'64\' height=\'64\' viewBox=\'0 0 64 64\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M32 57s-1-.6-1-1c0-.4-.3-.6-.7-.8C23.5 51 8 37.9 8 24.4 8 14.3 15.5 8 24.5 8c5.3 0 10.3 3.4 12.5 8.4C39.3 11.4 44.3 8 49.5 8 58.5 8 66 14.3 66 24.4c0 13.5-15.5 26.6-22.3 30.8-.4.2-.7.4-.7.8 0 .4-1 .9-1 .9z\' fill=\'%23e74c3c\'/%3E%3C/svg%3E")';
  document.body.appendChild(heart);

  anime({
    targets: heart,
    translateY: -100,
    opacity: [1, 0],
    scale: [1, 1.5],
    duration: 1500,
    easing: 'easeOutCubic',
    complete: () => heart.remove(),
  });
}

// New function to display the image inside a heart shape
function displayImageInHeart(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Create a temporary canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  // Draw the heart shape path on the temporary canvas
  tempCtx.beginPath();
  const topCurveHeight = height * 0.3;
  tempCtx.moveTo(width / 2, topCurveHeight);
  tempCtx.bezierCurveTo(
    width / 2, topCurveHeight - (height * 0.15),
    0, topCurveHeight - (height * 0.15),
    0, topCurveHeight + (height * 0.2)
  );
  tempCtx.bezierCurveTo(
    0, height,
    width / 2, height,
    width / 2, height
  );
  tempCtx.bezierCurveTo(
    width / 2, height,
    width, height,
    width, topCurveHeight + (height * 0.2)
  );
  tempCtx.bezierCurveTo(
    width, topCurveHeight - (height * 0.15),
    width / 2, topCurveHeight - (height * 0.15),
    width / 2, topCurveHeight
  );
  tempCtx.closePath();

  // Clip to the heart shape
  tempCtx.clip();

  // Draw the original image into the heart-shaped clip
  tempCtx.drawImage(canvas, 0, 0);

  // Clear the main canvas
  ctx.clearRect(0, 0, width, height);

  // Animate drawing the heart image onto the main canvas
  ctx.globalAlpha = 0;
  ctx.drawImage(tempCanvas, 0, 0);
  
  anime({
    targets: ctx,
    globalAlpha: 1,
    duration: 2000,
    easing: 'linear',
    update: function() {
      // Redraw the image with the updated alpha
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(tempCanvas, 0, 0);
    },
  });
}
 // Initialize features based on the page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('burnCanvas')) {
      initializeBurnFeature();
    }
    if (document.getElementById('hurtCanvas')) {
      initializeHurtFeature();
    }
    if (document.getElementById('loveCanvas')) {
      initializeLoveFeature();
    }
  });
