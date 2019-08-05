pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol";
import "./CoToken.sol";


contract CoShoe is ERC721Metadata {

    struct Shoe {
        address owner;
        string name;
        string image;
        bool sold;
    }
    uint public shoesSold = 0;

    Shoe[] public shoes;
    mapping(address => bool[100]) public shoeOwners;

    CoToken coTokenInstance = new CoToken(0, "CoToken", "COT", 2);

    constructor() public ERC721Metadata("CoShoe Token", "COS") {
        // The 0th shoe belongs to the shoeSeller/registry
        shoes.push(Shoe(msg.sender, "", "", false));
        for (uint i = 0; i < 100; i++) {
            _mint(msg.sender, i);
        }
    }

    function buyShoe(string memory _name, string memory _image) public payable {
        require(shoesSold < shoes.length, "All shoes have already been sold!");
        uint256 buyerBalance = coTokenInstance.balanceOf(msg.sender);
        require(buyerBalance >= 1, "Buyer doesn't own a CoToken");
        shoes.push(Shoe(msg.sender, _name, _image, true));
        shoesSold += 1;
        shoeOwners[msg.sender][shoesSold] = true;
        coTokenInstance.transferFrom(msg.sender, coTokenInstance._owner(), 1);
        if (coTokenInstance.balanceOf(msg.sender) != buyerBalance - 1) {
            revert("CoToken didn't transfer");
        }
    }


    function checkPurchases() public view returns (bool[100] memory) {
        return shoeOwners[msg.sender];
    }
}

