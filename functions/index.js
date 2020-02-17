const functions = require('firebase-functions');
const {db} = require('./util/admin');

const express = require('express');
const app = express();


  const { getAllweshout, postOneWeshout, getWeshout, commentOnWeshout, likeWeshout, unlikeWeshout,deleteWeshout } = require('./handlers/weshout');
  const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require('./handlers/users');

  const FBaseauth = require('./util/FBaseauth');




 
//Route for screams weshout
 app.get('/weshout', getAllweshout);
 app.post('/weshout', FBaseauth, postOneWeshout );
 app.get('/weshout/:weshoutId', getWeshout);
 app.delete('/weshout/:weshoutId', FBaseauth, deleteWeshout);
 app.get('/weshout/:weshoutId/like',FBaseauth, likeWeshout);
 app.get('/weshout/:weshoutId/unlike',FBaseauth, unlikeWeshout);
 app.post('/weshout/:weshoutId/comment', FBaseauth, commentOnWeshout);


 //users route
 app.post('/signup', signup);

 app.post('/login', login);

 app.post('/user/image', FBaseauth, uploadImage);
 app.post('/user',FBaseauth, addUserDetails);
 app.get('/user', FBaseauth, getAuthenticatedUser);
 app.get('/user/:handle', getUserDetails);
 app.post('/notifications',FBaseauth, markNotificationsRead);
 

 exports.api = functions.region('europe-west2').https.onRequest(app);
 exports.createNotificationOnLike = functions.region('europe-west2').firestore.document('/likes/{id}')
 .onCreate((snapshot)=>{
    return db.doc(`/weshout/${snapshot.data().weshoutId}`).get()
    .then((doc)=>{
      if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
        return db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toGMTString(),
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          type: 'like',
          read: false,
          weshoutId: doc.id
        });
      }
    })
    .catch((err)=>{
      console.error(err);
    });
 });

 exports.deleteNotificationOnUnlike = functions.region('europe-west2')
 .firestore.document('/likes/{id}')
 .onDelete((snapshot)=>{
  return db.doc(`/notifications/${snapshot.id}`).delete()
  .catch((err)=>{
    console.error(err);
  });
 });

 exports.createNotificationOnComment = functions.region('europe-west2')
 .firestore.document('/comments/{id}')
 .onCreate((snapshot)=>{
  return db.doc(`/weshout/${snapshot.data().weshoutId}`).get()
  .then((doc)=>{
    if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
      return db.doc(`/notifications/${snapshot.id}`).set({
        createdAt: new Date().toGMTString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type: 'comment',
        read: false,
        weshoutId: doc.id
      });
    }
  })
  .catch((err)=>{
    console.error(err);
  });

 });

 exports.onUserImageChange = functions.region('europe-west2').firestore.document('/users/{userId}')
 .onUpdate((change)=>{
   let batch = db.batch();
  return db.collection('weshout').where('userHandle','==', change.before.data().handle).get()
 });
