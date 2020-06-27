const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//auth triggers (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
    //for background triggers you must return a value/promise
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        upvotedOn: [],
    });
});

//auth triggers (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
    //for background triggers you must return a value/promise
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});


// http callable function (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
    //check auth state
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can add requests'
        );
    }
    if (data.text > 30) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'request must be no more than 30 characters long'
        );
    }
    return admin.firestore().collection('requests').add({
        text: data.text,
        upvotes: 0,
    })
})

// upvote callable function
exports.upvote = functions.https.onCall((data, context) => {
    //check auth state
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can add requests'
        );
    }
    //get refs for users doc & request doc
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);

    return user.get().then(doc => {
        //check user hasn't already upvoted the request
        if(doc.data().upvotedOn.includes(data.id)){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You can only upvote something once'
            );
        }
        //update user array
        return user.update({
            upvotedOn: [...doc.data().upvoteOn, data.id]
        }).then(() => {
            //update votes in the request
            return request.update({
                upvotes: admin.firestore.FieldValue.increment(1)
            });
        });
    });
});