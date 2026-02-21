const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

// Boot up the Overseer Backend
admin.initializeApp();

exports.broadcastJamAlert = onDocumentCreated("logs/{logId}", async (event) => {
  const logData = event.data.data();

  // 1. FILTER: Only trigger for FATAL ERRORS (Weapon Jams)
  if (logData.type !== 'danger') return;

  const squadId = logData.squadId;
  const db = admin.firestore();

  try {
    // 2. QUERY: Find all characters linked to this squad
    const charsSnapshot = await db.collection("characters").where("squadId", "==", squadId).get();
    
    if (charsSnapshot.empty) {
        console.log("Abort: No active units found in sector.");
        return;
    }

    // Extract unique user IDs (UIDs) for the squad members
    const uids = new Set();
    charsSnapshot.forEach(doc => uids.add(doc.data().uid));

    // 3. TELEMETRY: Retrieve the Neural Link (FCM) tokens for those users
    const tokens = [];
    for (const uid of uids) {
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists && userDoc.data().fcmToken) {
        tokens.push(userDoc.data().fcmToken);
      }
    }

    if (tokens.length === 0) {
        console.log("Abort: No linked devices found for this squad.");
        return;
    }

    // 4. PAYLOAD: Construct the Lock-Screen Notification
    const payload = {
      tokens: tokens,
      notification: {
        title: "⚠️ CRITICAL JAM DETECTED",
        body: logData.message, // Example: "FATAL ERROR: UNIT_UNNAMED jammed their weapon!"
      },
      data: {
        squadId: squadId,
        alertType: "weapon_jam"
      }
    };

    // 5. DEPLOY: Fire the Push Notifications via Google/Apple servers
    const response = await admin.messaging().sendEachForMulticast(payload);
    console.log(`Neural Link Broadcast Complete: ${response.successCount} delivered, ${response.failureCount} failed.`);
    
  } catch (error) {
    console.error("CRITICAL FAILURE in Neural Link routing:", error);
  }
});