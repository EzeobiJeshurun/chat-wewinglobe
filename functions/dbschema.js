let db = {

    users :[
        {
            userId: 'lkasfjsndfdjnfsjdjdnfjdb',
            email: 'fornow@email.com',
            handle: 'topboss',
            createdAt: 'Wed, 25 Dec 2019 18:48:40 GMT',
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/wecommune-f1e592.appspot.com/o/8145174733.jpeg?alt=media',
            bio: 'Im a cool guy ',
            website: 'www.datsall',
            location: 'Nigeria',
            gender: 'male'
        }
    ],
    weshout: [
        {
            userHandle: 'user',
            body: 'this is the scream body',
            createdAt: 'Wed, 25 Dec 2019 18:48:40 GMT',
            likeCount: 5,
            commentCount: 2
        }
    ],
    comments: [
        {
            userHandle: 'user',
            weshoutId: 'dkjfkdjsjkjdksjdkjfkdkl',
            body: 'God is great',
            createdAt: 'Wed, 25 Dec 2019 18:48:40 GMT'
        }
    ] ,
    notification: [
        {
            recipient: 'user',
            sender: 'ekene',
            read: 'true | false',
            weshoutId: 'skdiddkkdiehheifeiejefiej',
            type: 'like | comment',
            createdAt: 'Wed, 25 Dec 2019 18:48:40 GMT'
        }
    ]
};

const userDetails = {
    //Redux data
    credentials: {
        userId: 'lkasfjsndfdjnfsjdjdnfjdb',
        email: 'fornow@email.com',
        handle: 'topboss',
        createdAt: 'Wed, 25 Dec 2019 18:48:40 GMT',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/wecommune-f1e592.appspot.com/o/8145174733.jpeg?alt=media',
        bio: 'Im a cool guy ',
        website: 'www.datsall',
        location: 'Nigeria',
        gender: 'male'
    },

    likes: [
        {
            handle: 'topboss',
            screamId: 'lkasfjsndfdjnfsjdjdnfjdb'
        },
        {
            handle: 'topboss',
            screamId: 'lkasfajhjsdfuweoweuhefhe'
        }
    ]
};