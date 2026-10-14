const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require("../controllers/wishlist.controller");
const { authenticateCustomer } = require("../middlewares/auth.middleware");

// All wishlist routes are protected
router.use(authenticateCustomer);

router.post("/:productId", addToWishlist);
router.patch("/:productId/toggle", toggleWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
