import { Toaster } from "react-hot-toast";
import DeliveryApp from "./DeliveryApp";

export default function App() {
  return (
    <>
      <DeliveryApp />
      <Toaster position="top-center" />
    </>
  );
}