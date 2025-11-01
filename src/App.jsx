// export default App

import React from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Contact from "./pages/Contact";
import Registration from "./pages/Registration";
import YatraRegistration from "./pages/YatraRegistration";

// Simple router replacement (no react-router) — very small SPA navigation
export default function App() {
  const [route, setRoute] = React.useState("home");

  return (
    <div>
      <Navbar onNavigate={setRoute} current={route} />
      <main style={{ padding: "20px" }}>
        {/* ✅ Pass onNavigate to Home so it can trigger navigation */}
        {route === "home" && <Home onNavigate={setRoute} />}  
        {route === "signup" && <Signup onNavigate={setRoute} />}
        {route === "signin" && <Signin onNavigate={setRoute} />}
        {route === "contact" && <Contact />}
        {route === "registration" && <Registration />}
        {route === "yatraRegistration" && (<YatraRegistration onNavigate={setRoute} />
        // {route === "yatraRegistration" && (<YatraRegistration />
        )}
      </main>
    </div>
  );
}
