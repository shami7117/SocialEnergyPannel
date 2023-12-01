import { db } from "../../Firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where, updateDoc, limit, startAfter, orderBy, FieldPath
} from "firebase/firestore";
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";
import PromoApi from "./promo";

const promos = await PromoApi.getAllPromoCodes();
// Add New Product
const addProduct = async (data) => {
  console.log("data", data);
  const snapshot = collection(db, "Products");
  // let q = query(snapshot, where("email", "==", data.email));
  // const ProductExist = await getDocs(q);

  // if (ProductExist.docs.length > 0) {
  //   return {
  //     message: "Product already exist!",
  //     code: 0,
  //   };
  // } else {
  const ref = doc(db, "Products", uuidv4());
  await setDoc(ref, data, { merge: true });
  const getRef = doc(db, "Products", ref?.id);
  const res = await getDoc(getRef);
  return res.data()
    ? {
      data: { ...res.data(), id: res.id },
      message: "Product added successfully!",
      code: 1,
    }
    : {
      message: "Something went wrong!",
      code: 0,
    };
  // }
  // return ProductExist
};

// Get Single Product By Id
// const getProduct = async (id) => {
// };

// Get CategoryWise Products
// Function to calculate the distance between two coordinates using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  return distance;
}
// Define nearCountries outside of the axios callback function

// Make a request to the REST Countries API to get a list of all countries


const getCategoryWiseProducts = async (filters, page, countries, selectedCategory) => {
  const ref = collection(db, "Products");
  console.log("FILTERS in APi", filters);
  console.log("PAGE NUMBER", page);
  console.log("COUNTIRES IN API", countries);

  let res;
  const pageSize = 12; // Number of products per page

  // Initialize the query without any filters
  let q = ref;
  if (selectedCategory) {
    q = query(q, where("category", "==", selectedCategory));
  }
  if (filters) {
    // Add category filter if provided
    if (filters.category !== '') {
      if (countries && countries.length > 0) {
        q = query(q, where("category", "==", filters.category), where("country", "in", countries));
      } else {
        q = query(q, where("category", "==", filters.category));
      }
    }

    // Add country filter if provided
    if (filters.country !== '') {
      if (countries && countries.length > 0) {
        q = query(q, where("country", "in", countries));
      } else {
        q = query(q, where("country", "==", filters.country));
      }
    }

    if (filters.size !== '') {
      if (countries && countries.length > 0) {
        q = query(q, where("size", "==", filters.size), where("country", "in", countries));
      } else {
        q = query(q, where("size", "==", filters.size));
      }
    }

    // Add color filter if provided
    if (filters.color !== '') {
      if (countries && countries.length > 0) {
        q = query(q, where("color", "==", filters.color), where("country", "in", countries));
      } else {
        q = query(q, where("color", "==", filters.color));
      }
    }

    // Add minPrice and maxPrice filters if provided
    if (filters.minPrice !== '0') {
      if (countries && countries.length > 0) {
        q = query(q, where("price", ">=", filters.minPrice), where("country", "in", countries));
      } else {
        q = query(q, where("price", ">=", filters.minPrice));
      }
    }

    if (filters.maxPrice !== '0') {
      if (countries && countries.length > 0) {
        q = query(q, where("price", "<=", filters.maxPrice), where("country", "in", countries));
      } else {
        q = query(q, where("price", "<=", filters.maxPrice));
      }
    }
  }

  // Determine the start point based on the page number
  if (page > 1) {
    const lastVisibleDoc = await getLastVisibleDoc(filters, page - 1);
    if (lastVisibleDoc) {
      if (countries && countries.length > 0) {
        q = query(q, where("country", "in", countries), startAfter(lastVisibleDoc));
      } else {
        q = query(q, startAfter(lastVisibleDoc));
      }
    }
  }

  // Limit the query to the page size
  if (countries && countries.length > 0) {
    q = query(q, where("country", "in", countries), limit(pageSize));
  } else {
    q = query(q, limit(pageSize));
    "FETCH WITOUHT COUNTRY"
  }

  // Execute the query with filters and pagination
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

    const promoObj = {};

    promos?.forEach((pr) => {
      pr?.PRODUCT_IDs.forEach((pid) => {
        promoObj[pid] = pr;
      });
    });

    const newData = docs?.map((data) => {
      const promoDetails = promoObj[data?.id] || {};
      console.log({ data });
      console.log({ promoDetails });
      return {
        ...data,
        promoData: promoDetails,
      };
    });
    console.log("PRICE CHANGE IN API", newData)
    return newData;
  }
};


const getCategoryWiseProductsById = async (filters, page, productIds, countries) => {
  const ref = collection(db, "Products");
  console.log("FILTERS", filters);
  console.log("PAGE NUMBER", page);
  console.log("api ids", productIds);
  console.log("api countries", countries);

  let res;
  const pageSize = 24; // Number of products per page

  // Initialize the query without any filters
  let q = ref;
  if (!productIds) {
    return []; // Return an empty array or handle it as per your requirements
  }

  if (filters) {
    // Add category filter if provided
    if (filters.category !== '') {
      q = countries.length > 0 ? query(q, where("category", "==", filters.category), where("country", "in", countries)) : query(q, where("category", "==", filters.category));
    }

    // Add country filter if provided
    if (filters.country !== '') {
      q = query(q, where("country", "==", filters.country));
    }
    if (filters.size !== '') {
      q = countries.length > 0 ? query(q, where("size", "==", filters.size), where("country", "in", countries)) : query(q, where("size", "==", filters.size));
    }
    // Add color filter if provided
    if (filters.color !== '') {
      q = countries.length > 0 ? query(q, where("color", "==", filters.color), where("country", "in", countries)) : query(q, where("color", "==", filters.color));
    }

    // Add minPrice and maxPrice filters if provided
    if (filters.minPrice !== '0' && filters.maxPrice !== '0') {
      q = countries.length > 0 ?
        query(q, where("price", ">=", filters.minPrice), where("price", "<=", filters.maxPrice), where("country", "in", countries)) :
        query(q, where("price", ">=", filters.minPrice), where("price", "<=", filters.maxPrice));
    }
  }

  // Determine the start point based on the page number
  if (page > 1) {
    const lastVisibleDoc = await getLastVisibleDoc(filters, page - 1);
    if (lastVisibleDoc) {
      q = countries.length > 0 ? query(q, where("country", "in", countries), startAfter(lastVisibleDoc)) : query(q, startAfter(lastVisibleDoc));
    }
  }

  if (countries && countries.length > 0) {
    q = query(q, where("country", "in", countries), limit(pageSize));
  } else {
    q = query(q, limit(pageSize));
  }

  // Execute the query with filters and pagination
  res = await getDocs(q);

  let docs = [];
  if (res.docs.length <= 0) {
    return [];
  } else {
    res.forEach((doc) => {
      if (productIds.includes(doc.id)) { // Only push products with matching doc.id
        docs.push({
          ...doc.data(),
          id: doc.id,
          createdAt: doc?.data()?.createdAt?.toDate()?.toString(),
        });
      }
    });
    console.log("DOCS", docs);

    const promoObj = {}

    promos?.forEach((pr) => {
      pr?.PRODUCT_IDs.forEach((pid) => {
        promoObj[pid] = pr
      })
    })

    const newData = docs?.map((data) => {
      const promoDetails = promoObj[data?.id] || {}
      console.log({ data })
      console.log({ promoDetails })
      return {
        ...data,
        promoData: promoDetails
      }
    })

    return newData;
  }
};




// Custom filter function to filter documents by IDs
function filterByIds(ids) {
  return (doc) => ids.includes(doc.data().id); // Replace "id" with the actual field name representing the product ID
}






// Helper function to get the last visible document for pagination
const getLastVisibleDoc = async (filters, page) => {
  const pageSize = 40; // Number of products per page
  const ref = collection(db, "Products");

  let q = ref;

  if (filters) {
    // Apply filters if provided
    // ...

    // Adjust the start point for pagination
    if (page > 1) {
      q = query(q, limit(pageSize * page));
    } else {
      q = query(q, limit(pageSize));
    }

    const snapshot = await getDocs(q);

    if (snapshot.docs.length > 0) {
      return snapshot.docs[snapshot.docs.length - 1];
    }
  }

  return null;
};


// Get All Products
const getProducts = async (status) => {
  const ref = collection(db, "Products");
  console.log("status", status);

  let res;
  if (status !== null) {
    // Use the 'where' method to filter documents based on the status field
    const q = query(ref, where("status", "==", status));
    res = await getDocs(q);
  } else {
    res = await getDocs(ref);
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

// get popular

const getPopularProducts = async (country) => {
  const ref = collection(db, "Products");


  // Use the 'where' method to filter documents based on the queryField and queryValue
  const q = country ? query(ref, where("popular", "==", true), where("country", "==", country)) : query(ref, where("popular", "==", true))
  const res = await getDocs(q);


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

    const promoObj = {}

    promos?.forEach((pr) => {
      pr?.PRODUCT_IDs.forEach((pid) => {
        promoObj[pid] = pr
      })
    })

    const newData = docs?.map((data) => {
      const promoDetails = promoObj[data?.id] || {}
      console.log({ data })
      console.log({ promoDetails })
      return {
        ...data,
        promoData: promoDetails
      }
    })
    return newData;
  }
};


// get Featured

const getFeaturedProducts = async (country) => {
  const ref = collection(db, "Products");
  console.log({ country })

  // Use the 'where' method to filter documents based on the queryField and queryValue
  const q = country ? query(ref, where("featured", "==", true), where("country", "==", country)) : query(ref, where("featured", "==", true));
  const res = await getDocs(q);

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

    const promoObj = {}

    promos?.forEach((pr) => {
      pr?.PRODUCT_IDs.forEach((pid) => {
        promoObj[pid] = pr
      })
    })

    const newData = docs?.map((data) => {
      const promoDetails = promoObj[data?.id] || {}
      console.log({ data })
      console.log({ promoDetails })
      return {
        ...data,
        promoData: promoDetails
      }
    })

    console.log('newFeatured ', newData)

    return newData;
  }
};


// Get Single Product
const getProductById = async (productId) => {
  console.log("API ID", productId);
  const ref = doc(db, "Products", productId);

  try {
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("API data", data);

      // Use optional chaining to handle possible null or undefined values
      const promoObj = {}

      promos?.forEach((pr) => {
        pr?.PRODUCT_IDs.forEach((pid) => {
          promoObj[pid] = pr
        })
      })

      console.log({ promoObj })
      const promoDetails = promoObj[docSnap?.id] || {}

      return {
        ...data,
        promoData: promoDetails,
        id: docSnap.id,
        createdAt: data?.createdAt?.toDate()?.toString(),
      };
    } else {
      // Handle the case where the product with the given ID does not exist.
      return null;
    }
  } catch (error) {
    // Handle any errors that may occur during the retrieval.
    console.error("Error getting product by ID:", error);
    throw error;
  }
};



// Update Product
const updateProduct = async (id, Product) => {
  console.log("Product in api", Product);
  console.log("ID in api", id);
  const ref = doc(db, "Products", id);
  await setDoc(ref, Product, { merge: true });
  return {
    ...Product,
    id,
  };
};

// Delete Product
const deleteProduct = async (id) => {
  console.log("DELETED", id)
  const ref = doc(db, "Products", id);
  await deleteDoc(ref);
  console.log("DELETED")
  return id;
};

// Update Product Status
const activateProduct = async (Product) => {
  const data = {
    id: Product.key,
    name: Product.name,
    isEnabled: true,
  };
  const ref = doc(db, "Products", Product.key);
  await setDoc(ref, data, { merge: true });
  return data;
};
// Update Product Status
const deActivateProduct = async (Product) => {
  const data = {
    id: Product.key,
    name: Product.name,
    isEnabled: false,
  };
  const ref = doc(db, "Products", data.id);
  await setDoc(ref, data, { merge: true });
  return data;
};




// Update Cart
const updateHeart = async (id) => {
  const ref = doc(db, "Products", id);

  // Get the current document data
  const docSnapshot = await getDoc(ref);
  const currentData = docSnapshot.data();

  // Toggle the heartField value

  const updatedHeartField = !currentData?.isHeartFilled;
  console.log("UPDATED value", updatedHeartField)


  // Create the update data object
  const updateData = {
    isHeartFilled: updatedHeartField
  };

  await updateDoc(ref, updateData);

  return {
    id,
    ...updateData
  };
};




// Get All Products
const getProductsBySeller = async (status, sellerID) => {
  const ref = collection(db, "Products");
  console.log("status", status);
  console.log("sellerID", sellerID);

  let res;
  if (status !== null) {
    // Use the 'where' method to filter documents based on the status field
    const q = query(ref, where("status", "==", status), where("sellerId", "==", sellerID));
    res = await getDocs(q);
  } else {
    const q = query(ref, where("sellerId", "==", sellerID));

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

    const promoObj = {}

    promos?.forEach((pr) => {
      pr?.PRODUCT_IDs.forEach((pid) => {
        promoObj[pid] = pr
      })
    })

    const newData = docs?.map((data) => {
      const promoDetails = promoObj[data?.id] || {}
      console.log({ data })
      console.log({ promoDetails })
      return {
        ...data,
        promoData: promoDetails
      }
    })
    return newData;
  }
};


const getAllProducts = async (sellerID) => {
  const ref = collection(db, "Products");

  const q = query(ref, where("sellerId", "==", sellerID));

  const res = await getDocs(q);


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

    // const promoObj = {}

    // promos?.forEach((pr) => {
    //   pr?.PRODUCT_IDs.forEach((pid) => {
    //     promoObj[pid] = pr
    //   })
    // })

    // const newData = docs?.map((data) => {
    //   const promoDetails = promoObj[data?.id] || {}
    //   console.log({data})
    //   console.log({promoDetails})
    //   return {
    //     ...data,
    //     promoData: promoDetails
    //   }
    // })

    return docs;
  }
};

const ProductApi = {
  addProduct,
  getProducts,
  updateProduct,
  activateProduct,
  deActivateProduct,
  deleteProduct,
  getProductById,
  getPopularProducts,
  getFeaturedProducts,
  getCategoryWiseProducts,
  getCategoryWiseProductsById,
  updateHeart,
  getProductsBySeller,
  getAllProducts
};

export default ProductApi;
