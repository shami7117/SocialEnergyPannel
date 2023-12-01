import { db } from "../../Firebase/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  Timestamp
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// get all orders
const getAllSellersOrders = async (userId) => {
  const ref = collection(db, "Orders");
  let res;
  // Use the 'where' method to filter documents based on the status field
  const q = query(ref, where("sellerIds", "array-contains", userId));
  res = await getDocs(q);

  let docs = [];

  if (res.docs.length <= 0) {
    return [];
  } else {
    res.forEach((doc) => {
      docs.push({
        ...doc.data(),
        id: doc.id,
        createdAt: doc?.data()?.createdAt?.toDate()?.toString(),
      });
    });
    return docs;
  }
};



const getAllBuyersOrders = async (userId) => {
  const ref = collection(db, "Orders");
  let res;
  // Use the 'where' method to filter documents based on the status field
  const q = query(ref, where("buyerId", "array-contains", userId));
  res = await getDocs(q);

  let docs = [];

  if (res.docs.length <= 0) {
    return [];
  } else {
    res.forEach((doc) => {
      docs.push({
        ...doc.data(),
        id: doc.id,
        createdAt: doc?.data()?.createdAt?.toDate()?.toString(),
      });
    });
    return docs;
  }
};

const getSellersOrders = async (userId, status) => {
  const ref = collection(db, "Orders");
  console.log("status", status);

  let res;
  if (status !== "All") {
    // Use the 'where' method to filter documents based on the status field
    const q = query(ref, where("status", "==", status), where("sellerIds", "array-contains", userId));
    res = await getDocs(q);
  } else {
    const q = query(ref, where("sellerIds", "array-contains", userId));

    res = await getDocs(q);
  }

  let docs = [];

  if (res.docs.length <= 0) {
    return [];
  } else {
    res.forEach((doc) => {
      docs.push({
        ...doc.data(),
        id: doc.id,
        createdAt: doc?.data()?.createdAt?.toDate()?.toString(),
      });
    });
    return docs;
  }
};

const getBuyersOrders = async (userId, status) => {
  const ref = collection(db, "Orders");
  console.log("status", status);

  let res;
  // if (status !== "All") {
    // Use the 'where' method to filter documents based on the status field
    const q = query(ref, where("status", "==", "New"), where("buyerId", "==", userId));
    console.log({q})
    res = await getDocs(q);
  // } else {
  //   res = await getDocs(ref);
  // }

  let docs = [];

  if (res.docs.length <= 0) {
    return [];
  } else {
    res.forEach((doc) => {
      docs.push({
        ...doc.data(),
        id: doc.id,
        createdAt: doc?.data()?.createdAt?.toDate()?.toString(),
      });
    });
    return docs;
  }
};




// Add New Order
const addOrder = async (data) => {
  console.log("data", data);
  const ordersCollection = collection(db, "Orders");
  let q = query(ordersCollection, where("id", "==", data.orderId));
  const OrderExist = await getDocs(q);

  if (OrderExist.docs.length > 0) {
    return {
      message: "Order already exists!",
      code: 0,
    };
  } else {
    // Generate a unique ID for the new order document
    const orderId = uuidv4();
    const orderRef = doc(ordersCollection, orderId);

    // Convert the orderDate to a JavaScript Date object
    const orderDate = new Date(data.date);

    // Check if orderDate is a valid date
    if (!isNaN(orderDate.getTime())) {
      // Create a Firestore Timestamp from the JavaScript Date object
      const orderDateTimestamp = Timestamp.fromDate(orderDate);

      // Update the data object with the valid timestamp
      data.date = orderDateTimestamp;

      // Set the document with the updated data
      await setDoc(orderRef, data);

      // Retrieve the newly added document
      const res = await getDoc(orderRef);

      console.log("API DATA", res.data(), "API ID", res.id);

      return res.data()
        ? {
          data: { ...res.data(), id: res.id },
          message: "Order added successfully!",
          code: 1,
        }
        : {
          message: "Something went wrong!",
          code: 0,
        };
    } else {
      return {
        message: "Invalid order date!",
        code: 0,
      };
    }
  }
};


// Update Order
const updateOrder = async (id, Order) => {
  console.log("Order in api", Order);
  console.log("ID in api", id);
  const ref = doc(db, "Orders", id);

  await setDoc(ref, { status: Order.status }, { merge: true });
  return {
    ...Order,
    id,

  };
}


// Delete Order
const deleteOrder = async (id) => {
  console.log("DELETED", id)
  const ref = doc(db, "Orders", id);
  await deleteDoc(ref);
  console.log("DELETED")
  return id;
};

const OrderApi = {

  getSellersOrders, addOrder, updateOrder, deleteOrder, getBuyersOrders, getAllBuyersOrders, getAllSellersOrders
};

export default OrderApi;
