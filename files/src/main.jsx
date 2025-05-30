import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";

import Root, { loader as rootLoader } from "./routes/root";
import ErrorPage from "./routes/error-page";

import Login, { action as loginAction } from "./routes/navigateApp/login";
import Register, { action as registerAction } from "./routes/navigateApp/register";
import Home, { loader as homeLoader } from "./routes/navigateApp/home";

import UserInfo from "./routes/navigateApp/users/userInfo";
import UserTodos from "./routes/navigateApp/users/userTodos";
import UserPosts from "./routes/navigateApp/users/userPosts";
import UserAlbums from "./routes/navigateApp/users/userAlbums";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    errorElement: <ErrorPage />,
    children: [
      { 
        path: "login",
        action: loginAction,
        element: <Login />,
      },
      {
        path: "register",
        action: registerAction,
        element: <Register />,
      },
      {
        path: "home",
        loader: homeLoader,
        element: <Home />,
      },
      {
        path: "users/:username/info",
        element: <UserInfo />,
      },
      {
        path: "users/:username/todos",
        element: <UserTodos />,
      },
      {
        path: "users/:username/posts?/:postId",
        element: <UserPosts />,
      },
      {
        path: "users/:username/albums",
        element: <UserAlbums />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);