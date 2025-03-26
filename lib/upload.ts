import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK(
  process.env.NEXT_PUBLIC_PINATA_API_KEY,
  process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY
);

export default async function uploadData(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { file } = req.body; // Assuming you're sending the file data in the request body

      // Upload the file to Pinata
      const result = await pinata.pinFileToIPFS(file, {
        pinataMetadata: {
          name: 'MyFile', // Optional: Add metadata
        },
        pinataOptions: {
          cidVersion: 0, // Optional: Set CID version
        },
      });

      res.status(200).json({ success: true, cid: result.IpfsHash });
    } catch (error) {
      console.error('Error uploading file to Pinata:', error);
      res.status(500).json({ success: false, error: 'Failed to upload file' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}