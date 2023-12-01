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

// Add New Package
const addPackage = async (data) => {
    console.log("data", data);
    const snapshot = collection(db, "Packages");
    let q = query(snapshot, where("month", "==", data.month), where("type", "==", data.type));
    const PackageExist = await getDocs(q);

    if (PackageExist.docs.length > 0) {
        return {
            message: "Package already exist!",
            code: 0,
        };
    } else {
        const ref = doc(db, "Packages", uuidv4());
        await setDoc(ref, data, { merge: true });
        const getRef = doc(db, "Packages", ref?.id);
        const res = await getDoc(getRef);
        return res.data()
            ? {
                data: { ...res.data(), id: res.id },
                message: "Package added successfully!",
                code: 1,
            }
            : {
                message: "Something went wrong!",
                code: 0,
            };
    }
    // return PackageExist
};

// Get Single Package By Id
// const getPackage = async (id) => {
// };

// Get All Packages
const getPackage = async (couponValue) => {
    const ref = collection(db, "Packages");
    const res = await getDocs(ref);
    let docs = [];

    if (res.docs.length <= 0) {
        return [];
    } else {
        res.forEach((doc) => {
            const data = doc.data();



            if (data.Package === couponValue) {
                console.log("CHECKING OF VALUE ARE SAME")
                docs.push({ ...data, id: doc.id });
            }

        });
        // console.log("API DATA", docs);
        return docs;
    }
};
const getPackageByType = async (type) => {
    const ref = collection(db, "Packages");

    let q = query(ref, where("type", "==", type));

    const res = await getDocs(q);
    let docs = [];

    if (res.docs.length <= 0) {
        return [];
    } else {
        res.forEach((doc) => {
            const data = doc.data();




            docs.push({ ...data, id: doc.id });


        });
        // console.log("API DATA", docs);
        return docs;
    }
};


const getPackageById = async (SellerId) => {
    const ref = collection(db, "Packages");
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



// Update Package
const updatePackage = async (id, Package) => {
    console.log("Package in api", Package);
    console.log("ID in api", id);
    const ref = doc(db, "Packages", id);
    await setDoc(ref, Package, { merge: true });
    return {
        ...Package,
        id,
    };
};

// Delete Package
const deletePackage = async (id) => {
    console.log("DELETED", id)
    const ref = doc(db, "Packages", id);
    await deleteDoc(ref);
    console.log("DELETED")
    return id;
};

// Update Package Status
const activatePackage = async (Package) => {
    const data = {
        id: Package.key,
        name: Package.name,
        isEnabled: true,
    };
    const ref = doc(db, "Packages", Package.key);
    await setDoc(ref, data, { merge: true });
    return data;
};
// Update Package Status
const deActivatePackage = async (Package) => {
    const data = {
        id: Package.key,
        name: Package.name,
        isEnabled: false,
    };
    const ref = doc(db, "Packages", data.id);
    await setDoc(ref, data, { merge: true });
    return data;
};


const getAllPackagess = async () => {
    const ref = collection(db, "Packages");
    const res = await getDocs(ref);
    let Packagess = [];

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

            // Add the productIds array to the Package code data
            Packagess.push({ ...data, id: doc.id, PRODUCT_IDs: productIds });
        });

        console.log("All Package Codes", Packagess);

        return Packagess;
    }
};


const getAllPackagesIds = async () => {
    const ref = collection(db, "Packages");
    const res = await getDocs(ref);
    let Packagess = [];

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



            // Add the productIds array to the Package code data
            Packagess.push({ ...data, id: doc.id, PRODUCT_IDs: productIds });
        });

        console.log("All Package Codes", Packagess);

        return Packagess;
    }
};


const PackageApi = {
    addPackage,
    getPackage,
    updatePackage,
    activatePackage,
    deActivatePackage,
    deletePackage, getPackageById,
    getAllPackagess,
    getAllPackagesIds, getPackageByType
};

export default PackageApi;
