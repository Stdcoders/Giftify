import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./slice/authSlice";
import ProductReducer from "./slice/productSlice";
import CartReducer from "./slice/cartSlice";
import checkoutReducer from "./slice/checkoutSlice";
import orderReducer from "./slice/orderSlice";
import adminReducer from "./slice/adminSlice";
import adminProductReducer from "./slice/adminProductSlice";
import adminOrderRedcuer from "./slice/adminOrderSlice";
import reminderReducer from "./slice/reminderSlice";

const store = configureStore({
  reducer: {
    auth: AuthReducer,
    products: ProductReducer,
    cart: CartReducer,
    checkout: checkoutReducer,
    orders: orderReducer,
    admin: adminReducer,
    adminProduct: adminProductReducer,
    adminOrder: adminOrderRedcuer,
    reminders: reminderReducer,
  },
});

export default store;