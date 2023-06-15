// Get all input elements from HTML page and create canvas context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const undoBtn = document.getElementById('undoBtn');
const exportBtn = document.getElementById('exportBtn');
const colorPicker = document.getElementById('colorPicker');
const promptTxt = document.getElementById('prompt');

// Create image element and draw it on canvas
const image = new Image();
image.crossOrigin = "Anonymous"; // Prevent CORS errors when using localhost (for testing only)
image.onload = function() {
    ctx.drawImage(image, 0, 0); //Expects image of 512x512 (canvas size and Replicate API size)
};
// This example uses a random image from Unsplash, specifying size and search query through the URL
image.src = 'https://source.unsplash.com/512x512/?minimal%20product%20design';

// Track if user is currently drawing and store last position of the mouse
let drawing = false;
let lastX = 0;
let lastY = 0;
let stateList = []; //Stack of canvas states after each stroke

// Link HTML elements to specific actions and functions using eventlisteners
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => drawing = false); // Mouse released (stop drawing)
canvas.addEventListener('mouseout', () => drawing = false); // Mouse out of frame
undoBtn.addEventListener('click', undoStroke);
exportBtn.addEventListener('click', exportImage);
colorPicker.addEventListener('input', () => {ctx.strokeStyle = colorPicker.value;}); //Update stroke color directly

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY]; // Update start position of next stroke to current mouse position
    saveStroke(); //We save the current state, before the next stroke is actually drawn
});

// Draw a line from last position to current position (happens very quickly to create a smooth line)
function draw(e) {
    if (!drawing) return; // Once mouse is released, stop drawing
    ctx.strokeStyle = colorPicker.value;
    ctx.lineCap = 'round';
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY); // Start drawing from last position
    ctx.lineTo(e.offsetX, e.offsetY); // Draw to current position
    ctx.stroke(); // Make the line visible
    [lastX, lastY] = [e.offsetX, e.offsetY]; // Update start position of next stroke to current mouse position
}

// Save current canvas state as dataURL (image + drawings)
function saveStroke() {
    stateList.push(canvas.toDataURL());
}

// Go back to previous state of canvas
function undoStroke() {
    if (stateList.length > 0) {
        const previousState = stateList.pop(); // This works because saveStroke() before drawing a new stroke

        //Clear canvas and draw last state
        const image = new Image();
        image.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
        };
        image.src = previousState;
    }
}

// Export canvas as dataURL and send it to the server to be edited
function exportImage() {
    const method = "sketch";
    const prompt = promptTxt.value;
    const url = canvas.toDataURL('image/png');

    // We use JSON to send data to the server
    const json = {
        "method": method,
        "prompt": prompt,
        "url": url
    }

    // The server has specific API endpoints, here we use the edit endpoint
    fetch("http://localhost:3000/api/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json)

    // The server will return a JSON object with the URL of the edited image
    }).then(response => response.json()).then(data => {
        const image = new Image();
        image.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
        }
        
        // We use saveStroke() so that when drawing the edited image, we can undo it without removing the Replicate Image
        image.crossOrigin = "Anonymous"; // Prevent CORS error that prevents storing canvas states
        image.src = data.url;
        saveStroke();
    });
}

