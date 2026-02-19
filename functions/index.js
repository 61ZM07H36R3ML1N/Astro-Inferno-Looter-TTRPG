const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendSquadTelemetryAlert = onDocumentCreated("logs/{logId}", async (event) => {
    // In v2, the snapshot is tucked inside event.data
    const snap = event.data;
    if (!snap) return null;
    
    const logData = snap.data();

    // 1. FILTER: Only trigger lock-screen alerts for major events
    const criticalTypes = ['danger', 'boss', 'success']; 
    if (!criticalTypes.includes(logData.type)) {
        return null; 
    }

    const squadId = logData.squadId;
    let alertTitle = "SQUAD UPDATE";
    if (logData.type === 'danger') alertTitle = "⚠ FATAL ERROR";
    if (logData.type === 'boss') alertTitle = "🚨 THREAT DETECTED";
    if (logData.type === 'success') alertTitle = "🔥 HOT STREAK";

    try {
        // 2. IDENTIFY: Find all characters currently in this squad
        const rosterSnapshot = await admin.firestore()
            .collection('characters')
            .where('squadId', '==', squadId)
            .get();

        if (rosterSnapshot.empty) {
            console.log(`No operatives found in network: ${squadId}`);
            return null;
        }

        // Extract the unique User IDs of the players in this squad
        const playerUids = new Set();
        rosterSnapshot.forEach(doc => {
            if (doc.data().uid) playerUids.add(doc.data().uid);
        });

        // 3. ACQUIRE TOKENS: Look up the FCM tokens for those players
        const tokens = [];
        for (const uid of playerUids) {
            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            if (userDoc.exists && userDoc.data().fcmToken) {
                tokens.push(userDoc.data().fcmToken);
            }
        }

        if (tokens.length === 0) {
            console.log('No devices registered for Neural Link in this squad.');
            return null;
        }

        // 4. FIRE THE ORBITAL STRIKE (Send the Push Notification)
        const payload = {
            notification: {
                title: alertTitle,
                body: logData.message,
            },
            tokens: tokens
        };

        const response = await admin.messaging().sendMulticast(payload);
        console.log(`Telemetry sent. Success: ${response.successCount}, Failed: ${response.failureCount}`);
        
        return null;

    } catch (error) {
        console.error('Error broadcasting lock-screen telemetry:', error);
        return null;
    }
});