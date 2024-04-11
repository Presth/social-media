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
