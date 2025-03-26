import { TokenInfo } from "../manage-token/page";


let backendAddress = "http://localhost:5000";

const getRequest = async (endpoint: string) => {
    try {
        const dummyTokenInfo: TokenInfo = {
            name: "Dummy Token",
            symbol: "DUMMY",
            decimals: 9,
            mintAuthority: "DummyMintAuthority111111111111111111111111111",
            updateAuthority: "DummyUpdateAuthority11111111111111111111111",
            freezeAuthority: "DummyFreezeAuthority1111111111111111111111",
            tokenType: "SPL Token 2022",
            imageUri: "https://dd.dexscreener.com/ds-data/tokens/solana/BbgW6qvyELmPgWXopLd3Y6e7cNR7RpejdT3E9n42pump.png?size=lg&key=d4b1a0",
            supply: "1,000,000,000",
            currentFeePercent: 10
          }
        return dummyTokenInfo;
        const response = await fetch(`${backendAddress}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('GET request failed', error);
        throw error;
    }
};

const postRequest = async (endpoint: string, data: any) => {
    try {
        const response = await fetch(`${backendAddress}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('POST request failed', error);
        throw error;
    }
};

export { getRequest, postRequest };