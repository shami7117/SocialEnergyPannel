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

// Add New ServiceCategory
const addServiceCategory = async (data) => {
    console.log("in add api", data);
    const snapshot = collection(db, "ServiceCategories");
    let q = query(snapshot, where("name", "==", data.name));
    const ServiceCategoryExist = await getDocs(q);

    if (ServiceCategoryExist.docs.length > 0) {
        return {
            message: "ServiceCategory already exist!",
            code: 0,
        };
    } else {
        const ref = doc(db, "ServiceCategories", uuidv4());
        await setDoc(ref, data, { merge: true });
        const getRef = doc(db, "ServiceCategories", ref?.id);
        const res = await getDoc(getRef);
        return res.data()
            ? {
                data: { ...res.data(), id: res.id },
                message: "ServiceCategory added successfully!",
                code: 1,
            }
            : {
                message: "Something went wrong!",
                code: 0,
            };
    }
    // return ServiceCategoryExist
};



// Get All ServiceCategories
const getServiceCategories = async () => {
    const ref = collection(db, "ServiceCategories");
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

// Update ServiceCategory
const updateServiceCategory = async (id, ServiceCategory) => {
    console.log("ServiceCategory in update api", ServiceCategory);
    const ref = doc(db, "ServiceCategories", id);
    await setDoc(ref, ServiceCategory, { merge: true });
    return {
        ...ServiceCategory,
        id,
    };
};

// Delete ServiceCategory
const deleteServiceCategory = async (id) => {
    const ref = doc(db, "ServiceCategories", id);
    await deleteDoc(ref);
    console.log("DELETED")
    return id;
};

// Update ServiceCategory Status
const activateServiceCategory = async (ServiceCategory) => {
    const data = {
        id: ServiceCategory.key,
        name: ServiceCategory.name,
        isEnabled: true,
    };
    const ref = doc(db, "ServiceCategories", ServiceCategory.key);
    await setDoc(ref, data, { merge: true });
    return data;
};
// Update ServiceCategory Status
const deActivateServiceCategory = async (ServiceCategory) => {
    const data = {
        id: ServiceCategory.key,
        name: ServiceCategory.name,
        isEnabled: false,
    };
    const ref = doc(db, "ServiceCategories", data.id);
    await setDoc(ref, data, { merge: true });
    return data;
};

const ServiceCategoryApi = {
    addServiceCategory,
    getServiceCategories,
    updateServiceCategory,
    activateServiceCategory,
    deActivateServiceCategory,
    deleteServiceCategory,

};

export default ServiceCategoryApi;
