// Adds dummy members (Auth user + users/{uid} + profiles/{uid}) to the matrimony Firebase project for testing.
//
//   npm run seed:matrimony          asks for the key file path, then creates / refreshes the dummy members
//   npm run seed:matrimony:clear    asks for the key file path, then deletes them again
//   (the path can also be passed as an argument or via GOOGLE_APPLICATION_CREDENTIALS)
//
// The key file: Firebase console → Project settings → Service accounts → Generate new private key.
// Keep it OUTSIDE the repo (it gives full access to the project). The path can also come from
// the GOOGLE_APPLICATION_CREDENTIALS environment variable.
//
// Dummy members have uid "seed-01" … "seed-10" and email "seed01@example.test", password "Test@1234",
// so you can sign in as any of them. --clear removes exactly those uids and nothing else.

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const args = process.argv.slice(2);
const flag = args.find((a) => a.startsWith('--'));
let keyPath = args.find((a) => !a.startsWith('--')) ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!keyPath) {
  // No path given: ask for it. Pasting from "Copy as path" works (the surrounding quotes are removed).
  if (!process.stdin.isTTY) {
    console.error('No key file given. Run: npm run seed:matrimony');
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  keyPath = await rl.question('Paste the path of the service-account key file and press Enter:\n> ');
  rl.close();
}
keyPath = keyPath.trim().replace(/^["']|["']$/g, '');

let key;
try {
  key = JSON.parse(readFileSync(keyPath, 'utf8'));
} catch (e) {
  console.error(`\n✖ Could not read the key file "${keyPath}": ${e.message}`);
  process.exit(1);
}
if (!key.private_key || !key.project_id) {
  console.error('\n✖ That file is not a service-account key (no private_key / project_id).');
  process.exit(1);
}
initializeApp({ credential: cert(key) });
const auth = getAuth();
const db = getFirestore();
console.log(`Project: ${key.project_id}`);

const PASSWORD = 'Test@1234';

// name, gender, age, maritalStatus, heightCm, religion, motherTongue, education, occupation, city, state, about
const PEOPLE = [
  ['Arjun Das', 'male', 28, 'never-married', 175, 'Hindu', 'Bengali', 'Post graduate', 'Software engineer', 'Kolkata', 'West Bengal', 'Enjoys cricket and travelling.'],
  ['Riya Sen', 'female', 25, 'never-married', 160, 'Hindu', 'Bengali', 'Graduate', 'Teacher', 'Howrah', 'West Bengal', 'Loves music and cooking.'],
  ['Sourav Ghosh', 'male', 31, 'divorced', 170, 'Hindu', 'Bengali', 'Graduate', 'Businessman', 'Siliguri', 'West Bengal', 'Family-oriented and calm.'],
  ['Ananya Roy', 'female', 27, 'never-married', 158, 'Hindu', 'Bengali', 'Post graduate', 'Doctor', 'Durgapur', 'West Bengal', 'Works at a district hospital.'],
  ['Imran Khan', 'male', 30, 'never-married', 178, 'Muslim', 'Urdu', 'Graduate', 'Civil engineer', 'Kolkata', 'West Bengal', 'Likes football and photography.'],
  ['Farhana Begum', 'female', 26, 'never-married', 162, 'Muslim', 'Bengali', 'Post graduate', 'Bank officer', 'Asansol', 'West Bengal', 'Reads a lot and enjoys travel.'],
  ['Rahul Sharma', 'male', 33, 'never-married', 180, 'Hindu', 'Hindi', 'Post graduate', 'Chartered accountant', 'Delhi', 'Delhi', 'Fitness enthusiast.'],
  ['Priya Verma', 'female', 29, 'widowed', 165, 'Hindu', 'Hindi', 'Graduate', 'Designer', 'Lucknow', 'Uttar Pradesh', 'Independent and creative.'],
  ['Joseph Mathew', 'male', 32, 'never-married', 176, 'Christian', 'English', 'Graduate', 'Marketing manager', 'Bengaluru', 'Karnataka', 'Plays guitar on weekends.'],
  ['Simran Kaur', 'female', 24, 'never-married', 163, 'Sikh', 'Hindi', 'Graduate', 'Nurse', 'Chandigarh', 'Punjab', 'Friendly and caring.'],
];

const uidOf = (i) => `seed-${String(i + 1).padStart(2, '0')}`;
const emailOf = (i) => `seed${String(i + 1).padStart(2, '0')}@example.test`;
const dobFor = (age) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age, 0, 15);
  return d.toISOString().slice(0, 10);
};

if (flag === '--clear') {
  for (let i = 0; i < PEOPLE.length; i++) {
    const uid = uidOf(i);
    await auth.deleteUser(uid).catch((e) => e.code !== 'auth/user-not-found' && Promise.reject(e));
    await db.doc(`profiles/${uid}`).delete();
    await db.doc(`users/${uid}`).delete();
  }
  console.log(`Deleted ${PEOPLE.length} dummy members.`);
  process.exit(0);
}

for (const [i, p] of PEOPLE.entries()) {
  const [name, gender, age, maritalStatus, heightCm, religion, motherTongue, education, occupation, city, state, about] = p;
  const uid = uidOf(i);
  const email = emailOf(i);

  const authUser = { uid, email, password: PASSWORD, displayName: name, emailVerified: true };
  await auth.createUser(authUser).catch(async (e) => {
    if (e.code !== 'auth/uid-already-exists' && e.code !== 'auth/email-already-exists') throw e;
    await auth.updateUser(uid, authUser);
  });

  await db.doc(`users/${uid}`).set({
    uid,
    email,
    displayName: name,
    photoURL: null,
    phone: null,
    authProvider: 'password',
    profileId: uid,
    profileCompleted: true,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    lastLoginAt: FieldValue.serverTimestamp(),
  });

  await db.doc(`profiles/${uid}`).set({
    ownerUid: uid,
    createdFor: 'self',
    name,
    gender,
    dob: dobFor(age),
    age,
    maritalStatus,
    heightCm,
    religion,
    motherTongue,
    education,
    occupation,
    city,
    state,
    country: 'India',
    about,
    status: 'approved',
    visibility: 'registered',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`  ${uid}  ${email}  ${name}`);
}
console.log(`\nDone. Sign in as any of them with password "${PASSWORD}". Remove them with --clear.`);
