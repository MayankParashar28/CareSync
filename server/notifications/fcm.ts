import admin from 'firebase-admin';

let messaging: admin.messaging.Messaging | null = null;

export function initializeMessaging() {
    try {
        if (!admin.apps.length) {
            // Check if service account env vars are present
            const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;

            if (serviceAccountKey) {
                const serviceAccount = JSON.parse(serviceAccountKey);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            } else {
                admin.initializeApp();
            }
        }

        messaging = admin.messaging();
        console.log('✅ Firebase Cloud Messaging initialized');
    } catch (error) {
        console.warn('⚠️  FCM not available:', error);
        console.log('   Notifications will be disabled');
    }
}

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

/**
 * Send notification to a specific device token
 */
export async function sendNotification(
    token: string,
    payload: NotificationPayload
): Promise<void> {
    if (!messaging) {
        console.warn('FCM not initialized - notification not sent');
        return;
    }

    try {
        await messaging.send({
            token,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
        });
        console.log('📬 Notification sent to token:', token.substring(0, 10) + '...');
    } catch (error: any) {
        console.error('FCM send error:', error.message);
    }
}

/**
 * Send notification to multiple devices
 */
export async function sendToMultipleDevices(
    tokens: string[],
    payload: NotificationPayload
): Promise<void> {
    if (!messaging || tokens.length === 0) return;

    try {
        await messaging.sendEachForMulticast({
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
        });
        console.log(`📬 Notification sent to ${tokens.length} devices`);
    } catch (error: any) {
        console.error('FCM multicast error:', error.message);
    }
}

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminder(
    token: string,
    doctorName: string,
    appointmentTime: string
): Promise<void> {
    await sendNotification(token, {
        title: 'Appointment Reminder',
        body: `You have an appointment with Dr. ${doctorName} at ${appointmentTime}`,
        data: {
            type: 'appointment-reminder',
            time: appointmentTime,
        },
    });
}

/**
 * Send prescription alert notification
 */
export async function sendPrescriptionAlert(
    token: string,
    medicationName: string
): Promise<void> {
    await sendNotification(token, {
        title: 'Prescription Ready',
        body: `Your prescription for ${medicationName} is ready for pickup`,
        data: {
            type: 'prescription-alert',
        },
    });
}

/**
 * Send follow-up reminder notification
 */
export async function sendFollowUpReminder(
    token: string,
    doctorName: string,
    dueDate: string
): Promise<void> {
    await sendNotification(token, {
        title: 'Follow-up Reminder',
        body: `Time to schedule your follow-up with Dr. ${doctorName} (due ${dueDate})`,
        data: {
            type: 'follow-up-reminder',
            dueDate,
        },
    });
}

export { messaging };
