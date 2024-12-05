# SimpleNFT and NFTMarketplace

This repository contains the Solidity implementation of an **NFT Smart Contract** (`SimpleNFT`) and an **NFT Marketplace Contract** (`NFTMarketplace`). These contracts allow the creation, minting, royalty management, and trading of NFTs.

### Features of SimpleNFT

- **ERC721 Standard**: Implements standard NFT functionality.
- **Custom Royalties**: Supports multiple royalty recipients with customizable percentages.
- **Metadata Storage**: Associates metadata with each token, including a name, description, and image hash.
- **Default Royalties**: Allows setting default royalty recipients and percentages.
- **Royalty Removal**: Owners can remove royalty recipients for a token.

### Features of NFTMarketplace

- **NFT Listings**: Allows users to list NFTs for sale.
- **Royalty Support**: Automatically calculates and distributes royalties to predefined recipients.
- **Full Ownership Purchase**: Buyers can purchase NFTs outright and remove associated royalties.
- **Reentrancy Guard**: Protects against reentrancy attacks.

## Requirements

Ensure you have the following installed before proceeding:

- [Node.js] (LTS version recommended)
- [npm] or [yarn]

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/rajat-bakale/MarketPlace.git
npm install
```

## Interaction
### Minting an NFT
Use the mintNFT function from the SimpleNFT contract to create a new NFT with custom royalty settings.

### Creating a Listing
Use the createListing function in the NFTMarketplace contract to list an NFT for sale. Ensure the contract is approved to transfer the NFT.

### Buying an NFT
Buyers can purchase NFTs using the buyFromListing or buyFullOwnership functions. If full ownership is purchased, royalty information is cleared.


## Events
### SimpleNFT
- **Mint**: Emitted when a new NFT is minted.

### NFTMarketplace
- **ListingCreated**: Emitted when a new listing is created.
- **ListingPurchased**: Emitted when an NFT is purchased.
- **FullOwnershipPurchased**: Emitted when an NFT is purchased with royalty removal.
- **ListingDeleted**: Emitted when a listing is deleted.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
