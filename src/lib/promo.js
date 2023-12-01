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

// Add New Promo
const addPromo = async (data) => {
    console.log("data", data);
    const snapshot = collection(db, "PromoCode");
    let q = query(snapshot, where("promo", "==", data.promo));
    const PromoExist = await getDocs(q);

    if (PromoExist.docs.length > 0) {
        return {
            message: "Promo already exist!",
            code: 0,
        };
    } else {
        const ref = doc(db, "PromoCode", uuidv4());
        await setDoc(ref, data, { merge: true });
        const getRef = doc(db, "PromoCode", ref?.id);
        const res = await getDoc(getRef);
        return res.data()
            ? {
                data: { ...res.data(), id: res.id },
                message: "Promo added successfully!",
                code: 1,
            }
            : {
                message: "Something went wrong!",
                code: 0,
            };
    }
    // return PromoExist
};

// Get Single Promo By Id
// const getPromo = async (id) => {
// };

// Get All Promos
const getPromo = async (couponValue) => {
    const ref = collection(db, "PromoCode");
    const res = await getDocs(ref);
    let docs = [];

    if (res.docs.length <= 0) {
        return [];
    } else {
        res.forEach((doc) => {
            const data = doc.data();



            if (data.promo === couponValue) {
                console.log("CHECKING OF VALUE ARE SAME")
                docs.push({ ...data, id: doc.id });
            }

        });
        // console.log("API DATA", docs);
        return docs;
    }
};
const getPromoById = async (SellerId) => {
    const ref = collection(db, "PromoCode");
    const res = await getDocs(ref);
    let docs = [];

    if (res.docs.length <= 0) {
        return [];
    } else {
        res.forEach((doc) => {
            const data = doc.data();



            if (data.sellerId === SellerId) {
                console.log("CHECKING OF VALUE ARE SAME")
                docs.push({ ...data, id: doc.id });
            }

        });
        console.log("API DATA", docs);
        return docs;
    }
};



// Update Promo
const updatePromo = async (id, Promo) => {
    console.log("Promo in api", Promo);
    console.log("ID in api", id);
    const ref = doc(db, "PromoCode", id);
    await setDoc(ref, Promo, { merge: true });
    return {
        ...Promo,
        id,
    };
};

// Delete Promo
const deletePromo = async (id) => {
    console.log("DELETED", id)
    const ref = doc(db, "PromoCode", id);
    await deleteDoc(ref);
    console.log("DELETED")
    return id;
};

// Update Promo Status
const activatePromo = async (Promo) => {
    const data = {
        id: Promo.key,
        name: Promo.name,
        isEnabled: true,
    };
    const ref = doc(db, "PromoCode", Promo.key);
    await setDoc(ref, data, { merge: true });
    return data;
};
// Update Promo Status
const deActivatePromo = async (Promo) => {
    const data = {
        id: Promo.key,
        name: Promo.name,
        isEnabled: false,
    };
    const ref = doc(db, "PromoCode", data.id);
    await setDoc(ref, data, { merge: true });
    return data;
};


const getAllPromoCodes = async () => {
    const ref = collection(db, "PromoCode");
    const res = await getDocs(ref);
    let promoCodes = [];

    if (res.docs.length <= 0) {
        console.log("All NOT WORKING");
        return [];
    } else {
        res.forEach((doc) => {
            const data = doc.data();
            const productIds = [];

            // Assuming products is an array of objects with a name and id field
            if (data.products && Array.isArray(data.products)) {
                data.products.forEach((product) => {
                    // Assuming product name and id are concatenated as "name_id"
                    const parts = product.split(",");
                    if (parts.length === 2) {
                        const productId = parts[1];
                        productIds.push(productId);
                    }
                });
            }

            // Add the productIds array to the promo code data
            promoCodes.push({ ...data, id: doc.id, PRODUCT_IDs: productIds });
        });

        console.log("All Promo Codes", promoCodes);

        return promoCodes;
    }
};


const getAllPromoCodeIds = async () => {
    const ref = collection(db, "PromoCode");
    const res = await getDocs(ref);
    let promoCodes = [];

    if (res.docs.length <= 0) {
        console.log("All NOT WORKING");
        return [];
    } else {
        res.forEach((doc) => {
            const data = doc.data();
            const productIds = [];
            const splitArray = [];
            // Assuming products is an array of objects with a name and id field
            if (data.products && Array.isArray(data.products)) {
                data.products.forEach((product) => {
                    // Assuming product is an object with name and id as properties
                    const { name, id } = product;
                    const parts = product.split(",");

                    // Assuming there are two parts (name and id)
                    if (parts.length === 2) {
                        const name = parts[0].trim(); // Trim to remove leading/trailing spaces
                        const id = parts[1].trim(); // Trim to remove leading/trailing spaces
                        productIds.push(id);

                    }


                });

            }



            // Add the productIds array to the promo code data
            promoCodes.push({ ...data, id: doc.id, PRODUCT_IDs: productIds });
        });

        console.log("All Promo Codes", promoCodes);

        return promoCodes;
    }
};


const PromoApi = {
    addPromo,
    getPromo,
    updatePromo,
    activatePromo,
    deActivatePromo,
    deletePromo, getPromoById,
    getAllPromoCodes,
    getAllPromoCodeIds
};

export default PromoApi;
