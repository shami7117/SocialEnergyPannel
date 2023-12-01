import { db } from "../../Firebase/firebase";
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

// Add New Seller
const addSeller = async (data) => {
  console.log("data", data);
  const snapshot = collection(db, "Sellers");
  let q = query(snapshot, where("email", "==", data.email));
  const SellerExist = await getDocs(q);

  if (SellerExist.docs.length > 0) {
    return {
      message: "Seller already exist!",
      code: 0,
    };
  } else {
    const ref = doc(db, "Sellers", uuidv4());
    await setDoc(ref, data, { merge: true });
    const getRef = doc(db, "Sellers", ref?.id);
    const res = await getDoc(getRef);
    return res.data()
      ? {
        data: { ...res.data(), id: res.id },
        message: "Seller added successfully!",
        code: 1,
      }
      : {
        message: "Something went wrong!",
        code: 0,
      };
  }
  // return SellerExist
};

// Get Single Seller By Id
// const getSeller = async (id) => {
// };

// Get All Sellers
const getSellers = async () => {
  const ref = collection(db, "Sellers");
  const res = await getDocs(ref);
  let docs = [];
  if (res.docs.length <= 0) {
    return [];
  } else {
    res.forEach((doc) => {
      docs.push({ ...doc.data(), id: doc.id });
    });
    console.log(docs)
    return docs;
  }
};

// Update Seller
const updateSeller = async (id, Seller) => {
  console.log("Seller in api", Seller);
  console.log("ID in api", id);
  const ref = doc(db, "Sellers", id);
  await setDoc(ref, Seller, { merge: true });
  return {
    ...Seller,
    id,
  };
};
const updateSellerExpiryDate = async (id, newExpiryDate) => {
  console.log("API ID", id, "API DATE", newExpiryDate)
  const ref = doc(db, "Sellers", id);
  await setDoc(ref, { expiryDate: newExpiryDate }, { merge: true });

  // Fetch the updated Seller object if needed
  const snapshot = await getDoc(ref);
  const updatedSeller = { ...snapshot.data(), id: snapshot.id };

  return updatedSeller;
};

// Delete Seller
const deleteSeller = async (id) => {
  console.log("DELETED", id)
  const ref = doc(db, "Sellers", id);
  await deleteDoc(ref);
  console.log("DELETED")
  return id;
};

// Update Seller Status
const activateSeller = async (Seller) => {
  const data = {
    id: Seller.key,
    name: Seller.name,
    isEnabled: true,
  };
  const ref = doc(db, "Sellers", Seller.key);
  await setDoc(ref, data, { merge: true });
  return data;
};
// Update Seller Status
const deActivateSeller = async (Seller) => {
  const data = {
    id: Seller.key,
    name: Seller.name,
    isEnabled: false,
  };
  const ref = doc(db, "Sellers", data.id);
  await setDoc(ref, data, { merge: true });
  return data;
};

const getUserByUserId = async (userId) => {
  const ref = collection(db, "Sellers");
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

const SellerApi = {
  addSeller,
  getSellers,
  updateSeller,
  getUserByUserId,
  activateSeller,
  deActivateSeller,
  deleteSeller, updateSellerExpiryDate
};

export default SellerApi;
