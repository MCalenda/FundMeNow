import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function RootLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
