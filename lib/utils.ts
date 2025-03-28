import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";

import {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
} from "@metaplex-foundation/js";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  AuthorityType,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeTransferFeeConfigInstruction,
  createInitializeInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  setAuthorityInstructionData,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import {
  DataV2,
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID,
  createCreateInstruction,
  createUpdateInstruction,
  createRevokeUseAuthorityInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import axios from "axios";
import bs58 from "bs58";
import { TokenMetadata, pack } from "@solana/spl-token-metadata";
import pinataSDK from "@pinata/sdk";
import uploadData from "./upload";

export const isMainNet = true;
export const networkUrl = !isMainNet
  ? "https://devnet.helius-rpc.com/?api-key=d3f78f47-827e-4e50-ab6e-38ff4c5f9b0e"
  : "https://mainnet.helius-rpc.com/?api-key=1678151e-afeb-45d5-9940-5d16fec2606b";

export const connection = new Connection(networkUrl, "confirmed");

export const PLATFORM_FEE_PUBKEY = new PublicKey(
  "D8c2Dp5YkQwq8T7AQVXKRo4AwkS6efqdM5oAL5JLhSJc"
);
export const FEE_AMOUNT = 0.1;
export const REVOKED_PUBKEY = new PublicKey("11111111111111111111111111111111");

// const PRIVATE_KEY = ""
// export const feePayerKeypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

export interface TokenDataProps {
  name: string;
  symbol: string;
  description: string;
  imgFile: File;
  websiteLink: string;
  twitterLink: string;
  tgLink: string;
  discordLink: string;
}

export interface AuthorityProps {
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey;
  updateAuthority: PublicKey;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function uploadMetadata(logoFile: File, metadata: any) {
  const formData = new FormData();
  formData.append("file", logoFile as Blob);
  formData.append("metadata", JSON.stringify(metadata));
  console.log(formData)
  const response = await axios.post(
    "https://thynktech-server.onrender.com/upload",
    formData,
    {headers: {
      'Content-Type': 'multipart/form-data',
    }}
  );
  return response.data;
}

const createMint = async (
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number
) => {
  const keypair = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const ixs = [
    SystemProgram.createAccount({
      fromPubkey: mintAuthority,
      newAccountPubkey: keypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),

    createInitializeMintInstruction(
      keypair.publicKey,
      decimals,
      mintAuthority,
      freezeAuthority,
      TOKEN_PROGRAM_ID
    ),
  ];

  return { keypair, ixs };
};

const mintToken = async (
  mint: PublicKey,
  mintAuthority: PublicKey,
  mintAmount: bigint,
  decimals: number,
  programId = TOKEN_PROGRAM_ID
) => {
  const tokenAta = await getAssociatedTokenAddress(
    mint,
    mintAuthority,
    false,
    programId
  );
  let ixs = [
    createAssociatedTokenAccountInstruction(
      mintAuthority,
      tokenAta,
      mintAuthority,
      mint,
      programId
    ),
    createMintToInstruction(
      mint,
      tokenAta,
      mintAuthority,
      mintAmount * BigInt(10 ** decimals),
      [],
      programId
    ),
  ];
  return ixs;
};

const createMetadata = async (
  walletPubkey: PublicKey,
  mint: PublicKey,
  name: string,
  symbol: string,
  description: string,
  imgFile: File,
  websiteLink: string,
  twitterLink: string,
  tgLink: string,
  discordLink: string,
  creatorName: string,
  creatorWebsite: string,
  mintAuthority: PublicKey,
  updateAuthority: PublicKey
) => {
  console.log(
    `Creating metadata with mint ${mint}...`,
    websiteLink,
    twitterLink,
    tgLink,
    discordLink
  );
  const metadata = {
    name,
    symbol,
    description,
    creator: creatorName,
    creatorWebsite: creatorWebsite,
    website: websiteLink,
    twitter: twitterLink,
    telegram: tgLink,
    discord: discordLink,
  };

  const formData = new FormData();
  formData.append("file", imgFile);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log("Upload result:", result);

  const { imageUrl, metadataUri } = await uploadMetadata(imgFile, metadata);

  console.log(`  Uploaded metadata image to ${imageUrl}`, metadataUri);
  if (!imageUrl || !metadataUri) throw new Error("Failed to upload metadata!");

  const tokenMetadata = {
    name,
    symbol,
    uri: metadataUri,
    sellerFeeBasisPoints: 0,
    creators: [{ address: walletPubkey, share: 100 }],
    collection: null,
    uses: null,
  } as DataV2;

  const [metadataPDA] = await PublicKey.findProgramAddress(
    [Buffer.from("metadata"), PROGRAM_ID.toBuffer(), mint.toBuffer()],
    PROGRAM_ID
  );

  // const ix  =  createInitializeInstruction({
  //   programId: TOKEN_2022_PROGRAM_ID,
  //   mint: mint,
  //   metadata: metadataPDA,
  //   name: metadata.name,
  //   symbol: metadata.symbol,
  //   uri: metadataUri,
  //   mintAuthority: walletPubkey,
  //   updateAuthority: walletPubkey,
  // })
  // transaction to create metadata account using V3
  const ix = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint,
      mintAuthority,
      payer: walletPubkey,
      updateAuthority: updateAuthority,
    },
    {
      createMetadataAccountArgsV3: {
        data: tokenMetadata,
        isMutable: true,
        collectionDetails: null,
      },
    }
  );

  const revokeIx = createUpdateMetadataAccountV2Instruction(
    {
      metadata: metadataPDA,
      updateAuthority: updateAuthority, // The current update authority
    },
    {
      updateMetadataAccountArgsV2: {
        data: tokenMetadata,
        updateAuthority: REVOKED_PUBKEY,
        primarySaleHappened: null,
        isMutable: null,
      },
    }
  );

  return { imageUrl, ix, revokeIx, tokenMetadata, metadataPDA };
};

const revokeMintAuthority = async (
  mint: PublicKey,
  mintAuthority: PublicKey,
  programId: PublicKey = TOKEN_PROGRAM_ID
) => {
  // console.log(`Revoking mintAuthority of token ${mint}...`);

  const ix = createSetAuthorityInstruction(
    mint,
    mintAuthority,
    AuthorityType.MintTokens,
    null,
    [],
    programId
  );

  return ix;
};

export const createToken = async (
  walletPubkey: PublicKey,
  name: string,
  ticker: string,
  decimals: number,
  supply: number,
  description: string,
  metadataUri: string,
  websiteLink: string,
  twitterLink: string,
  tgLink: string,
  discordLink: string,
  showCreatorLinks: boolean,
  creatorName: string,
  creatorWebsite: string,
  isFreezeRevoked: boolean,
  isMintRevoked: boolean,
  isUpdateRevoked: boolean
) => {
  try {
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log("Mint:", mint.toBase58());

    // Define the extensions to be used by the mint
    const extensions = [
      ExtensionType.MetadataPointer,
      ExtensionType.TransferFeeConfig,
    ];

    // Calculate the length of the mint
    const mintLen = getMintLen(extensions);

    const metadata: TokenMetadata = {
      updateAuthority: walletPubkey,
      mint: mint,
      name: name,
      symbol: ticker,
      uri: metadataUri,
      additionalMetadata: [],
    };

    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const mintLamports = await getMinimumBalanceForRentExemptMint(
      connection
    );

    const createAccountInst = SystemProgram.createAccount({
      fromPubkey: walletPubkey,
      newAccountPubkey: mint,
      space: MINT_SIZE,
      lamports: mintLamports,
      programId: TOKEN_PROGRAM_ID,
    })

    const createInitMintInst = createInitializeMintInstruction(
      mint,
      decimals,
      walletPubkey,
      isFreezeRevoked ? null : walletPubkey
    )

    const destinationAccount = await getAssociatedTokenAddress(
      mint,
      walletPubkey, //receiver address or owner address
    );

    const createPDAInst = createAssociatedTokenAccountIdempotentInstruction(
      walletPubkey,
      destinationAccount,
      walletPubkey,
      mint
    )

    let createIxs = [
      ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 1.8 * 1_000_000,
      }),
      createAccountInst,
      createInitMintInst,
      createPDAInst,
      createMintToInstruction(
        mint,
        destinationAccount,
        walletPubkey,
        BigInt(supply * Math.pow(10, decimals))
      ),
    ]

    const [metadataPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("metadata"), PROGRAM_ID.toBuffer(), mint.toBuffer()],
      PROGRAM_ID
    );

    const tokenMetadata = {
      name,
      symbol: ticker,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    } as DataV2;

    createIxs.push(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mint,
          mintAuthority: walletPubkey,
          payer: walletPubkey,
          updateAuthority: walletPubkey,
        },
        {
          createMetadataAccountArgsV3: {
            data: tokenMetadata,
            isMutable: false,
            collectionDetails: null,
          },
        }
      )
    )
  
    if (isMintRevoked) {
      const revokeMintIx = await revokeMintAuthority(mintKeypair.publicKey, walletPubkey, TOKEN_PROGRAM_ID);
      createIxs.push(revokeMintIx);
    }
    
    if(isUpdateRevoked) {
      createIxs.push(
        createUpdateMetadataAccountV2Instruction(
          {
            metadata: metadataPDA,
            updateAuthority: walletPubkey
          },
          {
            updateMetadataAccountArgsV2: {
              data: null, // Keep existing metadata
              updateAuthority: REVOKED_PUBKEY, // Revoke update authority (set to null)
              primarySaleHappened: null,
              isMutable: null
            }
          }
        )
      )
    }

    return { mintKeypair, createIxs };
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Failed to create token: ${err.message}`);
      throw new Error(`Failed to create token: ${err.message}`);
    } else {
      console.error("Failed to create token:", err);
      throw new Error("Failed to create token: Unknown error");
    }
  }
};

export const createToken22 = async (
  walletPubkey: PublicKey,
  name: string,
  ticker: string,
  decimals: number,
  supply: number,
  description: string,
  metadataUri: string,
  websiteLink: string,
  twitterLink: string,
  tgLink: string,
  discordLink: string,
  transferFee: number,
  maxFee: number,
  authorityWallet: string,
  withdrawAuthority: string,
  creatorName: string,
  creatorWebsite: string,
  isFreezeRevoked: boolean,
  isMintRevoked: boolean,
  isUpdateRevoked: boolean,
  isSetFeeAuthority: boolean
) => {
  console.log("isUpdateRevoked", isUpdateRevoked);

  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  console.log("Mint:", mint.toBase58());

  // Define the extensions to be used by the mint
  const extensions = [
    ExtensionType.MetadataPointer,
    ExtensionType.TransferFeeConfig,
  ];

  // Calculate the length of the mint
  const mintLen = getMintLen(extensions);

  const metadata: TokenMetadata = {
    updateAuthority: walletPubkey,
    mint: mint,
    name: name,
    symbol: ticker,
    uri: metadataUri,
    additionalMetadata: [],
  };

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  console.log("debug metadata", metadataLen);

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );

  let createIxs = [
    SystemProgram.createAccount({
      fromPubkey: walletPubkey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(
      mint,
      walletPubkey,
      mint,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeTransferFeeConfigInstruction(
      mint,
      !isSetFeeAuthority ? walletPubkey : null,
      new PublicKey(withdrawAuthority),
      transferFee * 100,
      BigInt(maxFee),
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeMintInstruction(
      mint,
      decimals,
      walletPubkey,
      isFreezeRevoked ? null : walletPubkey,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mint,
      metadata: mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: walletPubkey,
      updateAuthority: walletPubkey,
    }),
  ];

  const mintIxs = await mintToken(
    mintKeypair.publicKey,
    walletPubkey,
    BigInt(supply),
    decimals,
    TOKEN_2022_PROGRAM_ID
  );
  createIxs = [...createIxs, ...mintIxs];

  if (isMintRevoked) {
    const revokeMintIx = await revokeMintAuthority(
      mintKeypair.publicKey,
      walletPubkey,
      TOKEN_2022_PROGRAM_ID
    );
    createIxs.push(revokeMintIx);
  }
  if (isUpdateRevoked) {
    createIxs.push(
      createSetAuthorityInstruction(
        mint,
        walletPubkey,
        AuthorityType.MetadataPointer,
        null,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
  }

  return { mintKeypair, createIxs };
};
