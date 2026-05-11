import { collection, query, orderBy, onSnapshot, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { InterviewSession } from '../types';

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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function subscribeToHistory(userId: string, callback: (history: InterviewSession[]) => void) {
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
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function saveSession(userId: string, session: Omit<InterviewSession, 'id'>) {
  const path = `users/${userId}/sessions`;
  try {
    const sessionId = Math.random().toString(36).substring(7);
    const docRef = doc(db, path, sessionId);
    await setDoc(docRef, {
      ...session,
      date: serverTimestamp(),
    });
    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
