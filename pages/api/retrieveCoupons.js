import { keccak256, toBuffer, ecsign, bufferToHex } from 'ethereumjs-util';
import { ethers } from 'ethers';
const fs = require('fs')

export default function handler(req, res) {
  
  let {type} = req.query
 
  if (type === undefined){
    res.status(400).json({message:'Error: Invalid Request - "type" is a required parameter'})
    return
  }
  if (type !== "auction" && type !== "offer"){
    res.status(400).json({message:'Error: Invalid Request - valid "type" values are "auction" and "offer"'})
    return
  }  
  
  // Prepare an empty coupons object to store our coupons
  let coupons = {};
  
  /**
   * * signerPvtKeyString
   * Private key generated from ethers.Wallet.createRandom() - stored as a non-public environment variable
   * @notice The address used in your Smart Contract to verify the coupon must be the public address associated with this key  
   */
  const signerPvtKeyString = process.env.COUPON_SIGNING_KEY || ""
  const signerPvtKey = Buffer.from(signerPvtKeyString, "hex")
  
  /**
   * * addressList
   * The JSON objects of addresses and their associated allotted mints
   * @notice The JSON structure should be: key = wallet address (string), value = allotted mints (int)
   * @example: {"0x123456789...":2,"0x987654321...":10}
   */
  let addressList = require('/lib/auctionList.json')
  
  // Enumerated value; this should match the struct variable in your Smart Contract
  const CouponTypeEnum = {
    Auction: 0,
    Offer: 1
  }

  // HELPER FUNCTIONS
  /**
   * * createCoupon
   * @param {hash} hash 
   * @param {hex} signerPvtKey 
   * @returns ECDSA signature of a message hash.
   * @notice The ECDSA (Elliptic Curve Digital Signature Algorithm) is a cryptographically 
   *   secure digital signature scheme, based on the elliptic-curve cryptography (ECC).
   */
  function createCoupon(hash, signerPvtKey) {
    return ecsign(hash, signerPvtKey);
  }

  /**
   * * generateHashBuffer
   * @param {array} typesArray 
   * @param {array} valueArray 
   * @returns a keccak256 hash
   * @notice Keccak256 is a cryptographic function built into solidity. This function 
   *   takes in any amount of inputs and converts it to a unique 32 byte hash.
   */
  function generateHashBuffer(typesArray, valueArray) {
    return keccak256(
      toBuffer(ethers.utils.defaultAbiCoder.encode(typesArray,valueArray))
    )
  }

  /**
   * * serializeCoupon
   * @param {coupon} coupon 
   * @returns a serialized object
   */
  function serializeCoupon(coupon) {
    return {
      r: bufferToHex(coupon.r),
      s: bufferToHex(coupon.s),
      v: coupon.v,
    }
  }


  /**
   * * generateCoupons
   * @dev This function iterates through a list of addresses, converting them
   * to a signed hash of the coupon details and writing them out to a JSON file
   */
  const generateCoupons = () => {
    try {
      // Iterate through addresses list
      for ( const [address, auctionWinner] of Object.entries(addressList) ) {
        console.log(auctionWinner["tokenId"])
        // Verify that the address is a valid address (many presale/allowlist signups include invalid addresses)
        if (ethers.utils.isAddress(address)){

          // Set userAddress to a Checksum Address of the address
          // If address is an invalid 40-nibble HexString or if it contains mixed case 
          //   and the checksum is invalid, an INVALID_ARGUMENT Error is thrown.
          // The value of address may be any supported address format.
          const nftAddress = ethers.utils.getAddress(address);
        
          // Set our Coupon Type
          let couponType
          switch(type) {
            case "auction":
                couponType = CouponTypeEnum["Auction"]
                break;
            case "offer":
                couponType = CouponTypeEnum["Offer"]
                break;
          }

          // Call our helper function to generate the hash buffer 
          const hashBuffer = generateHashBuffer(
            ["uint256", "uint256", "uint256", "address", "address"],
            [couponType, auctionWinner["tokenId"], auctionWinner["bidPrice"], auctionWinner["winner"], nftAddress]
          );
        
          // Call our helper function to sign our hashed buffer and create the coupon
          
          
          const coupon = createCoupon(hashBuffer, signerPvtKey);

          // Add the wallet address with allotted mints and coupon to our coupons object
          coupons = {
            couponType: couponType,
            nftAddress: nftAddress,
            tokenId: auctionWinner["tokenId"],
            bidPrice: auctionWinner["bidPrice"],
            winner: auctionWinner["winner"],
            coupon: serializeCoupon(coupon)
          }
        } else {
          // Kick out a log of addresses that were flagged as invalid
          console.log(address + ': Invalid Address')
        }
      }

      // Convert our coupons object to a readable string
      const writeData = JSON.stringify(coupons, null, 2);

      // Write our coupons to a new presaleCoupons.json file
      fs.writeFileSync(`coupons/auctionCoupons.json`, writeData);

    } catch (err) {
      // Log any errors
      console.error(err)
      res.status(500).json({ message: err })
    }
  }

  // Call our generateCoupons function
  generateCoupons();

  res.status(200).json({ message: `Success! Your file has successfully been written to /coupons/auctionCoupons.json` })
}
