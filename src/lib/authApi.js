import { notification } from "antd";
import { doc, getDoc, getDocs, setDoc, collection, query, where } from "firebase/firestore";

const { auth, db } = require("@/config/firebase");
const { signOut, updateEmail } = require("firebase/auth");

// Logout user
const logout = async () => {
  await signOut(auth)
    .then(() => console.log("logout"))
    .catch((e) => console.log("error", e));
};

const updateProfile = async (email, data) => {
  const userRef = doc(db, "users", id);
  const res = await getDoc(userRef);
  if (res.data().email === data.email) {
    await setDoc(userRef, data, { merge: true });
    notification.open({
      type: "success",
      message: "Profile updated successfully",
      placement: "top",
    });
    return data;
  } else {
    console.log("auth.currentUser", auth.currentUser);
    updateEmail(auth.currentUser, data.email)
      .then(async () => {
        const ref = doc(db, "users", id);
        await setDoc(ref, data, { merge: true });
        return data;
      })
      .catch((e) => {
        notification.open({
          message: "Please login again to update profile!",
          type: "error",
          placement: "top",
        });
      });
  }
};

// get all orders
const getAllCustomers = async () => {
  const ref = collection(db, "customers");
  const res = await getDocs(ref);
  let docs = [];
  if (res.docs.length <= 0) {
    return [];
  } else {
    res.forEach((doc) => {
      docs.push({ ...doc.data(), id: doc.id });
    });
    return docs;
  }
};


//get SPA and check it's status and then decide either login them or not
const getSPA = async (email) => {
  // Assuming you have a "products" collection in your database
  const productsRef = collection(db, "businesses");
  // console.log("ID OF SPA USERS", userId)

  // Query for products with matching userId
  const querySnapshot = await getDocs(query(productsRef, where("email", "==", email)));

  const products = [];
  querySnapshot.forEach((doc) => {
    products.push({
      ...doc.data(),
      id: doc.id,
    });
  });

  return products
  // console.log("SPA", products[0].status)
  // if (products[0].status === "Active") {
  //   return { code: 1 }
  // } else if (products[0].status === "Decline") {
  //   return { code: 0 }

  // } else if (products[0].status === "Pending") {
  //   return { code: 2 }

  // }

};

const authApi = {
  logout,
  updateProfile,
  getAllCustomers, getSPA
};

export default authApi;
