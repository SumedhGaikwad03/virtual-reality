import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { AssistantProvider } from "./context/AssistantContext";
import { HeaderProvider } from "./context/HeaderContext";
import { AppRouter } from "./router/AppRouter";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HeaderProvider>
          <AssistantProvider>
            <AppRouter />
          </AssistantProvider>
        </HeaderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
