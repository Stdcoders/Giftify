/* eslint-disable no-unused-vars */
import React from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserLayout from "./components/layout/UserLayout";
import Home from "./pages/Home"; // Relative path
import Login from "../src/pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CollectionPage from "./pages/CollectionPage";
import Checkout from "./components/cart/Checkout";
import OrderConfirmationPage from "./pages/OrderConformationPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminHomePage from "./pages/AdminHomePage";
import UserManagement from "./components/admin/UserManagement";
import ProductManagement from "./components/admin/ProductManagement";
import EditProductPage from "./components/admin/EditProductPage";
import OrderManagement from "./components/admin/OrderManagement";
import { Provider } from "react-redux";
import store from "./redux/store";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GiftFinderGame from "./components/recommendations/GiftFinderGame";
import ProductDetails from "./components/Products/ProductDetails";
import ProtectedRoute from "./components/common/ProtectedRoute";
import GiftReminder from "./components/reminders/GiftReminder";
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const App = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API URL:", API_URL);

  return (
    <div>
      <Provider store={store}>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<UserLayout />}>
              {/*User Layout */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />}></Route>
              <Route path="register" element={<Register />}></Route>
              <Route path="profile" element={<Profile />}></Route>
              <Route
                path="collections/:collection"
                element={<CollectionPage />}
              ></Route>
              <Route path="product/:id" element={<ProductDetails />}></Route>
              <Route path="checkout" element={<Checkout />}></Route>
              <Route
                path="order-confirmation"
                element={<OrderConfirmationPage />}
              ></Route>
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
              <Route path="gift-finder" element={<GiftFinderGame />} />
              <Route
                path="reminders"
                element={
                  <ProtectedRoute>
                    <GiftReminder />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="/admin" element={<ProtectedRoute role='Admin'>
              <AdminLayout />
            </ProtectedRoute>}>
              {" "}
              <Route index element={<AdminHomePage />}></Route>
              <Route path="users" element={<UserManagement />}></Route>
              <Route path="products" element={<ProductManagement />}></Route>
              <Route
                path="products/:id/edit"
                element={<EditProductPage />}
              ></Route>
              <Route path="orders" element={<OrderManagement />}></Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </div>
  );
};

export default App;
