
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();


// http callable function (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     'unauthenticated', 
    //     'only authenticated users can add requests'
    //   );
    // }
    // if (data.text.length > 30) {
    //   throw new functions.https.HttpsError(
    //     'invalid-argument', 
    //     'request must be no more than 30 characters long'
    //   );
    // }
    return admin.firestore().collection("users").add({
      username: "zenric",
    });
  });