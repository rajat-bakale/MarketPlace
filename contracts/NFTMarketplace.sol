// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ISimpleNFT {
    function getRoyaltyInfo(uint256 tokenId) 
        external 
        view 
        returns (address[] memory recipients, uint256[] memory percentages);

    function removeRoyaltyRecipients(uint256 tokenId) external;
}

contract NFTMarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public listingCounter;

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );

    event ListingPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price,
        uint256 royaltyAmount
    );

    event FullOwnershipPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price,
        uint256 royaltyAmount
    );

    event ListingDeleted(uint256 indexed listingId);

    function createListing(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) external {
        require(_price > 0, "Price must be greater than zero");

        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)),
            "Contract not approved"
        );

        listingCounter++;
        listings[listingCounter] = Listing({
            seller: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            price: _price
        });

        emit ListingCreated(listingCounter, msg.sender, _nftContract, _tokenId, _price);
    }

    function buyFromListing(uint256 _listingId) external payable nonReentrant {
        Listing memory listing = listings[_listingId];
        require(listing.price > 0, "Listing does not exist");
        require(msg.value == listing.price, "Incorrect payment amount");

        ISimpleNFT nft = ISimpleNFT(listing.nftContract);
        (address[] memory recipients, uint256[] memory percentages) = nft.getRoyaltyInfo(listing.tokenId);

        uint256 totalRoyaltyAmount = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 royaltyAmount = (msg.value * percentages[i]) / 10000;
            totalRoyaltyAmount += royaltyAmount;
            payable(recipients[i]).transfer(royaltyAmount);
        }

        uint256 sellerAmount = msg.value - totalRoyaltyAmount;

        payable(listing.seller).transfer(sellerAmount);

        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        delete listings[_listingId];

        emit ListingPurchased(_listingId, msg.sender, listing.price, totalRoyaltyAmount);
    }

    function buyFullOwnership(uint256 _listingId) external payable nonReentrant {
        Listing memory listing = listings[_listingId];
        require(listing.price > 0, "Listing does not exist");
        require(msg.value == listing.price, "Incorrect payment amount");

        ISimpleNFT nft = ISimpleNFT(listing.nftContract);
        (address[] memory recipients, uint256[] memory percentages) = nft.getRoyaltyInfo(listing.tokenId);

        uint256 totalRoyaltyAmount = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 royaltyAmount = (msg.value * percentages[i]) / 10000;
            totalRoyaltyAmount += royaltyAmount;
            payable(recipients[i]).transfer(royaltyAmount);
        }

        uint256 sellerAmount = msg.value - totalRoyaltyAmount;

        payable(listing.seller).transfer(sellerAmount);

        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        nft.removeRoyaltyRecipients(listing.tokenId);

        delete listings[_listingId];

        emit FullOwnershipPurchased(_listingId, msg.sender, listing.price, totalRoyaltyAmount);
    }

    function deleteListing(uint256 _listingId) external {
        Listing memory listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.price > 0, "Listing does not exist");

        delete listings[_listingId];

        emit ListingDeleted(_listingId);
    }
}
