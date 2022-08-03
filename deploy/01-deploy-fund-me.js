// import
// main function
// calling of main function

// async function deployFunc(hre) {
//   console.log("HI!")
//   hre.getNameAccounts()
//   hre.deployments
// }
// module.exports.default = deployFunc;

// module.exports = async (hre) => {
// const { getNamedAccounts, deployments } = hre

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chain id is X, then address Y
    // if chain id is Z, then address A

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    // if the contract does not exist, we deploy a minimal version of it
    // for our local testing
    // well what happens if we want to change to different chains
    // for localhost or hardhat network we want to use a mock
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address here
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-------------------------------------------------")
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "fundme"]
