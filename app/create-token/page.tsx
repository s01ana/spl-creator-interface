"use client";
import { useEffect, useState } from "react";
import {
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
} from "@solana/web3.js";
import toast from "react-hot-toast";
import { ImagePlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { createToken, createToken22, FEE_AMOUNT, PLATFORM_FEE_PUBKEY } from "@/lib/utils";
import { WalletButton } from "@/components/solana/solana-provider";
import { transcode } from "buffer";
import jwt from 'jsonwebtoken';
import axios from "axios";

export default function CreateToken() {
  const { publicKey, sendTransaction, signTransaction, connected } =
    useWallet();
  const [txSignature, setTxSignature] = useState("");
  const { connection } = useConnection();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showSocialLinks, setShowSocialLinks] = useState<boolean>(false);
  const [showCreatorLinks, setShowCreatorLinks] = useState<boolean>(false);
  const [isSetFeeAuthority, setIsSetFeeAuthority] = useState<boolean>(false);
  const [freezeIsChecked, setFreezeIsChecked] = useState<boolean>(false);
  const [mintIsChecked, setMintIsChecked] = useState<boolean>(false);
  const [updateIsChecked, setUpdateIsChecked] = useState<boolean>(false);
  const [tokenData, setTokenData] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    supply: 10000000000,
    description: "",
    uri: "",
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
  });

  const [creatorData, setCreatorData] = useState({
    creatorName: "",
    creatorSite: "",
  });

    // New state for SPL Token 2022 specific fields
    const [token2022Data, setToken2022Data] = useState({
      ...tokenData,
      transferFee: 0,
      maxFee: 0,
      authorityWallet: "",
      withdrawAuthority: "",
    })

    const [activeTab, setActiveTab] = useState("standard")

    const [pending, setPending] = useState(false)

    const handleUploadImage = async () => {

      const formData = new FormData();
      formData.append('file', selectedFile as Blob);
    
      try {
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            'Content-Type': 'multipart/form-data',
          },
        });
    
        console.log('File uploaded successfully:', response.data);
        return `https://ipfs.io/ipfs/${response.data.IpfsHash}`
      } catch (error: any) {
        console.error('Error uploading file:', error.response?.data || error.message);
      }
    };

    const handleMetadataUri = async (metadata: any) => {
      try {
        const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            'Content-Type': 'application/json',
          },
        });
    
        console.log('Metadata uploaded successfully:', response.data);
        return `https://ipfs.io/ipfs/${response.data.IpfsHash}`
      } catch (error: any) {
        console.error('Error uploading metadata:', error.response?.data || error.message);
    }
  }
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const fileURL = URL.createObjectURL(file);
    setPreview(fileURL);
  };

  useEffect(() => {
      if(publicKey) {
      setToken2022Data({
        ...token2022Data,
        authorityWallet: publicKey.toBase58(),
        withdrawAuthority: publicKey.toBase58(),
      })
      }
      else {
        setToken2022Data({
          ...token2022Data,
          authorityWallet: "",
          withdrawAuthority: "",
      })
    }
  }, [publicKey]);

  const handleCreateCoin = async (isToken2022 = false) => {
    setPending(true)
    if (!connected || !publicKey || !signTransaction) {
      toast.error("Not connected wallet!");
      setPending(false)
      return;
    }
    const data = isToken2022 ? token2022Data : tokenData
    if (data.name == "") { setPending(false); return toast.error("Name cannot be empty");}
    if (data.symbol == "") {setPending(false); return toast.error("Symbol cannot be empty");}
    if (data.decimals == 0) {setPending(false); return toast.error("Decimals cannot be 0");}
    if (data.supply == 0) {setPending(false); return toast.error("Supply cannot be 0");}
    if (data.description == "") {
      setPending(false);
      return toast.error("Description cannot be empty");
    }
    if (!selectedFile) {setPending(false); return toast.error("File cannot be empty");}

    const imageUrl = await handleUploadImage();
    const metaData = {
      name: data.name,
      symbol: data.symbol,
      decimals: data.decimals,
      supply: data.supply,
      description: data.description,
      image: imageUrl,
      website: data.website,
      twitter: data.twitter,
      telegram: data.telegram,
      discord: data.discord
    }

    const metaDataWithCreator = {
      name: data.name,
      symbol: data.symbol,
      decimals: data.decimals,
      supply: data.supply,
      description: data.description,
      image: imageUrl,
      website: data.website,
      twitter: data.twitter,
      telegram: data.telegram,
      discord: data.discord,
      creator: creatorData
    }
    const metaDataUri = await handleMetadataUri(showSocialLinks ? metaDataWithCreator : metaData);
    if (!metaDataUri) return toast.error("Error uploading metadata");
    // Determine SOL transfer amount based on checked flags
    const checkedFlags = [
      freezeIsChecked,
      mintIsChecked,
      updateIsChecked,
      showCreatorLinks,
    ].filter(Boolean).length;
    let solAmount = checkedFlags > 0 ? checkedFlags * FEE_AMOUNT : 0;

    // if (checkedFlags === 1) solAmount = FEE_AMOUNT; // One flag checked
    // else if (checkedFlags === 2)
    //   solAmount = checkedFlags * FEE_AMOUNT; // Two flags checked
    // else if (checkedFlags === 3) solAmount = checkedFlags * FEE_AMOUNT; // All three checked
    // else if (checkedFlags == 4) solAmount = checkedFlags * FEE_AMOUNT;

    const balance = await connection.getBalance(publicKey);
    if (balance < solAmount * 1e9) {
      toast.error("Insufficient SOL balance");
      setPending(false);
      return;
    }

    // Upload metadata


    // Create transfer instruction
    const transferIx = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: PLATFORM_FEE_PUBKEY,
      lamports: solAmount * 1e9, // Convert SOL to lamports
    });

    const {
      mintKeypair,
      createIxs: allIxs,
    } = await createToken(
      publicKey,
      tokenData.name,
      tokenData.symbol,
      tokenData.decimals,
      tokenData.supply,
      tokenData.description,
      metaDataUri,
      tokenData.website,
      tokenData.twitter,
      tokenData.telegram,
      tokenData.discord,
      showCreatorLinks,
      creatorData.creatorName,
      creatorData.creatorSite,
      freezeIsChecked,
      mintIsChecked,
      updateIsChecked
    );

    const blockhash = (await connection.getLatestBlockhash("finalized"))
      .blockhash;
    const message = new TransactionMessage({
      payerKey: publicKey,
      instructions: solAmount > 0 ? [...allIxs, transferIx] : allIxs,
      recentBlockhash: blockhash,
    }).compileToV0Message();
    const transaction = new VersionedTransaction(message);
    transaction.sign([mintKeypair]);
    console.log(transaction.serialize().length)
    setPending(false)
    const signedTx = await signTransaction(transaction);
    const txSignature = await connection.sendTransaction(signedTx);
    console.log("token created successfully", txSignature);
    // toast.success("Token created successfully");
    await connection.confirmTransaction(txSignature, "finalized");
    setTxSignature(txSignature);
    toast.success(<div className="flex gap-1">
      <p>Successfully created.</p>
      <a href={`https://solscan.io/tx/${txSignature}`} target="_blink">
        <p className="text-green-500">View transaction</p>
      </a>
    </div>)
  };

  const handleCreateCoin22 = async () => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error("Not connected wallet!");
      return;
    }

    if (token2022Data.name == "") return toast.error("Name cannot be empty");
    if (token2022Data.symbol == "") return toast.error("Symbol cannot be empty");
    if (token2022Data.decimals == 0) return toast.error("Decimals cannot be 0");
    if (token2022Data.supply == 0) return toast.error("Supply cannot be 0");
    if (token2022Data.description == "")
      return toast.error("Description cannot be empty");
    if (!selectedFile) return toast.error("File cannot be empty");

    // Determine SOL transfer amount based on checked flags
    const checkedFlags = [
      freezeIsChecked,
      mintIsChecked,
      updateIsChecked,
      showCreatorLinks,
    ].filter(Boolean).length;
    let solAmount = checkedFlags > 0 ? checkedFlags * FEE_AMOUNT : 0;
    
    const balance = await connection.getBalance(publicKey);
    if (balance < solAmount * 1e9) {
      toast.error("Insufficient SOL balance");
      return;
    }

    const imageUrl = await handleUploadImage();
    const metaData = {
      name: token2022Data.name,
      symbol: token2022Data.symbol,
      decimals: token2022Data.decimals,
      supply: token2022Data.supply,
      description: token2022Data.description,
      image: imageUrl,
      website: token2022Data.website,
      twitter: token2022Data.twitter,
      telegram: token2022Data.telegram,
      discord: token2022Data.discord,
    }
    const metaDataUri = await handleMetadataUri(metaData);
    console.log("debug metadata Uri", metaDataUri)
    if(!metaDataUri) return toast.error("Error uploading metadata");
    const transferIx = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: PLATFORM_FEE_PUBKEY,
      lamports: solAmount * 1e9, // Convert SOL to lamports
    });

    const {
      mintKeypair,      
      createIxs: allIxs,
    } = await createToken22(
      publicKey,
      token2022Data.name,
      token2022Data.symbol,
      token2022Data.decimals,
      token2022Data.supply,
      token2022Data.description,
      metaDataUri,
      token2022Data.website,
      token2022Data.twitter,
      token2022Data.telegram,
      token2022Data.discord,
      token2022Data.transferFee,
      token2022Data.maxFee,
      token2022Data.authorityWallet,
      token2022Data.withdrawAuthority,
      creatorData.creatorName,
      creatorData.creatorSite,
      !freezeIsChecked,
      !mintIsChecked,
      !updateIsChecked,
      !isSetFeeAuthority
    );

    const blockhash = (await connection.getLatestBlockhash("finalized"))
      .blockhash;
    const message = new TransactionMessage({
      payerKey: publicKey,
      instructions: solAmount > 0 ? [...allIxs, transferIx] : allIxs,
      recentBlockhash: blockhash,
    }).compileToV0Message();
    const transaction = new VersionedTransaction(message);
    transaction.sign([mintKeypair]);
    const signedTx = await signTransaction(transaction);
    const txSignature = await connection.sendTransaction(signedTx);
    console.log("token created successfully", txSignature);
    toast.success("Token created successfully");
    await connection.confirmTransaction(txSignature, "finalized");
    setTxSignature(txSignature);
  } 


  const renderTokenForm = (isToken2022 = false) => (
    <div className="grid md:grid-cols-2 gap-8 w-full md:w-[90%] mx-auto">
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <label
          htmlFor="file-upload"
          className="border-2 border-dashed border-gray-700 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors"
        >
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
          {preview ? (
            <img
              src={preview || "/placeholder.svg"}
              alt="Uploaded preview"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <>
              <ImagePlus className="h-12 w-12 text-gray-500 mb-2" />
              <h3 className="text-lg font-medium text-cyan-400">Upload Image</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Most meme coins use a squared 1000x1000 logo</p>
            </>
          )}
        </label>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Add Social Links & Tags</h3>
            <Switch checked={showSocialLinks} onCheckedChange={setShowSocialLinks} />
          </div>
          {showSocialLinks && (
            <div className="space-y-4">
              {["Website", "Twitter", "Telegram", "Discord"].map((social) => (
                <div key={social}>
                  <Label className="text-gray-300">{social}</Label>
                  <Input
                    onChange={(e) =>
                      isToken2022
                        ? setToken2022Data({ ...token2022Data, [social.toLowerCase()]: e.target.value })
                        : setTokenData({ ...tokenData, [social.toLowerCase()]: e.target.value })
                    }
                    placeholder={`${social} URL`}
                    className="bg-[#242424] border-gray-700 text-white focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {["Name", "Symbol", "Decimals", "Supply", "Description"].map((field) => (
          <div key={field}>
            <Label className="text-gray-300">
              {field}
              <span className="text-red-500">*</span>
            </Label>
            {field === "Description" ? (
              <Textarea
                className="bg-[#242424] border-gray-700 text-white min-h-[100px] focus:border-cyan-500 focus:ring-cyan-500"
                value={isToken2022 ? token2022Data[field.toLowerCase() as keyof typeof token2022Data] : tokenData[field.toLowerCase() as keyof typeof tokenData]}
                onChange={(e) =>
                  isToken2022
                    ? setToken2022Data({ ...token2022Data, [field.toLowerCase()]: e.target.value })
                    : setTokenData({ ...tokenData, [field.toLowerCase()]: e.target.value })
                }
              />
            ) : (
              <Input
                type={field === "Decimals" || field === "Supply" ? "number" : "text"}
                placeholder={`Token ${field}`}
                value={isToken2022 ? token2022Data[field.toLowerCase() as keyof typeof token2022Data] : tokenData[field.toLowerCase() as keyof typeof tokenData]}
                onChange={(e) =>
                  isToken2022
                    ? setToken2022Data({
                        ...token2022Data,
                        [field.toLowerCase()]:
                          field === "Decimals" || field === "Supply" ? Number.parseInt(e.target.value) : e.target.value,
                      })
                    : setTokenData({
                        ...tokenData,
                        [field.toLowerCase()]:
                          field === "Decimals" || field === "Supply" ? Number.parseInt(e.target.value) : e.target.value,
                      })
                }
                className="bg-[#242424] border-gray-700 text-white focus:border-cyan-500 focus:ring-cyan-500"
              />
            )}
            {field === "Decimals" && <p className="text-sm text-gray-500 mt-1">Most meme coins use 9 decimals</p>}
            {field === "Supply" && <p className="text-sm text-gray-500 mt-1">Most meme coins use 10B</p>}
          </div>
        ))}
        {isToken2022 && (
          <>
            <div>
                <Label className="text-gray-300">Transfer Fee (%)</Label>
                <Input
                  type={"number"}
                  placeholder={"Transfer Fee"}
                  value={token2022Data.transferFee}
                  onChange={(e) => {
                    setToken2022Data({
                      ...token2022Data,
                      transferFee: Number.parseFloat(e.target.value)
                    })
                    }
                  }
                  className="bg-[#242424] border-gray-700 text-white focus:border-cyan-500 focus:ring-cyan-500"
                />
            </div>
            <div>
              <Label className="text-gray-300">Max Fee (tokens)</Label>
              <Input
                type={"number"}
                placeholder={"Max Fee"}
                value={token2022Data.maxFee}
                onChange={(e) => {
                  setToken2022Data({
                    ...token2022Data,
                    maxFee: Number.parseFloat(e.target.value)
                  })
                  }
                }
                className="bg-[#242424] border-gray-700 text-white focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div>
              <Label className="text-gray-300">Withdraw Authority</Label>
              <Input
                type={"text"}
                placeholder={"Withdraw Authority"}
                value={token2022Data.withdrawAuthority}
                onChange={(e) => {
                  setToken2022Data({
                    ...token2022Data,
                    withdrawAuthority: e.target.value
                  })
                  }
                }
                className="bg-[#242424] border-gray-700 text-white focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-300">Transfer Fee Config Authority </Label>
                <div className="flex items-center gap-2">
                  <Switch checked={isSetFeeAuthority} onCheckedChange={setIsSetFeeAuthority} />
                  <span className="text-sm text-gray-500">(+0.01 SOL)</span>
                </div>
              </div>
              {!isSetFeeAuthority && <p className="text-sm text-gray-500 mb-4"> Transfer fee authority is revoked as default</p>}
              {isSetFeeAuthority && <Input
                type={"text"}
                placeholder={"Authority Wallet"}
                value={token2022Data.authorityWallet}
                onChange={(e) => {
                  setToken2022Data({
                    ...token2022Data,
                    authorityWallet: e.target.value
                  })
                  }
                }
                className="bg-[#242424] border-gray-700 text-white focus:border-cyan-500 focus:ring-cyan-500"
              />}
            </div>
          </>
        )}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-gray-300">Modify Creator Information </Label>
            <div className="flex items-center gap-2">
              <Switch checked={showCreatorLinks} onCheckedChange={setShowCreatorLinks} />
              <span className="text-sm text-gray-500">(+0.01 SOL)</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Change the information of the creator in the metadata.
          </p>
          <div className="space-y-4">
            {["Creator Name", "Creator Website"].map((field) => (
              <Input
                key={field}
                disabled={!showCreatorLinks}
                onChange={(e) =>
                  setCreatorData({
                    ...creatorData,
                    [field.toLowerCase().replace(/\s/g, "")]: e.target.value,
                  })
                }
                placeholder={field}
                className="bg-[#242424] border-gray-700 text-white focus:border-cyan-500 focus:ring-cyan-500"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAdvancedOptions = () => (
    <div className="mt-10 w-full md:w-[90%] mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Advanced Options</h2>
      <h3 className="text-lg font-medium text-white mb-2">Revoke Authorities</h3>
      <p className="text-sm text-gray-400 mb-4">
        Solana Token has 3 authorities: Freeze Authority, Mint Authority, and Update Authority. Revoke them to attract
        more investors.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Revoke Freeze",
            description: "Freeze Authority allows you to freeze token accounts of holders.",
            state: freezeIsChecked,
            setState: setFreezeIsChecked,
          },
          {
            title: "Revoke Mint",
            description: "Mint Authority allows you to mint more supply of your token.",
            state: mintIsChecked,
            setState: setMintIsChecked,
          },
          {
            title: "Revoke Update",
            description: "Update Authority allows you to update the token metadata.",
            state: updateIsChecked,
            setState: setUpdateIsChecked,
          },
        ].map((item) => (
          <div key={item.title} className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4">
            <h4 className="text-sm font-medium text-white mb-2">{item.title}</h4>
            <p className="text-xs text-gray-400 mb-4">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">+0.01 SOL</span>
              <Switch checked={item.state} onCheckedChange={item.setState} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="w-full lg:w-[80%] lg:mx-auto lg:mt-28 xl:mt-4 pt-12 pb-10 px-6 rounded-xl">
      <h1 className="text-4xl font-bold text-center text-cyan-400 mb-4">Create Solana Token</h1>
      <p className="text-center text-gray-400 mb-8">
        Easily Create your own Solana SPL Token in just 8 steps without Coding.
      </p>

      {/* <div className="mb-8 w-full md:w-[80%] lg:w-[50%] mx-auto">
        <div className="flex space-x-1 rounded-xl bg-[#1a1a1a] p-1">
          <button
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
              activeTab === "standard"
                ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow"
                : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
            }`}
            onClick={() => setActiveTab("standard")}
          >
            SPL Standard Token
          </button>
          <button
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
              activeTab === "token2022"
                ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow"
                : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
            }`}
            onClick={() => setActiveTab("token2022")}
          >
            SPL Token 2022
          </button>
        </div>
      </div> */}

      {activeTab === "standard" && (
        <>
          {renderTokenForm()}
          {renderAdvancedOptions()}
          <div className="mt-10 flex justify-center">
            {connected && (
              <button
                onClick={() => handleCreateCoin()}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-600 text-white font-bold"
                disabled={pending}
              >
                Create Standard SPL Token
              </button>
            )}
            {!connected && <WalletButton className="flex bg-purple-600 hover:bg-purple-700" />}
          </div>
        </>
      )}

      {activeTab === "token2022" && (
        <>
          {renderTokenForm(true)}
          {renderAdvancedOptions()}
          <div className="mt-10 flex justify-center">
            {connected && (
              <button
                onClick={() => handleCreateCoin22()}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-600 text-white font-bold"
                disabled={pending}
              >
                Create SPL Token 2022
              </button>
            )}
            {!connected && <WalletButton className="flex bg-purple-600 hover:bg-purple-700" />}
          </div>
        </>
      )}

      <div className="w-full md:w-[90%] mt-10 rounded-xl space-y-8 mx-auto">
        <h1 className="text-gradient text-3xl lg:text-4xl font-bold text-center text-white">
          How to use Solana Token Creator
        </h1>
        <div className="flex flex-col lg:flex-row items-stretch gap-8">
          <div className="w-full bg_glass rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Follow these simple steps:</h2>
            <ol className="list-decimal space-y-3 text-gray-300 pl-5">
              <li>Connect your Solana wallet.</li>
              <li>Write the name you want for your Token.</li>
              <li>Indicate the symbol (max 8 characters).</li>
              <li>Select the decimals quantity (0 for Whitelist Token, 6 for utility token).</li>
              <li>Write the description you want for your SPL Token.</li>
              <li>Upload the image for your token (PNG).</li>
              <li>Put the supply of your Token.</li>
              <li>Click on "Create," accept the transaction, and wait until your token is ready.</li>
            </ol>
          </div>
        </div>
        {/* <div className="bg_glass rounded-xl p-6 lg:p-8 text-gray-300 text-sm space-y-4">
          <p>
            The cost of creating the Token is <span className="text-gradient font-bold">0.01 SOL</span>, which includes
            all fees needed for the SPL Token creation.
          </p>
          <p>
            The creation process will start and will take some seconds. After that, you will receive the total supply of
            the token in the wallet you chose.
          </p>
          <p>
            Check here a whole blog post about{" "}
            <a href="#" className="text-gradient underline">
              how to create a Solana Token
            </a>
          </p>
        </div> */}
      </div>
    </div>
  )
}
