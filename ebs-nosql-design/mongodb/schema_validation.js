// ============================================================
// E-Commerce Based System (EBS) — MongoDB Schema Validators
// UCS3402 Database Management Systems
// SSN College of Engineering
// ============================================================

use("ebs");

// ────────────────────────────────────────────────────────────
// USERS
// ────────────────────────────────────────────────────────────
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password_hash", "created_at"],
      properties: {
        name:          { bsonType: "string" },
        email:         { bsonType: "string" },
        phone:         { bsonType: "string" },
        password_hash: { bsonType: "string" },
        addresses: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["line1", "city", "state", "pincode"],
            properties: {
              address_id: { bsonType: "string" },
              line1:      { bsonType: "string" },
              city:       { bsonType: "string" },
              state:      { bsonType: "string" },
              pincode:    { bsonType: "string" },
              is_default: { bsonType: "bool" }
            }
          }
        },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true });


// ────────────────────────────────────────────────────────────
// SELLERS
// ────────────────────────────────────────────────────────────
db.createCollection("sellers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["business_name", "email", "joined_at"],
      properties: {
        business_name: { bsonType: "string" },
        email:         { bsonType: "string" },
        phone:         { bsonType: "string" },
        gst_number:    { bsonType: "string" },
        rating:        { bsonType: "double", minimum: 0, maximum: 5 },
        joined_at:     { bsonType: "date" }
      }
    }
  }
});

db.sellers.createIndex({ email: 1 },      { unique: true });
db.sellers.createIndex({ gst_number: 1 }, { unique: true, sparse: true });


// ────────────────────────────────────────────────────────────
// CATEGORIES
// ────────────────────────────────────────────────────────────
db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["category_name"],
      properties: {
        category_name: { bsonType: "string" },
        parent_id:     { bsonType: ["objectId", "null"] },
        description:   { bsonType: "string" }
      }
    }
  }
});

db.categories.createIndex({ category_name: 1 }, { unique: true });


// ────────────────────────────────────────────────────────────
// PRODUCTS
// ────────────────────────────────────────────────────────────
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["seller_id", "category_id", "name", "price", "stock_quantity", "created_at"],
      properties: {
        seller_id:      { bsonType: "objectId" },
        category_id:    { bsonType: "objectId" },
        name:           { bsonType: "string" },
        description:    { bsonType: "string" },
        price:          { bsonType: "double", minimum: 0 },
        discount:       { bsonType: "double", minimum: 0, maximum: 100 },
        stock_quantity: { bsonType: "int",    minimum: 0 },
        images:         { bsonType: "array" },
        variants:       { bsonType: "array" },
        specifications: { bsonType: "object" },
        average_rating: { bsonType: "double", minimum: 0, maximum: 5 },
        created_at:     { bsonType: "date" }
      }
    }
  }
});

db.products.createIndex({ category_id: 1 });
db.products.createIndex({ seller_id: 1 });
db.products.createIndex({ name: "text" });


// ────────────────────────────────────────────────────────────
// CART
// ────────────────────────────────────────────────────────────
db.createCollection("cart", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "updated_at"],
      properties: {
        user_id: { bsonType: "objectId" },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["product_id", "quantity"],
            properties: {
              product_id: { bsonType: "objectId" },
              quantity:   { bsonType: "int", minimum: 1 },
              added_at:   { bsonType: "date" }
            }
          }
        },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.cart.createIndex({ user_id: 1 }, { unique: true });


// ────────────────────────────────────────────────────────────
// ORDERS
// ────────────────────────────────────────────────────────────
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "order_items", "order_status", "total_amount", "placed_at"],
      properties: {
        user_id: { bsonType: "objectId" },
        order_items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["item_id", "product_id", "seller_id", "product_name", "quantity", "unit_price"],
            properties: {
              item_id:      { bsonType: "string" },
              product_id:   { bsonType: "objectId" },
              seller_id:    { bsonType: "objectId" },
              product_name: { bsonType: "string" },
              quantity:     { bsonType: "int", minimum: 1 },
              unit_price:   { bsonType: "double", minimum: 0 }
            }
          }
        },
        shipping_address: {
          bsonType: "object",
          required: ["line1", "city", "state", "pincode"],
          properties: {
            line1:   { bsonType: "string" },
            city:    { bsonType: "string" },
            state:   { bsonType: "string" },
            pincode: { bsonType: "string" }
          }
        },
        order_status:  {
          bsonType: "string",
          enum: ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"]
        },
        total_amount: { bsonType: "double", minimum: 0 },
        placed_at:    { bsonType: "date" },
        delivered_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.orders.createIndex({ user_id: 1, order_status: 1 });


// ────────────────────────────────────────────────────────────
// REVIEWS
// ────────────────────────────────────────────────────────────
db.createCollection("reviews", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["product_id", "user_id", "rating", "verified", "created_at"],
      properties: {
        product_id: { bsonType: "objectId" },
        user_id:    { bsonType: "objectId" },
        rating:     { bsonType: "int", minimum: 1, maximum: 5 },
        title:      { bsonType: "string" },
        body:       { bsonType: "string" },
        verified:   { bsonType: "bool" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.reviews.createIndex({ product_id: 1, created_at: -1 });
db.reviews.createIndex({ product_id: 1, user_id: 1 }, { unique: true });


// ────────────────────────────────────────────────────────────
// PAYMENTS
// ────────────────────────────────────────────────────────────
db.createCollection("payments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id", "user_id", "amount", "method", "payment_status"],
      properties: {
        order_id:       { bsonType: "objectId" },
        user_id:        { bsonType: "objectId" },
        amount:         { bsonType: "double", minimum: 0 },
        method:         {
          bsonType: "string",
          enum: ["Card", "UPI", "NetBanking", "COD", "Wallet"]
        },
        transaction_id: { bsonType: "string" },
        payment_status: {
          bsonType: "string",
          enum: ["Pending", "Success", "Failed", "Refunded"]
        },
        paid_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.payments.createIndex({ order_id: 1 },       { unique: true });
db.payments.createIndex({ user_id: 1 });
db.payments.createIndex({ transaction_id: 1 }, { unique: true, sparse: true });
