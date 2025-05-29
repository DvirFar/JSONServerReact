import { Outlet, redirect, } from "react-router-dom";
import { getCurrentUser } from "../api/auth";

export function loader({ request }) {
  try {
    console.log("Root loader running");
    const user = getCurrentUser();
    console.log("User:", user);
    
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    console.log("Current path:", pathname);
    
    if (pathname === "/") {
      if (!user) {
        return redirect("/login");
      } else {
        return redirect("/home");
      }
    }
    
    return { user };
    
  } catch (error) {
    console.error("Auth error:", error);
    return { user: null };
  }
}

export default function Root() {
  return (
    <>
      <Outlet />
    </>
  );
}
