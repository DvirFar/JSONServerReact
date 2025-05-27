import { Outlet, redirect, } from "react-router-dom";
import { getCurrentUser } from "../api/auth";

export function loader() {
  const user = getCurrentUser();
    if (!user) {
        return redirect("/home");
    }
    return { user };
}

export default function Root() {
  return (
    <>
      <Outlet />
    </>
  );
}
