// NOTE
// This code relies on an older version of the Visioniary Server that used WebSockets for communication.
// The current server uses a custom API, therefore the code below is deprecated.

// Add event listener for socket on port 3100, and check for it to connect
const socket = io('http://localhost:3100');

// Get elements
const searchBox = document.getElementById('search-box');
const editBox = document.getElementById('edit-box');

var selected = false;

// Receive search query and send it to server
searchBox.addEventListener("submit", function(e) {
    e.preventDefault();
    const query = new FormData(searchBox).get("query");
    socket.emit("query", query);
});

// Receive edit prompt and method and send it to server
editBox.addEventListener("submit", function(e) {
    e.preventDefault();
    const prompt = new FormData(editBox).get("prompt");
    const method = new FormData(editBox).get("method");
    if (selected) {
        url = document.querySelector("img[class*=selected]").src; //Use class selector to find selected image and URL
    } else {
        return;
    }
    socket.emit("prompt", prompt, method, url);
});

// Tracking whether images are selected works by adding/removing a class to the selected image
function select(e) {
    e.preventDefault();

    // if current image is already selected, deselect it and remove caption and keywords from page
    if (this.className.includes('selected')) {
        this.className = this.className.replace(' selected', '');
        document.getElementById('list-group-lab').remove();
        document.getElementById('list-group-obj').remove();
        document.getElementById('list-group-cap').remove();
        selected = false;
        return;
    }

    // Remove selection from all selected images (to make sure no doubles can occur)
    const feedImgs = document.querySelectorAll('.resImg');
    for (const img of feedImgs) {
        if (img.className.includes('selected')) {
            img.className = img.className.replace(' selected', '');
        }
    }

    // Add selection to current image and send URL to server for keyword analysis
    // Remove remaining caption and keywords from other image from the page
    this.className += ' selected';
    selected = true;
    socket.emit("label", this.src);
    document.getElementById('list-group-lab').remove();
    document.getElementById('list-group-obj').remove();
    document.getElementById('list-group-cap').remove();
}

// Process new chunk of images from server
socket.on("images", images => {
    const urls = images[0];
    const ids = images[1]; // Original Unsplash ID's

    // For each image, create an img element, add bootstrap class, and add it to the feed
    for (const url of urls) {
        var img = document.createElement('img');
        img.src = url;
        img.className = 'img-fluid resImg';
        img.id = ids[urls.indexOf(url)]; // Set ID to corresponding Unsplash ID

        var feed = document.getElementById('feed');
        feed.prepend(img); // Add new images to top of feed
    }

    // Add eventlistener to all new images
    const feedImgs = document.querySelectorAll('.resImg');
    for (const img of feedImgs) {
        img.addEventListener('click', select);
    }
});

// Process new image edits from server
socket.on("edits", edits => {
    
    // For each image (Replicate can return more than 1), create an img element, add bootstrap class, and add it to the feed
    for (const url of edits) {
        var img = document.createElement('img');
        img.src = url;
        img.className = 'img-fluid resImg';

        var feed = document.getElementById('feed');
        feed.prepend(img); // Add new images to top of feed (non-destructive)
    }

    // Add eventlistener to all new images
    const feedImgs = document.querySelectorAll('.resImg');
    for (const img of feedImgs) {
        img.addEventListener('click', select);
    }
});

// Process new keywords from server (both labels and objects)
socket.on("keywords", list => {
    const listLab = list[0];
    const listObj = list[1];
    
    // Add a new list element and add all labels to it
    const ullab = document.createElement('ul');
    ullab.classList = 'list-group';
    ullab.id = 'list-group-lab';

    for (const label of listLab) {
        const li = document.createElement('li');
        li.classList = 'list-group-item';
        li.textContent = label;
        ullab.appendChild(li);
    }

    // Add a new list element and add all objects to it
    const ulobj = document.createElement('ul');
    ulobj.classList = 'list-group list-group-obj';
    ulobj.id = 'list-group-obj';

    for (const label of listObj) {
        const li = document.createElement('li');
        li.classList = 'list-group-item';
        li.textContent = label;
        ulobj.appendChild(li);
    }

    // Display both lists on the page
    const div = document.getElementById('label');
    div.appendChild(ullab);
    div.appendChild(ulobj); 
});

// Process new caption from server
socket.on("caption", caption => {
     // Add a new list element and add the caption to it
    const ulcap = document.createElement('ul');
    ulcap.classList = 'list-group list-group-cap';
    ulcap.id = 'list-group-cap';

    const li = document.createElement('li');
    li.classList = 'list-group-item';
    li.textContent = "Caption: " + caption;
    ulcap.appendChild(li);

    const div = document.getElementById('label');
    div.prepend(ulcap); // We want the caption to be displayed on top of the other lists
});