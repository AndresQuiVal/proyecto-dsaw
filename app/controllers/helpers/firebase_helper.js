"use strict";

const firebase = require("firebase");
require("firebase/database"); // If you are using Firebase Realtime Database
require("firebase/firestore"); // If you are using Firestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrJyvq87obnym5fj4bga22V2AqrB3Lxe0",
  authDomain: "proyecto-dsaw.firebaseapp.com",
  databaseURL: "https://proyecto-dsaw-default-rtdb.firebaseio.com",
  projectId: "proyecto-dsaw",
  storageBucket: "proyecto-dsaw.appspot.com",
  messagingSenderId: "383124467139",
  appId: "1:383124467139:web:9e89b181b3b75313c22176",
  measurementId: "G-TMBZ5HYBC2",
};

firebase.initializeApp(firebaseConfig);

// Firebase Realtime Database
const database = firebase.database();

// Firestore
const firestore = firebase.firestore();

//console.log("Hola MUndo");

function writeFirebase() {
  database.ref("Clients").set({
    hola: "adios",
  });

  return true;
}

function setUserLoginData(userId, password) {
  console.log(userId);
  console.log(password);

  const userRef = database.ref("Clients/" + userId);
  return new Promise((resolve, reject) => {
    userRef.once("value", (snapshot) => {
      if (!snapshot.exists()) {
        userRef
          .set({
            username: userId,
            password: password,
            date_created: new Date().toISOString(),
            posts: [
              {
                title: "Bienvenido a The Tech State",
                summary: "Este es un ejemplo de post para tu perfil",
                description: "This is supposed to be a long format desc",
                section: "Tech",
                img_url: "https://i.ibb.co/QcyzcTh/left-image.png",
                comments: [
                  {
                    username: "AndresQuiVal",
                    message:
                      "Hola, te acaba de comentar el admin! bienvenido a The Tech State!",
                  },
                ],
              },
            ],
            comments: [], // is not added but its supposed to!
          })
          .then(() => {
            // After setting the data, resolve the Promise with false
            resolve(false);
          })
          .catch((error) => {
            // If there is any error in setting the data, reject the Promise
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  });
}



function validatePassword(username, password) {
  return new Promise((resolve, reject) => {
    const userRef = database.ref(`Clients/${username}/password`);

    userRef
      .once("value", (snapshot) => {
        const passwordDB = snapshot.val();
        if (password === passwordDB) {
          resolve(true);
        }

        resolve(false);
      })
      .catch((error) => {
        // If there is any error in setting the data, reject the Promise
        reject(false);
      });
  });
}



// Función para obtener todos los posts de todos los usuarios
// Función para obtener todos los posts de todos los usuarios
// Función para obtener todos los posts de todos los usuarios, incluyendo el ID
function getAllPosts() {
  return new Promise((resolve, reject) => {
    const clientsRef = database.ref('Clients');

    clientsRef.once(
      'value',
      (snapshot) => {
        if (snapshot.exists()) {
          const clientsData = snapshot.val();
          const allPosts = [];

          // Recorre todos los usuarios para recopilar sus posts
          Object.keys(clientsData).forEach((username) => {
            const userPosts = clientsData[username].posts || {};

            // Iterar sobre los posts de cada usuario para agregar al arreglo total
            Object.keys(userPosts).forEach((postId) => {
              const post = userPosts[postId];
              allPosts.push({
                ...post, // Todos los detalles del post
                postId, // Incluir el ID del post
                username, // Asocia el nombre de usuario para referencia
              });
            });
          });

          resolve(allPosts);
        } else {
          resolve([]); // Si no hay posts
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

exports.getAllPosts = getAllPosts;




function getUserPosts(username, token) {
  return new Promise((resolve, reject) => {
    // Here, validate the token first (this part is just pseudocode)
    validateToken(username, token)
      .then((isValid) => {
        if (!isValid) {
          reject("Invalid token");
          return;
        }

        const postsRef = database.ref(`Clients/${username}/posts`);

        postsRef.once(
          "value",
          (snapshot) => {
            if (snapshot.exists()) {
              resolve(snapshot.val());
            } else {
              resolve([]); // Return an empty array if there are no posts
            }
          },
          (error) => {
            reject(error);
          }
        );
      })
      .catch((error) => {
        reject("Token validation failed");
      });
  });
}

function validateToken(username, token) {
  return new Promise((resolve, reject) => {
    const userRef = database.ref(`Clients/${username}/userTOKEN`);

    userRef
      .once("value", (snapshot) => {
        if (snapshot.exists()) {
          const userToken = snapshot.val();
          if (userToken === token) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getPostById(username, postId) {
  return new Promise((resolve, reject) => {
    const postRef = database.ref(`Clients/${username}/posts/${postId}`);
    postRef
      .once("value", (snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val())
          resolve(snapshot.val()); // Returns the post data as JSON
        } else {
          resolve(null); // No post found at the given index
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function deletePostById(username, postId, userTOKEN) {
  return new Promise((resolve, reject) => {
    validateToken(username, userTOKEN).then((isValid) => {
      if (!isValid) {
        reject("Invalid token");
        return;
      }
      const postRef = db.ref(`Clients/${userId}/posts/${postId}`);
      postRef
        .once("value", (snapshot) => {
          if (snapshot.exists()) {
            postRef.remove()
              .then(() => resolve(true))
              .catch(error => reject(error));
          } else {
            resolve(false); // No post found at the given index
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
}

function setUserToken(userId, userToken) {
  const userRef = database.ref("Clients/" + userId);

  return userRef
    .update({
      userTOKEN: userToken,
    })
    .then(() => {
      console.log("User token updated successfully.");
      return { success: true, message: "Token updated" };
    })
    .catch((error) => {
      console.error("Error updating user token:", error);
      return {
        success: false,
        message: "Failed to update token",
        error: error,
      };
    });
}

// Function to check if a user already exists in the database
function checkUserExists(userId) {
  return new Promise((resolve, reject) => {
      const userRef = database.ref(`Clients/${userId}`);

      userRef.once("value", snapshot => {
          if (snapshot.exists()) {
              resolve(true); // User exists
          } else {
              resolve(false); // User does not exist
          }
      }).catch(error => {
          reject(error); // Handle possible errors
      });
  });
  
}


function getUserInfo(username) {
  return new Promise((resolve, reject) => {
    const userRef = database.ref(`Clients/${username}`);

    userRef.once(
      'value',
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();

          // Prepara un objeto con la información relevante
          const userInfo = {
            username: userData.username,
            date_created: userData.date_created,
            profile_img: userData.profile_img || 'default-profile.jpg', // Puedes cambiar la ruta de la imagen por defecto
            posts_count: userData.posts ? Object.keys(userData.posts).length : 0,
            comments_count: userData.comments ? userData.comments.length : 0
          };

          resolve(userInfo);
        } else {
          resolve(null); // No existe el usuario
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}


// Exporta la función
exports.getUserInfo = getUserInfo;
exports.writeFirebase = writeFirebase;
exports.setUserLoginData = setUserLoginData;
exports.validatePassword = validatePassword;
exports.setUserToken = setUserToken;
exports.getUserPosts = getUserPosts;
exports.getPostById = getPostById;
exports.validateToken = validateToken;
exports.deletePostById = deletePostById;
exports.checkUserExists = checkUserExists;
