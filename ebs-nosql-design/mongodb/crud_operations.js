// ============================================================
// E-Commerce Based System (EBS) — MongoDB CRUD Operations
// UCS3402 Database Management Systems
// SSN College of Engineering
// ============================================================

use("ebs");

// ────────────────────────────────────────────────────────────
// USERS COLLECTION
// ────────────────────────────────────────────────────────────

// Create
db.users.insertOne({
  name: "Aditya Raj",
  email: "aditya.raj@gmail.com",
  phone: "9876543210",
  password_hash: "$2b$10$hashedpassword",
  addresses: [
    {
      address_id: "ADDR01",
      line1: "42, Anna Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600040",
      is_default: true
    }
  ],
  created_at: new Date()
});

// Read
db.users.find({ email: "aditya.raj@gmail.com" });

// Update — add a new address
db.users.updateOne(
  { email: "aditya.raj@gmail.com" },
  {
    $push: {
      addresses: {
        address_id: "ADDR02",
        line1: "10, T Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600017",
        is_default: false
      }
    }
  }
);

// Delete
db.users.deleteOne({ email: "aditya.raj@gmail.com" });


// ────────────────────────────────────────────────────────────
// SELLERS COLLECTION
// ────────────────────────────────────────────────────────────

// Create
db.sellers.insertOne({
  business_name: "TechWorld Retail Pvt Ltd",
  email: "seller@techworld.in",
  phone: "9123456789",
  gst_number: "33AABCT1234F1Z5",
  rating: 4.7,
  joined_at: new Date("2023-06-01")
});

// Read
db.sellers.find({ rating: { $gte: 4.5 } });

// Update
db.sellers.updateOne(
  { email: "seller@techworld.in" },
  { $set: { rating: 4.8 } }
);

// Delete
db.sellers.deleteOne({ email: "seller@techworld.in" });


// ────────────────────────────────────────────────────────────
// CATEGORIES COLLECTION
// ────────────────────────────────────────────────────────────

// Create — root category
db.categories.insertOne({
  category_name: "Electronics",
  parent_id: null,
  description: "All electronic products"
});

// Create — child category
db.categories.insertOne({
  category_name: "Smartphones",
  parent_id: ObjectId("CAT001"),
  description: "Mobile phones and accessories"
});

// Read — all subcategories of Electronics
db.categories.find({ parent_id: ObjectId("CAT001") });

// Update
db.categories.updateOne(
  { category_name: "Smartphones" },
  { $set: { description: "Mobile phones, tablets, and accessories" } }
);

// Delete
db.categories.deleteOne({ category_name: "Smartphones" });


// ────────────────────────────────────────────────────────────
// PRODUCTS COLLECTION
// ────────────────────────────────────────────────────────────

// Create
db.products.insertOne({
  seller_id: ObjectId("SEL001"),
  category_id: ObjectId("CAT003"),
  name: "Samsung Galaxy S25",
  description: "Flagship Android smartphone with 50MP camera",
  price: 79999,
  discount: 10,
  stock_quantity: 150,
  images: [
    "https://cdn.ebs.com/s25_front.jpg",
    "https://cdn.ebs.com/s25_back.jpg"
  ],
  variants: [
    { variant_id: "V01", colour: "Phantom Black", storage: "128GB", additional_price: 0,    stock: 80 },
    { variant_id: "V02", colour: "Cream White",   storage: "256GB", additional_price: 5000, stock: 70 }
  ],
  specifications: {
    processor: "Snapdragon 8 Gen 4",
    ram: "8GB",
    battery: "4000mAh",
    display: "6.2 inch Dynamic AMOLED"
  },
  average_rating: 0,
  created_at: new Date()
});

// Read — by category
db.products.find({ category_id: ObjectId("CAT003") });

// Read — full-text search (requires text index on name)
db.products.find({ $text: { $search: "Samsung Galaxy" } });

// Update — atomically decrement stock (with oversell guard)
db.products.updateOne(
  { _id: ObjectId("PRD001"), stock_quantity: { $gt: 0 } },
  { $inc: { stock_quantity: -1 } }
);

// Update — update average rating
db.products.updateOne(
  { _id: ObjectId("PRD001") },
  { $set: { average_rating: 4.6 } }
);

// Delete
db.products.deleteOne({ _id: ObjectId("PRD001") });


// ────────────────────────────────────────────────────────────
// CART COLLECTION
// ────────────────────────────────────────────────────────────

// Create
db.cart.insertOne({
  user_id: ObjectId("USR001"),
  items: [],
  updated_at: new Date()
});

// Read — fetch cart for a user
db.cart.find({ user_id: ObjectId("USR001") });

// Update — add item to cart
db.cart.updateOne(
  { user_id: ObjectId("USR001") },
  {
    $push: {
      items: {
        product_id: ObjectId("PRD002"),
        quantity: 1,
        added_at: new Date()
      }
    },
    $set: { updated_at: new Date() }
  }
);

// Update — remove item from cart
db.cart.updateOne(
  { user_id: ObjectId("USR001") },
  { $pull: { items: { product_id: ObjectId("PRD002") } } }
);

// Delete — clear cart on checkout
db.cart.deleteOne({ user_id: ObjectId("USR001") });


// ────────────────────────────────────────────────────────────
// ORDERS COLLECTION
// ────────────────────────────────────────────────────────────

// Create
db.orders.insertOne({
  user_id: ObjectId("USR001"),
  order_items: [
    {
      item_id: "ITEM01",
      product_id: ObjectId("PRD001"),
      seller_id: ObjectId("SEL001"),
      product_name: "Samsung Galaxy S25 - Phantom Black 128GB",
      quantity: 1,
      unit_price: 79999
    }
  ],
  shipping_address: {
    line1: "42, Anna Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600040"
  },
  order_status: "Placed",
  total_amount: 79999,
  placed_at: new Date(),
  delivered_at: null
});

// Read — all pending orders for a user
db.orders.find({
  user_id: ObjectId("USR001"),
  order_status: { $ne: "Delivered" }
});

// Update — advance order status
db.orders.updateOne(
  { _id: ObjectId("ORD001") },
  { $set: { order_status: "Shipped" } }
);

// Update — mark as delivered
db.orders.updateOne(
  { _id: ObjectId("ORD001") },
  { $set: { order_status: "Delivered", delivered_at: new Date() } }
);

// Delete — remove cancelled order
db.orders.deleteOne({
  _id: ObjectId("ORD001"),
  order_status: "Cancelled"
});


// ────────────────────────────────────────────────────────────
// REVIEWS COLLECTION
// ────────────────────────────────────────────────────────────

// Create
db.reviews.insertOne({
  product_id: ObjectId("PRD001"),
  user_id: ObjectId("USR001"),
  rating: 5,
  title: "Excellent phone, fast delivery",
  body: "Smooth performance and great camera quality.",
  verified: true,
  created_at: new Date()
});

// Read — reviews for a product, newest first
db.reviews.find({ product_id: ObjectId("PRD001") }).sort({ created_at: -1 });

// Update — edit review
db.reviews.updateOne(
  { _id: ObjectId("REV001") },
  { $set: { rating: 4, body: "Updated: good but battery drains fast." } }
);

// Delete
db.reviews.deleteOne({ _id: ObjectId("REV001") });


// ────────────────────────────────────────────────────────────
// PAYMENTS COLLECTION
// ────────────────────────────────────────────────────────────

// Create
db.payments.insertOne({
  order_id: ObjectId("ORD001"),
  user_id: ObjectId("USR001"),
  amount: 79999,
  method: "UPI",
  transaction_id: "TXN2026031012345",
  payment_status: "Pending",
  paid_at: null
});

// Read — all successful payments
db.payments.find({ payment_status: "Success" });

// Read — payment history for a user
db.payments.find({ user_id: ObjectId("USR001") }).sort({ paid_at: -1 });

// Update — mark as successful
db.payments.updateOne(
  { order_id: ObjectId("ORD001") },
  { $set: { payment_status: "Success", paid_at: new Date() } }
);

// Delete — remove failed payment records
db.payments.deleteOne({ payment_status: "Failed" });
