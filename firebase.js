const admin = require('firebase-admin');
const serviceAccount = require('./config/push-notification-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  messaging: {
    apple: {
      keyId: 'XT8L874G4Z',
      teamId: '45L3TP96G4',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg8iY3bWxQeE54/wr6\nlH3+VfpW0DozCUROg1JyzI85eQCgCgYIKoZIzj0DAQehRANCAAQVJePYl7PRR5Y0\nc7oBhnJ3hiRaRWSn0/Dm1vbDW2/Pi0fXyH9Od9hcE31ffAGOqgoDgvca8dpSMKpb\nGl4GOpOr\n-----END PRIVATE KEY-----',
      sandbox: false
    }
  }
});

class FCMService {
  async sendToDevice(token, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // Важно для Flutter
        },
        token,
        apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
                'content-available': 1
              }
            },
            headers: {
              'apns-priority': '10',
              'apns-push-type': 'alert'
            }
          }
      };

      console.log('Sending message:', {
        token,
        title,
        body,
        data
      });
      const response = await admin.messaging().send({...message,android: {
        priority: "high"
      },fcm_options: {
        analytics_label: "notification_sent"
      }});
      
      console.log('Successfully sent message:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  async sendToMultipleDevices(tokens, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        tokens,
        apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
                'content-available': 1
              }
            },
            headers: {
              'apns-priority': '10',
              'apns-push-type': 'alert'
            }
          }
      };

      console.log(message);
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`${response.successCount} messages were sent successfully`);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      console.error('Error sending messages:', error);
      return { success: false, error: error.message };
    }
  }

  async sendToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        topic,
        apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
                'content-available': 1
              }
            },
            headers: {
              'apns-priority': '10',
              'apns-push-type': 'alert'
            }
          }
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to topic:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending message to topic:', error);
      return { success: false, error: error.message };
    }
  }

  // Подписка на топик
  async subscribeToTopic(tokens, topic) {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      console.log('Successfully subscribed to topic:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return { success: false, error: error.message };
    }
  }

  // Отписка от топика
  async unsubscribeFromTopic(tokens, topic) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FCMService();