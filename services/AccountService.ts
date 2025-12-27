import { auth, firestoreDb } from "@/firebase/firebaseConfig";
import { sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

const subcollections = [
  "app_meta",
  "badges",
  "categories",
  "transactions",
  "recurring_transactions",
  "salary",
];

export class AccountService {
  static async deleteUserAccount() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const uid = user.uid;
    const userDoc = doc(firestoreDb, "users", uid);

    // delete each subcollection's docs
    for (const sub of subcollections) {
      const collectionRef = collection(firestoreDb, `users/${uid}/${sub}`);
      const snapshot = await getDocs(collectionRef);

      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }
    }

    // delete the user's doc
    await deleteDoc(userDoc);

    // delete firebase auth account
    await user.delete();
  }

  static async changeUserPassword(newPassword: string) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    await updatePassword(user, newPassword);
  }

  static async sendPasswordReset() {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No user logged in.");
    }
    await sendPasswordResetEmail(auth, user.email);
  }
}
