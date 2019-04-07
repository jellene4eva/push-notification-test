import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.sendMessage = functions.https.onCall(async (req, res) => {
    const message: any = {
        token: '1082187050427',
        notification: {
            title: 'FCM Message',
            body: 'This is a message from FCM',
        },
        webpush: {
            headers: {
                Urgency: 'high',
            },
            notification: {
                body: 'This is a message from FCM to web',
                requireInteraction: 'true',
                badge: '/badge-icon.png',
            },
        },
    };

    return admin
        .messaging()
        .send(message)
        .then(result => JSON.stringify(result));
});
