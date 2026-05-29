
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { WorkspaceProvider } from "./context/WorkspaceContext.jsx";
import { LeadProvider } from "./context/LeadContext.jsx";
import { TaskProvider } from "./context/TaskContext.jsx";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <WorkspaceProvider>
        <LeadProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </LeadProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </BrowserRouter>,
);
