const Razorpay = require("razorpay");

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart_mock_id";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_test_mock_secret_key";
    
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
