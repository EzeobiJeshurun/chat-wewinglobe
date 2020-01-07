
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
                weshoutid: doc.id,
                body: doc.data().body,
                createdAt: doc.data().createdAt,
                useHandle: doc.data().useHandle
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
        createdAt: new Date().toGMTString()
    };
    db.collection('weshout')
    .add(newWeshout).then(doc =>{
        return res.json({message: `document ${doc.id} created successfully`})
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });
    });
 };