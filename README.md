## Visionairy Code

Welcome the the Visioairy code base. This repository includes the code I have written for this project, including the complete back-end server and two front-end testing implementations. You can find them as follows:
- **Visionairy Server Files (back-end)**: /node_server/
- **Keyword Analysis Proof of Concept (front-end)**: /keyword_poc/
- **HTML Canvas Proof of Concept (front-end)**: /drawing_test/

Below, this README file provides an overview of the available server API endpoints and their request and response bodies.

### `POST /api/reset`

- **Description:** Reset libraries of server. NOTE: Must be called at page load/refresh.
- **Request Parameters:** N/A
- **Request Body:** N/A
- **Response Body:** N/A

### `GET /api/search/:query`

- **Description:** Get a chunk of images from Unsplash based on the provided query.
- **Request Parameters:**
  - `query` (string): The search query as a plain string.
- **Request Body:** N/A
- **Response Body:**
  - (200) An array of json objects containing "id", "url", "author", "username", and "download".
  - (500) Server error

### `GET /api/feed`

- **Description:** Get a new chunk of images from Unsplash at feed scroll.
- **Request Parameters:** N/A
- **Request Body:** N/A
- **Response Body:**
  - (200) An array of json objects containing "id", "url", "author", "username", and "download".
  - (500) Server error

### `POST /api/board/:id`

- **Description:** Add an image to the board and active library, generate caption and labels
- **Request Parameters:**
  - `id` (string): The identifier of the image to be added.
- **Request Body:** N/A
- **Response Body:**
  - (200) A json object containing "relevant", "new" and "nudge", which contain arrays of image labels
    - NOTE: This endpoint updates the entire keyword list every 3 images. This can take up to 10-15 seconds. On other image adds only the relevant keywords are updated, but old new and nudge keywords are also returned. This takes only about 2 seconds, which makes the experience much quicker!

### `DELETE /api/board/:id`

- **Description:** Delete an image from the board and active library.
- **Request Parameters:**
  - `id` (string): The identifier of the image to be deleted.
- **Request Body:** N/A
- **Response Body:**
  - (200) Image deleted
  - (404) Image not fount

### `POST /api/edit`

- **Description:** Edit image based on the specified method and prompt. NOTE: This endpoint can only run if GET 'feed' and POST 'board' endpoints are functional
- **Request Parameters:** N/A
- **Request Body:**
  - `method` (string): The method of editing to be applied to the image. Allowed values:
    - "sketch" (when sending image and sketch)
    - "hough" (when sending image only, line detection, preferred method for image only)
      - "depth" (when sending image only, depth detection)
      - "instruct" (when sending image only, reinterpretation)
    - "scribble" (when sending sketch only)
  - `prompt` (string): The prompt or instructions for the editing process.
  - `url` (string): Image dataURL with **JPEG** header
- **Response Body:**
  - A json object containing "id", "url" and "author".
    - If you want to save this image to the board, call the POST board endpoint like with an image from the feed, using the ID provided here.

### `GET /api/ask/:id`

- **Description:** Ask questions about an image using BLIP-2
- **Request Parameters:**
  - `id` (string): The identifier of the image to be added.
- **Request Body:**
  - `question` (string): The question to be asked about the image
  - `context` (string): Previous questions and answers to allow follow up questions
    - Formatting:
      - "Q: [question here]. A: [answer here]. Q: [next question here]. A: [next answer here]." (add more if necessary)
    - Sending context requires keeping track of the conversation on the front end. This could be stored in e.g. JSON as question-answer pairs in an array of objects.
- **Response Body:**
  - A string containing the answer from BLIP-2