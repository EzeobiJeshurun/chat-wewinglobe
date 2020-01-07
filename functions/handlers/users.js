const { db, admin } = require('../util/admin');
const firebaseConfig = require('../util/firebaseConf');
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');


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
           createdAt: new Date().toGMTString(),
           imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
           userId
        };
        return db.doc(`/users/${newUser.handle}`).set(credentials);
    }).then(()=>{
       return res.status(200).json({ token });
    })
    
    .catch((err)=>{
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({email: 'Email already in use'});
        }else{
        return res.status(500).json({error: err.code});
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
        console.error(err);
        if(err.code=== 'auth/wrong-password'){
            return res.status(403).json({Invalid: 'Invalid email or password'});
        }else if(err.code === 'auth/user-not-found' ){
            return res.status(404).json({Invalid: 'Invalid email or password'});
        }
        else{
            return res.status(500).json({error: err.code});
        }

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
 //get own user details for specifying actions excuted by the you
 exports.getAuthenticatedUser = (req,res)=>{

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

    if(mimetype !== image/jpeg && mimetype && mimetype !== image/png){
        return res.status(400).json({error: 'file type must be jpeg/png'});
    }    
    let imgExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(Math.random()*10000000000)}.${imgExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);

    imageToBeUploaded = {filepath, mimetype};
    file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', ()=>{
        admin.storage().bucket().upload(imageToBeUploaded.filepath,{
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
            
        }).then(()=>{
        
            
            const imgUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;

           return db.doc(`/users/${req.user.handle}`).update({imageUrl});
       
        }).then(()=>{
            return res.status(200).json({message:'The image uploaded successfully'});
        })
        .catch((err)=>{
            return res.status(500).json({error: err.code});
        });
    });
    busboy.end(req.rawBody);

 };