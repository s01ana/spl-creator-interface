import { ImageResponse } from "next/server"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "Thynk Tech Coin Launch - Create Solana Tokens Effortlessly"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

// Image generation
export default async function Image() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        background: "linear-gradient(to bottom, #121212, #004040)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 48,
        }}
      >
        <div
          style={{
            background: "#00CED1",
            borderRadius: "50%",
            padding: 24,
            marginRight: 24,
            fontSize: 64,
          }}
        >
          🚀
        </div>
        <h1
          style={{
            fontSize: 64,
            color: "#00CED1",
            fontWeight: "bold",
          }}
        >
          Thynk Tech Coin Launch
        </h1>
      </div>
      <p
        style={{
          fontSize: 32,
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        Create Solana Tokens Effortlessly - No Coding Required
      </p>
    </div>,
    // ImageResponse options
    {
      // For convenience, we can re-use the exported size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    },
  )
}

