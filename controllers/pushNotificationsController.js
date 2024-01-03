const https = require('https');

module.exports = {


    sendNotification(token, data) {

        const notification = JSON.stringify({
            'to': token,
            'data': {
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'title': data.title,
                'body': data.body,
                'id_notification': data.id_notification,
            },
            'notification': {
                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                'title': data.title,
                'body': data.body,
                'id_notification': data.id_notification,
            },
            'priority': 'high',
            'ttl': '4500s'
        });

        const options = {
            hostname: 'fcm.googleapis.com',
            path: '/fcm/send',
            method: 'POST',
            port: 443,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'key=AAAA1chZK2I:APA91bE51Nj4Cs_2rLa4Mbx42hX6q58O_GoHcRsAEiV04mgw3zkmzQiX0nry6jHclBho1RHfHsOGPT1H13ycPMvk1nkgcYrNwXh9GUG9Q1gD1JyPodUOt3JWWnxp74acZgnF1CoUyYs-',
            }
        }

        const req = https.request(options, (res) => {
            console.log('STATUS CODE FIREBASE', res.statusCode);

            res.on('data', (d) => {
                process.stdout.write(d);
            });
        });

        req.on('error', (error) => {
            console.log('ERROR DE FIREBASE MESSAGING', error);
        });

        req.write(notification);
        req.end();

    }

}