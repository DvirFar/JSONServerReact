import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";

import Root, { loader as rootLoader, action as rootAction, } from "./routes/root";
import ErrorPage from "./error-page";

import Login, { action as loginAction } from "./routes/login";
import Register, { action as registerAction } from "./routes/register";
import Home, { loader as homeLoader } from "./routes/home";
import UserInfo from "./routes/users/userInfo";
import UserTodos from "./routes/users/userTodos";
import UserPosts from "./routes/users/userPosts";
import UserAlbums from "./routes/users/userAlbums";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
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
        path: "users/:username/posts",
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