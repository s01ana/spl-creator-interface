"use client"

import { Users, LayoutDashboard, TrendingUp, ArrowLeftRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

const stats = [
  { title: "Total Users", value: "+7,000", icon: Users },
  { title: "Total Projects", value: "+2,500", icon: LayoutDashboard },
  { title: "Volume", value: "+65M", icon: TrendingUp },
  { title: "Transactions", value: "+120k", icon: ArrowLeftRight },
]

export const faqs = [
  { question: "What is Solana, and why should I launch my token on it?", answer: "Solana is a high-performance blockchain known for its fast transaction speeds and low costs. It's an ideal platform for launching tokens due to its scalability and growing community, offering opportunities for rapid project growth." },
  { question: "How can I create a token on the Solana blockchain?", answer: "You can create a token on Solana using tools like the Solana Token Creator, which allows you to launch your token in minutes without coding. Key elements to configure include the token name, symbol, initial supply, decimals, image, description, and social links." },
  { question: "What are the steps to deploy my own token on Solana?", answer: "Deploying a token on Solana involves several steps: setting up a development environment, creating a keypair for the mint authority, making a mint address, creating the token mint account, and issuing tokens. Detailed guides are available to assist with each step." },
  { question: "How can I manage token authorities on Solana?", answer: "On Solana, tokens have three types of authority: Mint, Freeze, and Mutability. It's essential to know how and when to revoke these authorities to ensure investor confidence. Tools are available to manage these authorities without coding." },
  { question: "What platforms can assist with launching a token on Solana?", answer: "Several platforms offer comprehensive services for launching tokens on Solana, including StarLaunch, Solrocket, and SolanaPad. These platforms provide tools for token creation, liquidity pools, and community engagement." },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] bg-gradient-to-b from-[rgba(0,40,40,0.3)] to-transparent">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex items-center justify-between">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold text-cyan-400 mb-4">Tokens & Liquidity</h1>
          <p className="text-gray-300 text-lg mb-8">
            Launch Tokens, and Create Liquidity Pool. Effortless and no coding required!
          </p>
          <div className="flex gap-4">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-8 py-6 text-lg">Create Token</Button>
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg">
              Create Liquidity
            </Button>
          </div>
        </div>
        <div className="hidden lg:block">
          <img
            src="/solana.png"
            alt="Platform Logo"
            className="w-96 h-96 object-contain"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[rgba(0,40,40,0.2)] backdrop-blur-sm rounded-lg p-6 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-[rgba(255,255,255,0.1)] rounded-full p-2">
                <stat.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-gray-400 mb-2">{stat.title}</h3>
              <p className="text-4xl font-bold text-cyan-400">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-cyan-400 mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[rgba(0,40,40,0.2)] backdrop-blur-sm rounded-lg border-none text-sm lg:text-lg font-medium py-3 lg: px-4"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline text-gray-200">
                  <span>{faq.question}</span>
                  {/* <Plus className="h-5 w-5 shrink-0" /> */}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 mt-5 text-white">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  )
}

