import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./src/components/ProtectedRoute/ProtectedRoute";

import About from "./src/pages/About/About";
import Checkout from "./src/pages/Checkout/Checkout";
import Home from "./src/pages/Home/Home";
import Layout from "./src/components/Layout/Layout";
import Login from "./src/pages/Login/Login";
import NotFound from "./src/components/Error/NotFound/NotFound";
import Orders from "./src/pages/Orders/Orders";
import ProductDetails from "./src/pages/ProductDetails/ProductDetails";
import ProductList from "./src/pages/ProductList/ProductList";
import Profile from "./src/pages/Profile/Profile";
import SignUp from "./src/pages/SignUp/SignUp";
import ProductFeatured from "./src/pages/ProductFeatured/ProductFeatured";
import Logout from "./src/pages/Logout/Logout";
import AccountLayout from "./src/components/AccountLayout/AccountLayout";
import Wishlist from "./src/pages/Wishlist/Wishlist";
import ResetPassword from "./src/pages/ResetPassword/ResetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Home /> },
      { path: "about", element: <About /> },
      { path: "products", element: <ProductList /> },
      { path: "products/featured", element: <ProductFeatured /> },
      { path: "products/categories/:slug", element: <ProductList /> },
      { path: "products/:slug", element: <ProductDetails /> },

      { path: "register", element: <SignUp /> },
      { path: "login", element: <Login /> },
      { path: "logout", element: <Logout /> },
      { path: "reset-password/:token", element: <ResetPassword /> },

      {
        path: "account",
        element: (
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "", element: <Profile /> },
          { path: "profile", element: <Profile /> },
          { path: "orders", element: <Orders /> },
          { path: "wishlist", element: <Wishlist /> },
        ],
      },
    ],
  },

  {
    path: "/checkout",
    element: (
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    ),
  },

  { path: "*", element: <NotFound /> },
]);

export default router;
