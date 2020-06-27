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
        text: data,
        upvotes: 0,
    })
})