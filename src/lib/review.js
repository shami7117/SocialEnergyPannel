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
const addReview = async (data) => {
    // Check if the user has already added a review for the product.
    const snapshot = collection(db, "Review");
    let q = query(snapshot, where("userId", "==", data.userId), where("productId", "==", data.productId));
    const ReviewExist = await getDocs(q);
  
    if (ReviewExist.docs.length > 0) {
      return {
        message: "You have already added a review for this product!",
        code: 0,
      };
    } else {
      // Add the review to the database.
      const ref = doc(db, "Review", uuidv4());
      await setDoc(ref, data, { merge: true });
  
      // Get the review data from the database.
      const getRef = doc(db, "Review", ref?.id);
      const res = await getDoc(getRef);
  
      return res.data()
        ? {
            data: { ...res.data(), id: res.id },
            message: "Review added successfully!",
            code: 1,
          }
        : {
            message: "Something went wrong!",
            code: 0,
          };
    }
  };
  
// get reviwe by product id
const getReviewsByProductId = async (productId) => {
    // Query the Review collection for all reviews with the given productId.
    console.log({productId})
    const snapshot = collection(db, "Review");
    let q = query(snapshot, where("productId", "==", productId));
    const reviews = await getDocs(q);
  
    // Get the user details for each review.
    const userIds = reviews?.docs.map((doc) => doc.data().userId);
    
    const users = [];
    for (const userId of userIds) {
        const userRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userRef);
      
        if (userDoc.exists()) {
          users.push({ id: userDoc.id, ...userDoc.data() });
        }
      }

    const sellers = [];
    for (const userId of userIds) {
        const userRef = doc(db, "Sellers", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          users.push({ id: userDoc.id, ...userDoc.data() });
        }
    }

    const allUsers = [...users, ...sellers]
    console.log({allUsers})

    let allReviews = [];
    
    // Merge the review and user details for each review.
    const reviewsWithUserDetails = reviews.docs.map((doc) => {
        console.log('userId',doc)
        const createTime = doc?.createTime?.toDate();
        // console.log({createTime})
      const user = allUsers.find((user) => user.id === doc.data().userId);
      console.log({user})
      allReviews.push({
        ...doc?.data(),
        user: user,
        // createdAt: createTime
      })
    });
    console.log({allReviews})
    // Return the reviews with user details.
    return allReviews;
  };

const ReviewApi = {
    addReview,
    getReviewsByProductId
};

export default ReviewApi;
