import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireFunctions } from '@angular/fire/functions';
import { mergeMap, take } from 'rxjs/operators';
import 'rxjs/operator/take';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {
    firebase = firebase;

    constructor(
        private angularFireDB: AngularFireDatabase,
        private angularFireAuth: AngularFireAuth,
        private angularFireMessaging: AngularFireMessaging,
        private angularFireFunctions: AngularFireFunctions,
        private http: HttpClient
    ) {
        this.angularFireMessaging.messages.subscribe(message => {
            console.log('MESSAGE', message);
        });
    }
    requestPermission() {
        this.angularFireMessaging.requestPermission
            .pipe(mergeMap(() => this.angularFireMessaging.tokenChanges))
            .subscribe(
                token => {
                    console.log('Permission granted!', token);
                },
                error => {
                    console.error(error);
                }
            );
    }
    deleteToken() {
        this.angularFireMessaging.getToken
            .pipe(mergeMap(token => this.angularFireMessaging.deleteToken(token)))
            .subscribe(token => {
                console.log('Deleted!');
            });
    }

    pushMessage() {
        // const callable = this.angularFireFunctions.httpsCallable('sendMessage');
        // let data$ = callable({ name: 'some-data' });

        // data$.subscribe(res => {
        //     console.log('called function', res);
        // });

        // this.http
        //     .post(
        //         'https://us-central1-push-notification-test-28b5e.cloudfunctions.net/sendMessage',
        //         {}
        //     )
        //     .subscribe(res => console.log('sent function', res));

        this.angularFireMessaging.getToken.subscribe(token => {
            const headers = new HttpHeaders({
                Authorization: 'key=AIzaSyAx0pEdg-BTq0rfGgQvBaFTuVRKrVW-v1c',
                'Content-Type': 'application/json',
            });
            console.log('sending message to token:', token);
            const message = {
                to: JSON.stringify(token),
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

            this.http
                .post('https://fcm.googleapis.com/fcm/send', message, { headers })
                .subscribe(result => console.log('post success', result));
        });
    }
    updateToken(userId, token) {
        // we can change this function to request our backend service
        this.angularFireAuth.authState.pipe(take(1)).subscribe(() => {
            const data = {};
            data[userId] = token;
            this.angularFireDB.object('fcmTokens/').update(data);
        });
    }
}
