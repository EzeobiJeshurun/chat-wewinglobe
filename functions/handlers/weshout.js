
const { db, admin } = require('../util/admin');


exports.getAllweshout = (req,res)=>{
    db
    .collection('weshout')
    .orderBy('createdAt','desc')
    .get()
    .then(data =>{
        let weshout = [];
        data.forEach(doc => {
            weshout.push({
                weshoutId: doc.id,
                body: doc.data().body,
                createdAt: doc.data().createdAt,
                useHandle: doc.data().useHandle,
                userImage: doc.data().userImage,
                likeCount: doc.data().likeCount,
                commentCount: doc.data().commentCount
            });
        });
        return res.json(weshout);
    })
    .catch(err => console.error(err));
 };

 exports.postOneWeshout = (req,res)=>{
     if(req.body.body.trim() === ''){
         return res.status(400).json({body: 'Body must not be empty'});
     }
    const newWeshout = {
        body : req.body.body,
        useHandle: req.user.handle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toGMTString(),
        likeCount: 0,
        commentCount: 0
    };
    db.collection('weshout')
    .add(newWeshout).then(doc =>{

        const resWeshout = newWeshout;
        resWeshout.weshoutId = doc.id;
        return res.json(resWeshout)
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });
    });
 };
//fetch one weshout
 exports.getWeshout = (req,res)=>{
    let weshoutData = {};
    db.doc(`/weshout/${req.params.weshoutId}`).get()
    .then((doc)=>{
        if(!doc.exists){
            return res.status(404).json({error: 'weshout not found'});
        }
        weshoutData= doc.data();
        weshoutData.weshoutId = doc.id;
        return db.collection('comments').orderBy('createdAt', 'desc')
        .where('screamId','==', req.params.screamId).get();
    })
    .then(data => {
        weshoutData.comments = [];
        data.forEach(doc =>{
            weshoutData.comments.push( doc.data());
        });
        return res.json(weshoutData);
    })
    .catch(err=>{
        console.error(err);
        return res.status(500).json({error: err.code});
    });
 };

 //comment on a weshout
 exports.commentOnWeshout = (req, res)=>{
    if(req.body.body.trim() === '') return res.status(400).json({comment: 'must not be empty'});
    const newComment ={
        body: req.body.body,
        createdAt: new Date().toGMTString(),
        weshoutId: req.params.weshoutId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    db.doc(`/weshout/${req.params.screamId}`).get()
    .then(doc=>{
        if(!doc.exists){
            return res.status(404).json({error: 'Weshout not found'});
        }
       return doc.ref.update({commentCount: doc.data().commentCount + 1});
       
    })
    .then(()=>{
        return db.collection('comments').add(newComment);
    })
    .then(()=>{
        return res.json(newComment);
    })
    .catch(err=>{
        console.error(err);
        return res.status(500).json({error: 'Something went wrong'});
    });
 };

 exports.likeWeshout  = (req, res)=>{
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId).limit(1);

    const weshoutDocument = db.doc(`/weshout/${req.params.weshoutId}`);

    let weshoutData = {};

    weshoutDocument.get()
    .then((doc)=>{
        if(doc.exists){
            weshoutData = doc.data();
            weshoutData.weshoutId = doc.id;

            return likeDocument.get();
        }else{
            return res.status(404).json({error: 'weshout not found'});
        }
    })
    .then(data=>{
        if(data.empty){
            return db.collection('likes').add({
                weshoutId: req.params.weshoutId,
                userHandle: req.user.handle
            })
            .then(()=>{
                weshoutData.likeCount++;
                return weshoutDocument.update({likeCount: weshoutData.likeCount});
            })
            .then(()=>{
                return res.json(weshoutData);
            });
        }else{
            return res.status(400).json({error: 'Weshout already liked'});
        }
    })
    .catch(err=>{
        console.log(err);
        return res.status(500).json({error: err.code});
    });
 };


 exports.unlikeWeshout = (req,res)=>{
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('weshoutId', '==', req.params.weshoutId).limit(1);

    const weshoutDocument = db.doc(`/weshout/${req.params.weshoutId}`);

    let weshoutData = {};

    weshoutDocument.get()
    .then((doc)=>{
        if(doc.exists){
            weshoutData = doc.data();
            weshoutData.weshoutId = doc.id;

            return likeDocument.get();
        }else{
            return res.status(404).json({error: 'weshout not found'});
        }
    })
    .then(data=>{
        if(data.empty){
            return res.status(400).json({error: 'Weshout not liked'});
        }else{
            return db.doc(`/likes/${data.docs[0].id}`).delete()
            .then(()=>{
                weshoutData.likeCount--;
                return weshoutDocument.update({likeCount: weshoutData.likeCount})
                .then(()=>{
                    res.json(weshoutData);
                });
            });
        }
    })
    .catch(err=>{
        console.log(err);
        return res.status(500).json({error: err.code});
    });
 };

 exports.deleteWeshout = (req,res)=>{
    const document = db.doc(`/weshout/${req.params.weshoutId}`);
    document.get()
    .then((doc)=>{
        if(!doc.exists){
            return res.status(404).json({error: 'Weshout not found'});
        }
        if(doc.data().userHandle !== req.user.handle){
            return res.status(403).json({error: 'Unauthorized'});
        }else{
            return document.delete();
        }
    })
    .then(()=>{
        return res.json({message: 'Weshout deleted Successfully'});
    })
    .catch((err)=>{
        console.error(err);
        return res.status(500).json({error: err.code});
    });
 };