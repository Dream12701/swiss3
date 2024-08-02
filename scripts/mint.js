const hre = require("hardhat");
const { encryptDataField } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
    const rpcLink = hre.network.config.url;
    const [encryptedData] = await encryptDataField(rpcLink, data);
    return await signer.sendTransaction({
        from: signer.address,
        to: destination,
        data: encryptedData,
        value,
    });
};

async function main() {
    const contractAddress = "0x4fE07Bbba736a930A72765764FE714bE1DC5771c";
    const [signer] = await hre.ethers.getSigners();
    const contractFactory = await hre.ethers.getContractFactory("TestNFT");
    const contract = contractFactory.attach(contractAddress);
    const functionName = "safeMint";

    // Prepare and send the mint transaction
    try {
        const safeMintTx = await sendShieldedTransaction(
            signer,
            contractAddress,
            contract.interface.encodeFunctionData(functionName, [signer.address]),
            0
        );
        await safeMintTx.wait();
        console.log(`Transaction URL of Mint: https://explorer-evm.testnet.swisstronik.com/tx/${safeMintTx.hash}`);
    } catch (error) {
        console.error("Error while minting:", error);
        process.exitCode = 1;
    }
}

// Execute the main function
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
