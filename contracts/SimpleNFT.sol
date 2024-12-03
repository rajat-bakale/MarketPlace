// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract SimpleNFT is ERC721, ERC2981 {
    uint256 private _tokenIdCounter;

    struct Metadata {
        string name;
        string description; 
        uint256 imageHash; 
    }

    mapping(uint256 => Metadata) public tokenMetadata;

    struct CustomRoyaltyInfo {
        address[] recipients;
        uint256[] percentages;
    }
    mapping(uint256 => CustomRoyaltyInfo) private _tokenRoyalties;

    event Mint(address recipient, uint256 tokenId);

    constructor() ERC721("SimpleNFT", "SNFT") {
        _setDefaultRoyalty(msg.sender, 500);
        _tokenIdCounter = 0;
    }

    function mintNFT(
        address[] memory royaltyRecipients,
        uint256[] memory royaltyPercentages
    ) external returns (uint256) {
        require(royaltyRecipients.length == royaltyPercentages.length, "Recipients and percentages mismatch");
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < royaltyPercentages.length; i++) {
            totalPercentage += royaltyPercentages[i];
        }
        require(totalPercentage <= 10000, "Total royalty exceeds 100%");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);

        Metadata memory metadata = Metadata({
            name: 'Simple NFT',
            description: 'This is a simple NFT.',
            imageHash: 123456789
        });

        tokenMetadata[newTokenId] = metadata;

        _tokenRoyalties[newTokenId] = CustomRoyaltyInfo(royaltyRecipients, royaltyPercentages);

        emit Mint(msg.sender, newTokenId);

        return newTokenId;
    }

    function removeRoyaltyRecipients(uint256 tokenId) external {
        delete _tokenRoyalties[tokenId];
    }

    function getRoyaltyInfo(uint256 tokenId) 
        external 
        view 
        returns (address[] memory recipients, uint256[] memory percentages) 
    {
        CustomRoyaltyInfo memory royaltyInfo = _tokenRoyalties[tokenId];
        return (royaltyInfo.recipients, royaltyInfo.percentages);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
