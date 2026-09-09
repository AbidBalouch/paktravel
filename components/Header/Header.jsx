// components/Header/Header.jsx
import { getHeaderData } from "@/lib/api";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const data = await getHeaderData();

  return <HeaderClient logo={data.logo} menu={data.menu} buttons={data.buttons} />;
}
