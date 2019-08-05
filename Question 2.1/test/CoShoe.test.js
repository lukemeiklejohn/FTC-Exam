// Tests helpers
const {
    EVMRevert
} = require('./helpers/EVMRevert');
const {
    assertRevert
} = require('./helpers/assertRevert');
const {
    sendTransaction
} = require('./helpers/sendTransaction');
const advanceBlock = require("./helpers/advanceToBlock");
const {
    increaseTimeTo,
    duration
} = require('./helpers/increaseTime');
const latestTime = require("./helpers/latestTime");
const _ = require("lodash");
const BigNumber = web3.BigNumber;

// Libraries
require("chai")
    .use(require("chai-as-promised"))
    .use(require("chai-bignumber")(BigNumber))
    .should();

const CoShoe = artifacts.require("./CoShoe.sol");

contract("CoShoe", (accounts) => {
    const shoeSupplier = accounts[0]
    const shoeBuyer = accounts[1]

    before(async function () {
        shopregistry = await CoShoe.new({
            from: shoeSupplier
        });
    });

    context("Deployment", function () {
        it("Mints 100 tokens correctly", async () => {
            let balance = await shopregistry.balanceOf(shoeSupplier);
            assert(balance.toNumber(),100)
        })
    })

    context("Buying shoes", function () {
        it("Correctly transfers ownership, changes information, updates counter", async () => {
            let balanceBefore = await shopregistry.shoesSold()
            await shopregistry.buyShoe("Shoe_Name", "Shoe_Url", {
                from: shoeBuyer,
                value: web3.utils.toWei('0.5', 'ether'),
            })
            let balanceAfter = await shopregistry.shoesSold()

            let newOwner = await shopregistry.shoes(balanceAfter)

            let shoeDetails = await shopregistry.shoes(balanceAfter)

            assert(newOwner.owner, shoeBuyer, "Ownership not transferred")
            assert(shoeDetails.name, "Shoe_Name", "Shoe name not changed")
            assert(shoeDetails.image, "Shoe_Url", "Shoe image not changed")
            assert(balanceBefore, balanceAfter, "Counter not adjusted")
        })

        it("Reverts if wrong price is specified", async () => {
            await assertRevert(shopregistry.buyShoe("Shoe_Name", "Shoe_Url", {
                from: shoeBuyer,
                value: web3.utils.toWei('0.2', 'ether'),
            }), EVMRevert)
        })
    })

    context("Checking purchases", function () {
        it("Correctly returns the right number of purchases", async () => {
            // lets purchase another shoe first
            await shopregistry.buyShoe("Shoe2", "Shoe_Url2", {
                from: shoeBuyer,
                value: web3.utils.toWei('0.5', 'ether'),
            })
            let purchasesArray = await shopregistry.checkPurchases({from: shoeBuyer})

            assert(purchasesArray[0]==false, "Owned status is not correct")
            assert(purchasesArray[1]==purchasesArray[2]==true, "Owned status is not correct")
            for (i = 3; i < 100; i++) {
                assert(purchasesArray[i]==false, "Owned status is not correct")
            }
        })
    })
})