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

// Add New Commission
const addCommission = async (data) => {
    console.log("data", data);
    const snapshot = collection(db, "Commission");
    // let q = query(snapshot, where("email", "==", data.email));
    // const CommissionExist = await getDocs(q);

    // if (CommissionExist.docs.length > 0) {
    //   return {
    //     message: "Commission already exist!",
    //     code: 0,
    //   };
    // } else {
    const ref = doc(db, "Commission", uuidv4());
    await setDoc(ref, data, { merge: true });
    const getRef = doc(db, "Commission", ref?.id);
    const res = await getDoc(getRef);
    return res.data()
        ? {
            data: { ...res.data(), id: res.id },
            message: "Commission added successfully!",
            code: 1,
        }
        : {
            message: "Something went wrong!",
            code: 0,
        };
    // }
    // return CommissionExist
};

// Get Single Commission By Id
// const getCommission = async (id) => {
// };

// Get All Commission
const getCommission = async () => {
    const ref = collection(db, "Commission");
    console.log("status", status);

    let res;

    res = await getDocs(ref);


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



const getAllCommission = async () => {
    const ref = collection(db, "Commission");


    const res = await getDocs(ref);


    let docs = [];

    if (res.docs.length <= 0) {
        console.log("API NOT CALLING", docs)

        return [];
    } else {
        console.log("API CALIINg", docs)

        res.forEach((doc) => {
            docs.push({
                ...doc.data(),
                id: doc.id,
                createdAt: doc?.data()?.createdAt?.toDate()?.toString(),
            });
        });

        console.log("API DOCS", docs)
        return docs;
    }
};


// Update Commission
const updateCommission = async (id, Commission) => {
    console.log("Commission in api", Commission);
    console.log("ID in api", id);
    const ref = doc(db, "Commission", id);
    await setDoc(ref, Commission, { merge: true });
    return {
        ...Commission,
        id,
    };
};

// Delete Commission
const deleteCommission = async (id) => {
    console.log("DELETED", id)
    const ref = doc(db, "Commission", id);
    await deleteDoc(ref);
    console.log("DELETED")
    return id;
};

// Update Commission Status
const activateCommission = async (Commission) => {
    const data = {
        id: Commission.key,
        name: Commission.name,
        isEnabled: true,
    };
    const ref = doc(db, "Commission", Commission.key);
    await setDoc(ref, data, { merge: true });
    return data;
};
// Update Commission Status
const deActivateCommission = async (Commission) => {
    const data = {
        id: Commission.key,
        name: Commission.name,
        isEnabled: false,
    };
    const ref = doc(db, "Commission", data.id);
    await setDoc(ref, data, { merge: true });
    return data;
};

const CommissionApi = {
    addCommission,
    getCommission,
    updateCommission,
    activateCommission,
    deActivateCommission,
    deleteCommission,
    getAllCommission
};

export default CommissionApi;
