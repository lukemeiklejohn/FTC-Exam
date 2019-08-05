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

const CoToken = artifacts.require("./CoToken.sol");

contract("CoToken", (accounts) => {
    const registryOwner = accounts[0]
    const tokenBuyer = accounts[1]

    before(async function () {
        // we mint 100 tokens on deployment of the contract
        registry = await CoToken.new('CoToken', 'COT', 2, {
            from: registryOwner
        });
    });

    it("Mints tokens correctly", async () => {
        // let tokenSupplyBefore = await registry.totalSupply()
        let accountBalanceBefore = await registry.balanceOf(tokenBuyer)
        // now mint a token
        await registry.mint(1, {
            from: tokenBuyer,
            value: web3.utils.toWei('0.2', 'ether')
        })
        // let tokenSupplyAfter = await registry.totalSupply()
        let accountBalanceAfter = await registry.balanceOf(tokenBuyer)
        assert(accountBalanceAfter.toNumber() == accountBalanceBefore.toNumber() + 1, "Account balance didn't increase")

        // lets check that the price has increased
        let priceAfter = await registry.buyPrice(1)
        let expectedPrice = web3.utils.toWei('0.21', 'ether')
 
        assert(priceAfter, expectedPrice)
    });

    it("Reverts minting if incorrect value is sent", async () => {
        await assertRevert(registry.mint(1, {
            from: tokenBuyer,
            value: web3.utils.toWei('0.2', 'ether')
        }), EVMRevert)
    })

    it("Burns tokens correctly", async () => {
        
        let accountBalanceBefore = await registry.balanceOf(registryOwner)
        await registry.burn(1, {
            from: registryOwner
        })
        let accountBalanceAfter = await registry.balanceOf(registryOwner)
        assert(accountBalanceBefore.toNumber() - 1 == accountBalanceAfter.toNumber(), "Account balance didn't update")
    });

    it("Reverts if unauthorized user tries to burn a token", async () =>{
        await assertRevert(registry.burn(1, {
            from: tokenBuyer
        }), EVMRevert)
    })


    it ("Reverts if unauthoried user tries to destroy contract", async () => {
        await assertRevert(registry.destroy({from: tokenBuyer}), EVMRevert)
    })

    it("Reverts if owner tries to destroy contract without owning all tokens", async () => {
        await assertRevert(registry.destroy({from: registryOwner}), EVMRevert)
    })

    before(async function () {
        // lets deploy another contract, we mint 100 tokens to the owner on deployment
        registry2 = await CoToken.new('CoToken', 'COT', 2, {
            from: registryOwner
        });
    });

    it("Destroys the contract correctly", async () => {
        await registry2.destroy()
        let contractAddress = await registry2.address
        let contract = await web3.eth.getCode(contractAddress)
        assert(contract, '0x')
    })
    
})