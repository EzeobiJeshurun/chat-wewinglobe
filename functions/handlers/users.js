const { db, admin } = require('../util/admin');
const firebaseConfig = require('../util/firebaseConf');
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);



const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');


exports.sendAnEmailToChangePassword = (req, res)=>{
    const userEmail = req.body.email;
    firebase.auth().sendPasswordResetEmail(userEmail)
    .then(()=>{
        return res.status(200).json({message: "Reset email sent."});
    })
    .catch(()=>{
        return res.status(500).json({error: "Something went wrong?"});
    });
};

exports.signup = (req,res)=>{
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    const { valid, errors  } = validateSignupData(newUser);
    
    if(!valid){
        return res.status(400).json({errors});
    }

    const noImg = 'no-img.jpeg';

    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
    .then((doc)=>{
        if(doc.exists){
            return res.status(400).json({handle: 'this handle is already taken'});
        }else{
          return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
    }).then((data)=>{
        userId = data.user.uid;
        return data.user.getIdToken();
    }).then((tokenId)=>{
        token = tokenId;
        const credentials = {
           email: newUser.email,
           handle: newUser.handle,
           createdAt: new Date().toISOString(),
           imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
           userId
        };
        return db.doc(`/users/${newUser.handle}`).set(credentials);
    }).then(()=>{
       return res.status(200).json({ token });
    })
    
    .catch((err)=>{
        console.log(err.code);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(500).json({email: 'Email already in use'});
        }else{
        return res.status(500).json({general: 'Something went wrong, please try again.'});
       }
       });

};
// Login user in
exports.login = (req,res)=>{
    const loginCredentials = {
        email: req.body.email,
        password: req.body.password
    };

    const { valid, errors  } = validateLoginData(loginCredentials);
    
    if(!valid){
        return res.status(400).json({errors});
    }

    firebase.auth().signInWithEmailAndPassword(loginCredentials.email, loginCredentials.password)
    .then((data)=>{
        return data.user.getIdToken();
    }).then((token)=>{
        return res.json({token});
    })
    .catch((err)=>{
        
    
        return res.status(404).json({general: 'Invalid email or password, please try again.'});
    

    });
 };
 //Add use details
 exports.addUserDetails = (req,res)=>{
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(()=>{
        return res.json({message: "Details updated Successful"});
    })
    .catch((err)=>{
        console.error(err);
        return res.status(500).json({error: err.code});
    });
 };
 //get any user details
 exports.getUserDetails = (req,res)=>{
    let userData = {};
    db.doc(`/users/${req.params.handle}`).get()
    .then((doc)=>{
        if(doc.exists){
            userData.user = doc.data();
            return db.collection('weshout').where('userHandle','==', req.params.handle)
            .orderBy('createdAt','desc')
            .get();
        }else{
            return res.status(404).json({error: 'User not found'});
        }
    })
    .then((data)=>{
        userData.weshout = [];
        data.forEach(doc =>{
            userData.weshout.push({
                body: doc.data().body,
                createdAt: doc.data().createdAt,
                userHandle: doc.data().userHandle,
                userImage: doc.data().userImage,
                likeCount: doc.data().likeCount,
                commentCount: doc.data().commentCount,
                weshoutId: doc.id
            });
        });
        return res.json(userData);
    })
    .catch((err)=>{
        console.error(err);
        return res.status(500).json({error: err.code});
    });
 };
 //get own user details for specifying actions excuted by the you
 exports.getAuthenticatedUser = (req,res)=>{
   let userData = {};
   db.doc(`users/${req.user.handle}`).get()
   .then((doc)=>{
    if(doc.exists){
        userData.credentials = doc.data();
        return db.collection('likes').where('userHandle', '==', req.user.handle).get();
    }
   }).then((data)=>{
        userData.likes = [];
        data.forEach(doc=>{
            userData.likes.push(doc.data());
        });
        return db.collection('notifications').where('recipient','==', req.user.handle)
        .orderBy('createdAt','desc').limit(15).get();

   }).then((data)=>{
       userData.notifications = [];
       data.forEach(doc=>{
        userData.notifications.push({
            recipient: doc.data().recipient,
            sender: doc.data().sender,
            createdAt: doc.data().createdAt,
            weshoutId: doc.data().weshoutId,
            type: doc.data().type,
            read: doc.data().read,
            notificationId: doc.id
        });
       });
       return res.json(userData);
   }).catch(err =>{
       console.error(err);
       return res.status(500).json({error: err.code});
   });
 };


//image a profile image for user
 exports.uploadImage = (req, res)=>{

    const Busboy = require('busboy');
    const path = require('path');
    const os   = require('os');
    const fs   = require('fs');

    const busboy = new Busboy({headers: req.headers});
    let imageFileName; 
    let imageToBeUploaded ={} ;
    busboy.on('file',(fieldname,file,filename, encoding, mimetype)=>{

    if(mimetype !== "image/jpeg" && mimetype !== "image/png" && mimetype !== "image/jpg"){
        return res.status(400).json({error: 'file type must be jpeg/png'});
   }    
    let imgExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(Math.random()*10000000000)}.${imgExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);

    imageToBeUploaded = {filepath, mimetype};
    file.pipe(fs.createWriteStream(filepath));
    console.log('reached the end of on file');
    });

    busboy.on('finish', ()=>{
        console.log('entered finish call');
        admin.storage().bucket().upload(imageToBeUploaded.filepath,{
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
            
        }).then(()=>{
        console.log('loading was successful');
            
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;

           return db.doc(`/users/${req.user.handle}`).update({imageUrl});
       
        }).then(()=>{
            return res.status(200).json({message:'The image uploaded successfully'});
        })
        .catch((err)=>{
            console.log(err);
            return res.status(500).json({error: err.code});
        });
    });
    
    busboy.end(req.rawBody);
   
 };

exports.markNotificationsRead = (req,res)=>{
    let batch = db.batch();
    req.body.forEach(notificationId =>{
        const notification = db.doc(`/notifications/${notificationId}`);
        batch.update(notification, {read: true});
    });
    batch.commit()
    .then(()=>{
        return res.json({message: 'Notification marked read'});
    })
    .catch((err)=>{
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

 