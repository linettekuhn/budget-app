import { auth, firestoreDb } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import DatabaseService from "./DatabaseService";

type Change = {
  id: number;
  tableName: string;
  rowUUID: string;
  action: string;
  payload: string;
  createdAt: string;
  synced: number;
};

export default class SyncService {
  static async sync() {
    await this.pushLocalChanges();
    await this.pullRemoteChanges();

    try {
      const now = new Date().toISOString();
      await DatabaseService.updateLastSyncDate(now);
    } catch (error) {
      console.error("Failed to update last sync date:", error);
    }
  }

  private static async pushLocalChanges() {
    const db = await DatabaseService.getDatabase();
    const user = auth.currentUser;

    if (user) {
      await db.execAsync("BEGIN TRANSACTION");
      try {
        const userId = user.uid;
        // get pending changes
        const pending = await db.getAllAsync<Change>(
          "SELECT * FROM pending_changes WHERE synced = 0 ORDER BY createdAt ASC"
        );

        for (const change of pending) {
          const { tableName, rowUUID, action, payload } = change;
          const ref = doc(
            firestoreDb,
            `users/${userId}/${tableName}/${rowUUID}`
          );

          // save if change created or updated
          if (action === "create" || action === "update") {
            const payloadData = JSON.parse(payload);

            // only add updatedAt timestamp if change is not soft deleted
            if (action === "update" && payloadData.deletedAt) {
              await setDoc(
                ref,
                { id: rowUUID, ...payloadData },
                { merge: true }
              );
            } else {
              await setDoc(
                ref,
                {
                  id: rowUUID,
                  ...payloadData,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            }
          }

          // soft delete if change deleted
          if (action === "delete") {
            await setDoc(
              ref,
              {
                id: rowUUID,
                deletedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }

          // update sync flag in pending_changes table
          await db.runAsync(
            "UPDATE pending_changes SET synced = 1 WHERE id = ?",
            [change.id]
          );
        }
        await db.execAsync("COMMIT");
      } catch (error) {
        await db.execAsync("ROLLBACK");
        console.error(`error getting ID token:`, error);
        throw error;
      }
    } else {
      console.log("cannot get user ID because no user is signed in");
    }
  }

  private static async pullRemoteChanges() {
    const db = await DatabaseService.getDatabase();
    const user = auth.currentUser;
    const tables = [
      "app_meta",
      "badges",
      "categories",
      "transactions",
      "recurring_transactions",
      "salary",
    ];

    interface LocalRow {
      id: string;
      updatedAt: string;
      deletedAt?: string | null;
      [id: string]: any;
    }

    if (user) {
      try {
        const userId = user.uid;
        const lastSyncedAt = await DatabaseService.getLastSyncDate();

        // for each table get firestore snapshot
        for (const table of tables) {
          // TODO: HERES THE ERROR
          // filter out docs updated before last synced
          const collectionRef = query(
            collection(firestoreDb, `users/${userId}/${table}`),
            where("updatedAt", ">", lastSyncedAt ?? "1970-01-01T00:00:00.000Z")
          );
          const snapshot = await getDocs(collectionRef);

          // loop through rows in table
          for (const doc of snapshot.docs) {
            // get remote data
            const remote = doc.data();
            const id = remote.id;

            // get local data
            const local = await db.getFirstAsync<LocalRow>(
              `SELECT * FROM ${table} WHERE id = ?`,
              [id]
            );

            if (!local) {
              // if doesnt exist locally insert row to database and not deleted
              if (!remote.deletedAt) {
                DatabaseService.insertFromSync(table, id, remote);
              }
            } else {
              // if its not the first sync
              if (lastSyncedAt) {
                // compare updatedAt times for local and remote doc
                const remoteLastUpdated = new Date(
                  remote.updatedAt || 0
                ).getTime();
                const localLastUpdated = new Date(local.updatedAt).getTime();

                // most recent record wins
                if (remoteLastUpdated > localLastUpdated) {
                  if (remote.deletedAt) {
                    // soft delete row from database
                    DatabaseService.deleteFromSync(table, id);
                  } else {
                    // update row in database
                    DatabaseService.updateFromSync(table, id, remote);
                  }
                }
              } else {
                if (remote.deletedAt) {
                  // soft delete row from database
                  DatabaseService.deleteFromSync(table, id);
                } else {
                  // update row in database
                  DatabaseService.updateFromSync(table, id, remote);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`error getting ID token:`, error);
        throw error;
      }
    } else {
      console.log("cannot get user ID because no user is signed in");
    }
  }
}
