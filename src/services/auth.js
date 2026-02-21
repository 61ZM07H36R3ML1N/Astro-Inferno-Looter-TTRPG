import { db, auth } from '../firebase/config';
    import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
    
    export const syncUserToFirestore = async (user) => {
      if (!user) return;
    
      const sessionId = crypto.randomUUID();
      const userRef = doc(db, "users", user.uid);
    
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        activeSessionId: sessionId,
        lastLogin: serverTimestamp(),
      }, { merge: true });
    
      onSnapshot(userRef, (snapshot) => {
        const data = snapshot.data();
        if (data && data.activeSessionId !== sessionId) {
          alert("This account has logged in from another device/tab. Disconnecting...");
          auth.signOut();
        }
      });
    };
