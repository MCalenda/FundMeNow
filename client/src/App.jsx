import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

import EthProvider from "./contexts/EthProvider";

import HomePage, { projLoader } from "./pages/HomePage";
import ConnectPage from "./pages/ConnectPage";

import RootLayout from "./layouts/RootLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<ConnectPage />} />
      <Route path="home" element={<HomePage />} loader={projLoader} />
    </Route>
  )
);

export default function App() {
  return (
    <RouterProvider router={router}>
      <EthProvider></EthProvider>
    </RouterProvider>
  );
}
