
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import Login from "./apps/auth/login";
import Register from "./apps/auth/register";
import ProtectedRoute from "./apps/route/protected-route";
import { store } from "./apps/pages/store/store";

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={<App />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </Provider>,
);

