import jwt from 'jsonwebtoken';
import WebSocket from 'ws';

export let clients = {}
export let activeUsers = {}


const getUserInfo = (token) => {
     return new Promise((resolve, reject) => {
          jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
               resolve(userInfo)
          })
     })
}

export async function handleClientRequest(message, userWsId) {
     const dataFromClient = JSON.parse(message.toString());
     const { token } = dataFromClient

     let json = { type: dataFromClient.type };
     try {
          if (dataFromClient.type === "CONNECTION") {
               let userInfo = await getUserInfo(token)

               activeUsers[token] = {
                    ...userInfo,
                    ws_connection_id: userWsId
               }
          }
     } catch (error) {
          json.data = {
               message: "Unable to send request",
          }
          console.log(error)
          broadcastMessageToSingleUser(json, userWsId);
     }

}


function broadcastMessage(json) {
     // We are sending the current data to all connected clients
     const data = JSON.stringify(json);
     for (let userId in clients) {
          let client = clients[userId];
          if (client.readyState === WebSocket.OPEN) {
               client.send(data);
          }
     };
}

export const processWsMessage = async (userToMessage, message) => {
     for (let client in activeUsers) {
          if (activeUsers[client].id == userToMessage) {
               let wsConectionId = activeUsers[client].ws_connection_id
               broadcastMessageToSingleUser({ type: 'like', message }, wsConectionId)
          }
     }
}

export function broadcastMessageToSingleUser(json, userId) {
     // We are sending the current data to a single client
     if (!userId) return;
     const data = JSON.stringify(json);
     let client = clients[userId];

     if (!client) return;
     if (client.readyState === WebSocket.OPEN) {
          client.send(data);
     }
}
