
msg_box = document.getElementById('message')

const fetchPosts = async () => {
     const getPosts = await axios.get("/api/v1/posts");
     if (getPosts.data.posts) {
          getPosts.data.posts.forEach(post => {
               document.getElementById('posts').innerHTML += `
               <div>
                    ${post.content} (${post.likes.length})
               </div>
               `
          })
     }
}

fetchPosts()

index = 0;
const fetchOthersPosts = async () => {
     const getPosts = await axios.get("/api/v1/posts/others?currentIndex=" + index);
     if (getPosts.data.posts) {
          getPosts.data.posts.forEach(post => {
               document.getElementById('others-posts').innerHTML += `
               <div>
                    ${post.content}
                    <button onclick="likePost('${post._id}')"> (${post.likes.length}) Like</button>
                    <button onclick="setPostToComment('${post._id}')">Comment</button>
                    <button onclick="viewPost('${post._id}')">See Post </button>
               </div>
               `
          })

          index++;
          document.getElementById('others-posts').innerHTML += `
               <div>
                    <button onclick="fetchOthersPosts()">Next </button>
               </div>
               `

     }
}

fetchOthersPosts()

const fetchUsers = async () => {
     const getUsers = await axios.get('/api/v1/users');
     if (getUsers.data.users) {
          getUsers.data.users.forEach(user => {
               document.getElementById('users').innerHTML += `
               <div>
                    ${user.name}, ${user.email} <button onclick='follow("${user.id}")'>
                         Follow
                    </button>
               </div>
               `
          });
     }
}
fetchUsers()

const follow = async (id) => {
     const followReq = await axios.post(`/api/v1/users/${id}/follow`)
     console.log(followReq)
}

const likePost = async (id) => {
     const postLike = await axios.post(`/api/v1/posts/${id}/like`)
     console.log(postLike.data)
}

posttocomment = "";
const setPostToComment = (id) => {
     posttocomment = id
     document.getElementById('post-id').innerHTML = id
     document.getElementById('comment').focus()
}
const commentPost = async () => {

     // console.log
     comment = document.getElementById('comment').value

     const commentReq = await axios.post(`/api/v1/posts/${posttocomment}/comment`, { comment })
     console.log(commentReq)
}

document.getElementById('comment-form').addEventListener('submit', async (e) => {
     e.preventDefault()
     commentPost()
})

const viewPost = async (id) => {
     const post = await axios.get(`/api/v1/posts/${id}`)
     document.getElementById('post_info').innerHTML = post.data.post.content
     comments = post.data.comments
     console.log(comments)
     comments.forEach(comment => {
          document.getElementById('post_info').innerHTML += `
          <div> ${comment.comment} </div>
          `
     });
}
