const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
    let marketplace, simpleNFT, owner, addr1, addr2, addr3;

    beforeEach(async () => {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
        simpleNFT = await SimpleNFT.deploy();
        await simpleNFT.waitForDeployment();
        
        const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
        marketplace = await NFTMarketplace.deploy();
        await marketplace.waitForDeployment();

        expect(simpleNFT.target).to.not.be.null;
        expect(marketplace.target).to.not.be.null;
    });

    it("Should create a listing", async () => {

        await simpleNFT.connect(addr1).mintNFT([addr2.address], [500]);
        const tokenId = 1;

        await simpleNFT.connect(addr1).setApprovalForAll(marketplace.target, true);

        const price = ethers.parseEther("1");
        await expect(
            marketplace.connect(addr1).createListing(simpleNFT.target, tokenId, price)
        )
            .to.emit(marketplace, "ListingCreated")
            .withArgs(1, addr1.address, simpleNFT.target, tokenId, price);

        const listing = await marketplace.listings(1);
        expect(listing.seller).to.equal(addr1.address);
        expect(listing.nftContract).to.equal(simpleNFT.target);
        expect(listing.tokenId).to.equal(tokenId);
        expect(listing.price).to.equal(price);
    });

    it("Should allow buying from listing and pay royalties", async () => {
        await simpleNFT.connect(addr1).mintNFT([addr2.address], [500]);
        const tokenId = 1;

        await simpleNFT.connect(addr1).setApprovalForAll(marketplace.target, true);
        console.log("123")
        const price = ethers.parseEther("1");
        console.log(price)
        await marketplace.connect(addr1).createListing(simpleNFT.target, tokenId, price)
        console.log("123")
        await expect(
            marketplace.connect(addr3).buyFromListing(1, { value: price })
        )
            .to.emit(marketplace, "ListingPurchased")
            .withArgs(1, addr3.address, price, ethers.parseEther("0.05"));
    
        const balanceSeller = await ethers.provider.getBalance(addr1.address);
        const balanceRoyaltyRecipient = await ethers.provider.getBalance(addr2.address);
    
        expect(await simpleNFT.ownerOf(tokenId)).to.equal(addr3.address);
    });        

    it("Should allow buying full ownership and remove royalties", async () => {

        await simpleNFT.connect(addr1).mintNFT([addr2.address], [500]);
        const tokenId = 1;

        await simpleNFT.connect(addr1).setApprovalForAll(marketplace.target, true);

        const price = ethers.parseEther("1");
        await marketplace.connect(addr1).createListing(simpleNFT.target, tokenId, price);

        await expect(
            marketplace.connect(addr3).buyFullOwnership(1, { value: price })
        )
            .to.emit(marketplace, "FullOwnershipPurchased")
            .withArgs(1, addr3.address, price, ethers.parseEther("0.05"));

        const [recipients, percentages] = await simpleNFT.getRoyaltyInfo(tokenId);
        expect(recipients).to.be.empty;
        expect(percentages).to.be.empty;

        expect(await simpleNFT.ownerOf(tokenId)).to.equal(addr3.address);
    });

    it("Should allow deleting a listing", async () => {

        await simpleNFT.connect(addr1).mintNFT([addr2.address], [500]);
        const tokenId = 1;

        await simpleNFT.connect(addr1).setApprovalForAll(marketplace.target, true);

        const price = ethers.parseEther("1");
        await marketplace.connect(addr1).createListing(simpleNFT.target, tokenId, price);

        await expect(marketplace.connect(addr1).deleteListing(1))
            .to.emit(marketplace, "ListingDeleted")
            .withArgs(1);

        const listing = await marketplace.listings(1);
        expect(listing.price).to.equal(0);
    });

    it("Should not allow non-seller to delete listing", async () => {

        await simpleNFT.connect(addr1).mintNFT([addr2.address], [500]);
        const tokenId = 1;

        await simpleNFT.connect(addr1).setApprovalForAll(marketplace.target, true);

        const price = ethers.parseEther("1");
        await marketplace.connect(addr1).createListing(simpleNFT.target, tokenId, price);

        await expect(marketplace.connect(addr3).deleteListing(1)).to.be.revertedWith("Not the seller");
    });
});
