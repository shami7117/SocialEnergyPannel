import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../Firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// Add New User
const addUser = async (data) => {
  console.log("data", data);
  const snapshot = collection(db, "Users");
  let q = query(snapshot, where("email", "==", data.email));
  const UserExist = await getDocs(q);

  if (UserExist.docs.length > 0) {
    return {
      message: "User already exist!",
      code: 0,
    };
  } else {
    const ref = doc(db, "Users", uuidv4());
    await setDoc(ref, data, { merge: true });
    const getRef = doc(db, "Users", ref?.id);
    const res = await getDoc(getRef);
    return res.data()
      ? {
          data: { ...res.data(), id: res.id },
          message: "User added successfully!",
          code: 1,
        }
      : {
          message: "Something went wrong!",
          code: 0,
        };
  }
  // return UserExist
};

// Get Single User By Id
// const getUser = async (id) => {
// };

// Get All Users
const getUsers = async () => {
  const ref = collection(db, "Users");
  const res = await getDocs(ref);
  let docs = [];
  if (res.docs.length <= 0) {
    return [];
  } else {
    res.forEach((doc) => {
      docs.push({ ...doc.data(), id: doc.id });
    });
    console.log(docs);
    return docs;
  }
};

// Update User
const updateUser = async (id, User) => {
  console.log("User in api", User);
  console.log("ID in api", id);
  const ref = doc(db, "Users", id);
  await setDoc(ref, User, { merge: true });
  return {
    ...User,
    id,
  };
};

// Delete User
const deleteUser = async (id) => {
  console.log("DELETED", id);
  const ref = doc(db, "Users", id);
  await deleteDoc(ref);
  console.log("DELETED");
  return id;
};

// Update User Status
const activateUser = async (User) => {
  const data = {
    id: User.key,
    name: User.name,
    isEnabled: true,
  };
  const ref = doc(db, "Users", User.key);
  await setDoc(ref, data, { merge: true });
  return data;
};
// Update User Status
const deActivateUser = async (User) => {
  const data = {
    id: User.key,
    name: User.name,
    isEnabled: false,
  };
  const ref = doc(db, "Users", data.id);
  await setDoc(ref, data, { merge: true });
  return data;
};


const getUserByUserId = async (userId) => {
  const ref = collection(db, "Users");
  const querySnapshot = await getDocs(ref);

  for (const doc of querySnapshot.docs) {
    if (doc.id === userId) {
      const userData = { ...doc.data(), id: doc.id };
      console.log(userData);
      return userData;
    }
  }

  return null; // No matching user found
};

const UserApi = {
  addUser,
  getUsers,
  updateUser,
  activateUser,
  deActivateUser,
  deleteUser,
  getUserByUserId,
};

export default UserApi;
