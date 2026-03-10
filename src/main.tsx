import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initDb } from "./lib/db";

// Initialize database schema on startup
initDb();

createRoot(document.getElementById("root")!).render(<App />);
