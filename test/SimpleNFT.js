const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SimpleNFT Contract", function () {
    let simpleNFT, owner, addr1, addr2;

    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const SimpleNFTFactory = await ethers.getContractFactory("SimpleNFT");
        simpleNFT = await SimpleNFTFactory.deploy();
        await simpleNFT.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct default royalty", async () => {
            const [recipient, percentage] = await simpleNFT.royaltyInfo(1, 10000);
            expect(recipient).to.equal(owner.address);
            expect(percentage).to.equal(500);
        });

        it("Should initialize with the correct name and symbol", async () => {
            expect(await simpleNFT.name()).to.equal("SimpleNFT");
            expect(await simpleNFT.symbol()).to.equal("SNFT");
        });
    });

    describe("Minting", function () {
      it("Should mint a new token and assign metadata", async () => {
        const royaltyRecipients = [addr1.address, addr2.address];
        const royaltyPercentages = [300, 200];

        const tx = await simpleNFT.mintNFT(royaltyRecipients, royaltyPercentages);
        const receipt = await tx.wait();

        const mintEvent = receipt.logs
            .map((log) => simpleNFT.interface.parseLog(log))
            .find((parsedLog) => parsedLog.name === "Mint");

        expect(mintEvent).to.not.be.undefined;
    
        const tokenId = mintEvent.args.tokenId;

        const metadata = await simpleNFT.tokenMetadata(tokenId);
        expect(metadata.name).to.equal("Simple NFT");
        expect(metadata.description).to.equal("This is a simple NFT.");
        expect(metadata.imageHash).to.equal(123456789);
    });        

        it("Should fail if royalty percentages do not sum to <= 100%", async () => {
            const royaltyRecipients = [addr1.address, addr2.address];
            const royaltyPercentages = [6000, 5000];

            await expect(
                simpleNFT.mintNFT(royaltyRecipients, royaltyPercentages)
            ).to.be.revertedWith("Total royalty exceeds 100%");
        });

        it("Should fail if recipients and percentages array lengths mismatch", async () => {
            const royaltyRecipients = [addr1.address];
            const royaltyPercentages = [500, 300];

            await expect(
                simpleNFT.mintNFT(royaltyRecipients, royaltyPercentages)
            ).to.be.revertedWith("Recipients and percentages mismatch");
        });
    });

    describe("Royalty Management", function () {
      it("Should allow removing royalty recipients", async () => {
        const royaltyRecipients = [addr1.address];
        const royaltyPercentages = [500];

        const tx = await simpleNFT.mintNFT(royaltyRecipients, royaltyPercentages);
        const receipt = await tx.wait();

        const mintEvent = receipt.logs
            .map((log) => simpleNFT.interface.parseLog(log))
            .find((parsedLog) => parsedLog.name === "Mint");
    
        expect(mintEvent).to.not.be.undefined;
    
        const tokenId = mintEvent.args.tokenId;

        await simpleNFT.removeRoyaltyRecipients(tokenId);

        const [recipients, percentages] = await simpleNFT.getRoyaltyInfo(tokenId);
        expect(recipients).to.be.an("array").that.is.empty;
        expect(percentages).to.be.an("array").that.is.empty;
    });        
    });

    describe("Interface Support", function () {
        it("Should support ERC721 and ERC2981 interfaces", async () => {
            expect(await simpleNFT.supportsInterface("0x80ac58cd")).to.be.true;
            expect(await simpleNFT.supportsInterface("0x2a55205a")).to.be.true;
        });
    });
});
