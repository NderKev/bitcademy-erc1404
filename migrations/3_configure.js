var RegulatedTokenERC1404 = artifacts.require("./RegulatedTokenERC1404.sol");
var RegulatorService = artifacts.require("./RegulatorService.sol");
var ServiceRegistry = artifacts.require("./ServiceRegistry.sol");
const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync("../.secret").toString().trim();
const provider = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io');

module.exports = async function(deployer, network, accounts) {
  let newOwner = "0xa8836881DCACE8bF1DaAC141A3dAbD9A4884dBFB"

  let from;
  if(network == 'local' || network == 'development')
    from = accounts[0]
  else
    from = provider.addresses[0]

  let rtoken = await RegulatedTokenERC1404.deployed();

  initSupply = "6830000"
  console.log("Minting initial supply of %s ...", initSupply)
  let tx = await rtoken.contract.methods.mint(newOwner, web3.utils.toWei(initSupply, 'ether')).send({from: from, gas: 150000})
  let balance = await rtoken.contract.methods.balanceOf(newOwner).call()
  console.log("Address %s, balance: %i", newOwner, web3.utils.fromWei(balance, 'ether'))

  console.log("RegulatedTokenERC1404 transferOwnership to...")
  await rtoken.contract.methods.transferOwnership(newOwner).send({from: from, gas: 150000})
  let owner = await rtoken.contract.methods.owner().call()
  console.log(owner)
  
  
  let regulatorService = await RegulatorService.deployed();

  console.log("Setting transfer permission for newOwner...")
  tx = await regulatorService.contract.methods.setPermission(rtoken.address, newOwner, 3).send({from: from, gas: 150000})
  console.log("Address: %s, Permission: %i", tx.events.LogPermissionSet.returnValues.participant, tx.events.LogPermissionSet.returnValues.permission)

  console.log("RegulatorService transferOwnership to...")
  await regulatorService.contract.methods.transferOwnership(newOwner).send({from: from, gas: 150000})
  owner = await regulatorService.contract.methods.owner().call()
  console.log(owner)


  let serviceRegistry = await ServiceRegistry.deployed();
  console.log("ServiceRegistry transferOwnership to...")
  tx = await serviceRegistry.contract.methods.transferOwnership(newOwner).send({from: from, gas: 150000})
  owner = await serviceRegistry.contract.methods.owner().call()
  console.log(owner)
  
  
};
