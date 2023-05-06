import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { Container } from "react-bootstrap";

export default function RootLayout() {
  return (
    <Container>
      <main>
        <Outlet />
      </main>
    </Container>
  );
}
