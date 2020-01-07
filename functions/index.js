const functions = require('firebase-functions');


const express = require('express');
const app = express();


  const { getAllweshout, postOneWeshout } = require('./handlers/weshout');
  const { signup, login, uploadImage } = require('./handlers/users');

  const FBaseauth = require('./util/FBaseauth');




 
//Route for screams weshout
 app.get('/weshout', getAllweshout);
 app.post('/weshout', FBaseauth, postOneWeshout );



 //users route
 app.post('/signup', signup);

 app.post('/login', login);

 app.post('/user/image', FBaseauth, uploadImage);

 exports.api = functions.region('europe-west2').https.onRequest(app);
