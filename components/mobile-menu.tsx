"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

const MobileMenu = () => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden bg-white">
          <Menu className="h-6 w-6 bg-white" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#121212] border-gray-800">
        <nav className="flex flex-col space-y-4 mt-8">
          <Link href="/" className="text-lg font-medium text-cyan-400" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link
            href="/create-token"
            className="text-lg font-medium text-gray-400 hover:text-cyan-400"
            onClick={() => setOpen(false)}
          >
            Create Token
          </Link>
          <Link
            href="/manage-token"
            className="text-lg font-medium text-gray-400 hover:text-cyan-400"
            onClick={() => setOpen(false)}
          >
            Manage Token
          </Link>
          <Link
            href="/liquidity-pool"
            className="text-lg font-medium text-gray-400 hover:text-cyan-400"
            onClick={() => setOpen(false)}
          >
            Liquidity Pool
          </Link>
          <Link
            href="/manage-liquidity"
            className="text-lg font-medium text-gray-400 hover:text-cyan-400"
            onClick={() => setOpen(false)}
          >
            Manage Liquidity
          </Link>
          <Link
            href="/help"
            className="text-lg font-medium text-gray-400 hover:text-cyan-400"
            onClick={() => setOpen(false)}
          >
            Help
          </Link>
        </nav>
        <Button className="bg-purple-600 hover:bg-purple-700 mt-8 w-full">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 18V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.9 6 10 6.9 10 8V16C10 17.1 10.9 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z"
              fill="currentColor"
            />
          </svg>
          Connect Wallet
        </Button>
      </SheetContent>
    </Sheet>
  )
}

export default MobileMenu

