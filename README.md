# social-media

__TABLE OF CONTENT__
* Getting Started
* API Routes
> Authentication
> Get other users
> Follow a user
> Get personal posts
> Get others(who u follow) posts
> Create new post
> Get a single post with comments
> like post

* Pagination
* File Upload
* Websocket Usage

## Getting Started 
* Navigate to the project root and run `npm install` to install the utilized packages
* Setup the environment variables using the sample in the root folder as a guide
* Proceed to running the service `npm start'


## API Routes
The base url of all routes in the application is `/api/v1/`
other routes used are to prefixed with this. This can be achieved using `axios.defaults.baseUrl = "/api/v1/"` or other methods as such

__Authentication__
* To register as a usér of the application, make a POST request preferably with axios through the frontend to `/auth/create-account` with the follow request body {name, email, password}

* To make an authentication to use the app, make a POST request through the frontend to `/auth/login` with the follow request body {email, password}. This logs the user in and also sends a cookie which will be  needee by the websocket in later section

* a POST request through the frontend to `/auth/logout` to destroy the authentication

## __Get users__
make a GET request to `/users` to get a list of users

## __Follow users__
make a POST request to `/users/:userId` to follow that user and and another request to the same route to unfollow

## __Get Personal Posts__
make a GET request to `/posts` to get the list of the user's post. The response return an array of objects with the following properties - content, attachment, id, likes

## __Get other people Posts__
make a GET request to `/posts/others` to get the list of other peoples post. The response return an array of objects with the following properties - content, attachment, id, likes

## __Like a Posts__
make a POST request to `/posts/:postId/like` to like the post amd repeat the same to undo the like

## __Comment a Posts__
make a POST request to `/posts/:postId/comment` to make a comment on a post
 
## __Get single Post__
make a GET request to `/posts/:postId` to  get the data of a single post - content, attachment, likes and another array containing other users comments
 
## __Create Post__
First handle attachments upload if there exist as explained in the next setion the proceed to create new post with the file path of the attachment uploaded return by the file upload handler and pass it to the create post request.. To add the post, make a POST request to `/posts/create` with the request body containing the content and the attachment
 
 
## Pagination
 To utilize pagination, a urlsearchparam is needed as absence will lead to geting only data of first page. the urlsearchparam should have a name of "page"
 
 
 ## File Upload
 before proceeding to saving a post or for any file upload,  a POST requeat should be made to `/upload` . File is uploaded chunk by chunk and the file path is sent in the response.
 Utilize an aproach like below to achieve file upload
 ```
attachments = document.getElementById('attachments')
document.getElementById('create-post').addEventListener('submit', async (e) => {
          e.preventDefault()
          content = document.getElementById('content').value

          readAndUploadChunk(attachments).then(async (resp) => {
               console.log(resp)
               if (resp.status == "complete") {
                    console.log(resp.file_path)
                    const createPost = await axios.post("/api/v1/posts", { content, attachment: resp.file_path });
                    console.log(createPost.data)
               }

          })
     })

     // const fileInput = document.getElementById('attachments');
     function readAndUploadChunk(attachments) {
          return new Promise((resolve, reject) => {
               let uploadStatus = {}
               const file = attachments.files[0];
               const chunkSize = 512 * 1024; // 500kb
               const totalChunks = Math.ceil(file.size / chunkSize);
               let startByte = 0;
               for (let i = 1; i <= totalChunks; i++) {
                    const endByte = Math.min(startByte + chunkSize, file.size);
                    const chunk = file.slice(startByte, endByte);
                    const filereader = new FileReader
                    filereader.readAsDataURL(chunk)
                    filereader.onload = async (e) => {
                         let uploadResp = await uploadChunk(e.target.result, totalChunks, i, file.name);
                         if (uploadResp.status == "complete")
                              resolve(uploadResp)
                    }

                    startByte = endByte;
               }
          })

     }
     // fileInput.addEventListener('change', async (event) => {

     // });


     async function uploadChunk(chunk, totalChunks, currentChunk, filename) {
          const formData = new FormData();
          formData.append('file', chunk);
          formData.append('chunkNumber', currentChunk);
          formData.append('totalChunks', totalChunks);
          formData.append('currentChunk', currentChunk);
          formData.append('originalname', filename);
          const response = await fetch('/api/v1/upload', {
               method: 'POST',
               body: formData
          });

          if (!response.ok) {
               throw new Error('Chunk upload failed');
          }

          return await response.json()
     }

 ```
 
 
 ## Websockect
 Real time notification is achieved with websocket. For each client to receive appropriate notification, Cookie set by authentication should be sent to the websocket server as a token variable after connection is established and when appropriate message is sent, the responsible client receives it.
 
 ===
 A simple HTML and JavaScript file have been added to the public folder which utilizes all the routes and connection
 
 
 # Summary
 Use Case         Method        Route                                     Params
* Register          POST            /api/v1/auth/create-account        name, email, password
* Login              POST            /api/v1/auth/login              email, password
* Logout           POST            /api/v1/auth/logout
* All users         GET              /api/v1/users
* Follow User    POST            /api/v1/users/:userId/follow
* My Posts        GET              /api/v1/posts
* Others Posts   GET              /api/v1/posts/others
* Create Post     POST           /api/v1/posts                      content, attachment
* Upload File    POST           /api/v1/upload                     file, currentChunk, totalChunk, chuckNumber
* Single Post     GET              /api/v1/posts/:postId
* Like Posts       POST            /api/v1/posts/:postId/like
* Comment Posts    POST            /api/v1/posts/:postId/comment    comment


## Environment Variable Setup
The following are needed to be added in the .env file
* PORT
* MONGO_URL
* JWT_SECRET
* SESSION_SECRET
