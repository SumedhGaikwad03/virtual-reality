import { BrowserRouter, Link } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { AppRouter } from "./router/AppRouter";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <nav aria-label="Main navigation">
          <Link to="/">Virtual Reality</Link>{" "}
          <Link to="/search">Search</Link>
        </nav>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
