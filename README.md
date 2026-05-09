# E-Commerce Based System — NoSQL Conceptual Database Design

> A complete database design project implementing a scalable NoSQL document-oriented schema for an e-commerce platform using MongoDB, with full ER modelling, BCNF normalisation, relational mapping, and CRUD implementation.

---

## Authors

| Name | Roll Number |
|---|---|
| Raghunandan Shaji P | 3122245001113 |
| Samyak L | 3122245001133 |

**Institution:** SSN College of Engineering, Kalavakkam — 603 110  
**Course:** UCS3402 — Database Management Systems  
**Degree:** B.E. Computer Science and Engineering

---

## Project Overview

The E-Commerce Based System (EBS) manages the complete lifecycle of an online retail platform — product cataloging, customer management, order processing, cart management, reviews, seller management, and payment settlements. The project models the system using an Entity Relationship approach, maps it to a relational schema normalised to BCNF, and then translates it into an optimised MongoDB document schema.

---

## Repository Structure

```
ebs-nosql-design/
├── README.md
├── docs/
│   └── ebs_report.pdf              # Full compiled project report
├── latex/
│   └── ebs_report.tex              # LaTeX source of the full report
├── diagrams/
│   ├── er_before_normalization.dot # Graphviz: ER diagram before normalisation (Chen notation)
│   └── er_after_bcnf.dot           # Graphviz: ER diagram after BCNF (Chen notation)
└── mongodb/
    ├── crud_operations.js          # All CRUD operations across all collections
    └── schema_validation.js        # MongoDB $jsonSchema validators for all collections
```

---

## Collections

| Collection | Description |
|---|---|
| `users` | Customer profiles; addresses embedded as array |
| `products` | Catalog items; variants, images, specifications embedded |
| `categories` | Self-referencing hierarchical taxonomy |
| `sellers` | Third-party vendor profiles |
| `orders` | Purchase transactions; order items embedded as snapshots |
| `cart` | One active cart per user; items embedded |
| `reviews` | User-submitted product ratings and reviews; stored separately |
| `payments` | Payment transactions; referenced from orders |

---

## Entity Relationship Model

### Entities

| Entity | Type | Notes |
|---|---|---|
| User | Strong | Registered customer |
| Seller | Strong | Third-party vendor |
| Category | Strong | Self-referencing (`parent_id`) |
| Product | Strong | Central catalog entity |
| Product Variant | Weak (owned by Product) | PK: `(variant_id, product_id)` |
| Cart | Strong | 1:1 with User |
| Cart Item | Junction | Resolves M:N between Cart and Product |
| Order | Strong | Purchase transaction |
| Order Item | Weak (owned by Order) | PK: `(order_id, item_id)`; snapshot fields |
| Review | Strong | CK: `review_id` or `(product_id, user_id)` |
| Payment | Strong | `user_id` intentionally denormalised |

### Relationships

| Relationship | Cardinality | Notes |
|---|---|---|
| User — Order | 1:N | |
| User — Cart | 1:1 | UNIQUE on `cart.user_id` |
| User — Review | 1:N | |
| User — Payment | 1:N | Denormalised |
| Seller — Product | 1:N | |
| Category — Category | 0or1:N | Self-reference |
| Category — Product | 1:N | |
| Product — Product Variant | 1:N | Identifying (weak entity) |
| Product — Review | 1:N | |
| Product — Order Item | 1:N | Soft reference; snapshot |
| Cart — Cart Item — Product | M:N | Resolved via `CART_ITEM` |
| Order — Order Item | 1:N (min 1) | Identifying (weak entity) |
| Order — Payment | 1:1 | UNIQUE on `payment.order_id` |

---

## Final Relational Schema (BCNF)

```
USER(user_id, name, email*, phone, password_hash, created_at)

USER_ADDRESS(address_id, user_id→USER, line1, city, state, pincode, is_default)

SELLER(seller_id, business_name, email*, phone, gst_number*, rating, joined_at)

CATEGORY(category_id, category_name*, parent_id→CATEGORY, description)

PRODUCT(product_id, seller_id→SELLER, category_id→CATEGORY, name, description,
        price, discount, stock_quantity, average_rating, created_at)

PRODUCT_VARIANT(variant_id, product_id→PRODUCT, size, colour, storage,
                additional_price, stock)
                PK: (variant_id, product_id)

PRODUCT_IMAGE(image_id, product_id→PRODUCT, image_url, display_order)

CART(cart_id, user_id→USER[UNIQUE], updated_at)

CART_ITEM(cart_id→CART, product_id→PRODUCT, quantity, added_at)
          PK: (cart_id, product_id)

ORDER(order_id, user_id→USER, order_status, total_amount, placed_at, delivered_at)

ORDER_ITEM(order_id→ORDER, item_id, product_id[snapshot], seller_id[snapshot],
           product_name[snapshot], quantity, unit_price[snapshot])
           PK: (order_id, item_id)

REVIEW(review_id, product_id→PRODUCT, user_id→USER, rating, title, body,
       verified, created_at)

PAYMENT(payment_id, order_id→ORDER[UNIQUE], user_id[denorm], amount, method,
        transaction_id*, payment_status, paid_at)

*  = candidate / unique key
→  = foreign key
[snapshot]  = intentional denormalisation (historical value at time of purchase)
[denorm]    = intentional denormalisation (derivable via order_id → ORDER.user_id)
```

---

## Functional Dependencies & BCNF

| Relation | Candidate Keys | Normal Form |
|---|---|---|
| USER | `user_id`, `email` | BCNF |
| SELLER | `seller_id`, `email`, `gst_number` | BCNF |
| CATEGORY | `category_id`, `category_name` | BCNF |
| PRODUCT | `product_id` | BCNF |
| PRODUCT_VARIANT | `(variant_id, product_id)` | BCNF |
| CART | `cart_id`, `user_id` | BCNF |
| CART_ITEM | `(cart_id, product_id)` | BCNF |
| ORDER | `order_id` | BCNF |
| ORDER_ITEM | `(order_id, item_id)` | BCNF (snapshot denorm noted) |
| REVIEW | `review_id`, `(product_id, user_id)` | BCNF |
| PAYMENT | `payment_id`, `order_id`, `transaction_id` | BCNF (user_id denorm noted) |

**PAYMENT denormalisation note:** `user_id` is transitively derivable via `payment_id → order_id → user_id`. It is retained as an intentional denormalisation to enable direct payment-history queries per user without a join through the Orders relation.

---

## Embedding vs Referencing Decisions

| Relationship | Decision | Reason |
|---|---|---|
| Product ↔ Variants | Embed | Always fetched together on product page |
| Product ↔ Images | Embed | Accessed on every product view |
| Product ↔ Specifications | Embed | Integral to product display |
| Order ↔ Order Items | Embed | Historical snapshot; immune to product updates |
| Order ↔ Shipping Address | Embed | Snapshot; independent of user's address book |
| User ↔ Addresses | Embed | Small bounded set; always fetched with profile |
| Cart ↔ Cart Items | Embed | Single read for entire cart view |
| Product ↔ Reviews | Reference | Volume can be thousands; paginated independently |
| Order ↔ Payment | Reference | Independent audit trail; supports refunds/chargebacks |
| Product ↔ Seller | Reference | Shared across thousands of products |
| Product ↔ Category | Reference | Shared taxonomy; hierarchy changes shouldn't cascade |

---

## Index Strategy

| Collection | Index Field(s) | Purpose |
|---|---|---|
| Products | `category_id` | Browse by category |
| Products | `name` (text index) | Full-text product search |
| Products | `seller_id` | List a seller's products |
| Orders | `(user_id, order_status)` | Fetch active orders for a user |
| Reviews | `(product_id, created_at)` | Paginated product reviews |
| Payments | `order_id` | Retrieve payment by order |
| Cart | `user_id` (unique) | One-to-one cart lookup |

---

## Scalability & Concurrency

**Sharding:**
- `products` sharded on `category_id` — distributes catalog queries across nodes
- `orders` sharded on `user_id` — parallel processing of user order data

**Concurrency:**
- Document-level locking allows simultaneous cart updates across users
- `$inc` on `stock_quantity` with `{ $gt: 0 }` guard prevents overselling atomically
- `$push` / `$pull` for cart item operations are atomic at the array level
- Multi-document **MongoDB transactions** wrap the order-placement workflow (insert Order + insert Payment + decrement stock)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| MongoDB | Primary NoSQL document database |
| MongoDB Shell / Compass | Implementation and query execution |
| Graphviz DOT | ER diagram generation (Chen notation) |
| LaTeX | Report typesetting |

---

## How to Run the Queries

1. Install [MongoDB](https://www.mongodb.com/try/download/community) and start `mongod`
2. Open MongoDB Shell (`mongosh`)
3. Run the setup and CRUD file:

```bash
mongosh < mongodb/crud_operations.js
```

4. To apply schema validators:

```bash
mongosh < mongodb/schema_validation.js
```

---

## Generating the ER Diagrams

Install [Graphviz](https://graphviz.org/download/), then:

```bash
dot -Tpng diagrams/er_before_normalization.dot -o diagrams/er_before_normalization.png
dot -Tpng diagrams/er_after_bcnf.dot           -o diagrams/er_after_bcnf.png
```

---

## License

Academic project submitted as coursework at SSN College of Engineering.  
All rights reserved by the authors.
