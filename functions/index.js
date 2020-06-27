const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//auth triggers (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
    //for background triggers you must return a value/promise
    return admin.firestore().collection('users').doc(user.id).set({
        email: user.email,
        upvotedOn: [],
    });
});

//auth triggers (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
    //for background triggers you must return a value/promise
    const doc = admin.firestore().collection('users').doc(user.id);
    return doc.delete();
});