"use client"; // ✅ Ensures this runs in the browser

import { usePathname } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
  const pathname = usePathname(); // ✅ Get current route

  // ✅ Function to dynamically set active link class
  const getLinkClass = (path: string) =>
    pathname === path ? "text-cyan-400" : "text-gray-400 hover:text-cyan-400";

  return (
    <nav className="hidden md:flex items-center space-x-6 ml-auto">
      <Link href="/" className={`text-sm font-medium ${getLinkClass("/")}`}>
        Home
      </Link>
      <Link href="/create-token" className={`text-sm font-medium ${getLinkClass("/create-token")}`}>
        Create Token
      </Link>
      <Link href="/manage-token" className={`text-sm font-medium ${getLinkClass("/manage-token")}`}>
        Manage Token
      </Link>
      <Link href="https://raydium.io/liquidity-pools/" className={`text-sm font-medium ${getLinkClass("/liquidity-pool")}`}>
        Liquidity Pool
      </Link>
      {/* <Link href="https://raydium.io/liquidity-pools/" className={`text-sm font-medium ${getLinkClass("/manage-liquidity")}`}>
        Manage Liquidity
      </Link> */}
      <Link href="/help" className={`text-sm font-medium ${getLinkClass("/help")}`}>
        Help
      </Link>
    </nav>
  );
};

export default Navbar;
