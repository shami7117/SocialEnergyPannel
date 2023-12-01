import { db } from "../config/firebase";
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

// Add New Business
const addBusiness = async (data) => {
    console.log("data", data);
    const snapshot = collection(db, "businesses");
    let q = query(snapshot, where("email", "==", data.email));

    const BusinessExist = await getDocs(q);

    if (BusinessExist.docs.length > 0) {
        return {
            message: "Business already exist!",
            code: 0,
        };
    } else {
        const ref = doc(db, "businesses", uuidv4());
        await setDoc(ref, data, { merge: true });
        const getRef = doc(db, "businesses", ref.id);
        const res = await getDoc(getRef);
        return res.data()
            ? {
                data: { ...res.data(), id: res.id },
                message: "Business added successfully!",
                code: 1,
            }
            : {
                message: "Something went wrong!",
                code: 0,
            };
    }
    // return BusinessExist
};

// Get Single Business By Id
// const getBusiness = async (id) => {
// };

// Get All businesses
const getBusinesses = async () => {
    const ref = collection(db, "businesses");
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




// Get Single Product By Id
const getSalonsByUserId = async (userId) => {
    console.log("User ID:", userId);


    const businessesRef = collection(db, "businesses");

    // Get all documents from the "businesses" collection
    const querySnapshot = await getDocs(businessesRef);
    console.log("BUSINESSES", querySnapshot)

    const businesses = [];
    querySnapshot.forEach((doc) => {
        // Compare each document ID with the userId
        if (doc.id === userId) {
            businesses.push({
                ...doc.data(),
                id: doc.id,
            });
        }
    });

    return businesses;

};



// Update Business
const updateBusiness = async (id, Business) => {
    console.log("Business in api", Business);
    const ref = doc(db, "businesses", id);
    await setDoc(ref, Business, { merge: true });
    console.log("DATA UPDATED with values", Business)
    return {
        ...Business,
        id,
    };
};

// Delete Business
const deleteBusiness = async (id) => {
    const ref = doc(db, "businesses", id);
    await deleteDoc(ref);
    console.log("DELETED")
    return id;
};

// Update Business Status
const activateBusiness = async (Business) => {
    const data = {
        id: Business.key,
        name: Business.name,
        isEnabled: true,
    };
    const ref = doc(db, "businesses", Business.key);
    await setDoc(ref, data, { merge: true });
    return data;
};
// Update Business Status
const deActivateBusiness = async (Business) => {
    const data = {
        id: Business.key,
        name: Business.name,
        isEnabled: false,
    };
    const ref = doc(db, "businesses", data.id);
    await setDoc(ref, data, { merge: true });
    return data;
};

const BusinessApi = {
    addBusiness,
    getBusinesses,
    updateBusiness,
    activateBusiness,
    deActivateBusiness,
    deleteBusiness,
    getSalonsByUserId
};

export default BusinessApi;
