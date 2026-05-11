import { collection, query, orderBy, onSnapshot, addDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { InterviewSession, InterviewQuestion } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {}, // Simplified for brevity in this helper, but ideally would include auth state
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function subscribeToHistory(userId: string, callback: (history: InterviewSession[]) => void, onError?: (error: any) => void) {
  const path = `users/${userId}/sessions`;
  const q = query(collection(db, path), orderBy('date', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const history = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date?.toDate() || new Date(),
      } as InterviewSession;
    });
    callback(history);
  }, (error) => {
    console.error("History Subscription Error:", error);
    if (onError) onError(error);
  });
}

export async function saveSession(userId: string, session: Omit<InterviewSession, 'id'>) {
  const path = `users/${userId}/sessions`;
  try {
    const sessionId = Math.random().toString(36).substring(7); // Or use auto ID
    const docRef = doc(db, path, sessionId);
    await setDoc(docRef, {
      ...session,
      date: serverTimestamp(),
    });
    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
