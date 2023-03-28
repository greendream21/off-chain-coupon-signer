# nft-sig-verify

## install the dependancies
npm install
## run on the local
### npm run dev

### In the .env file, you should add the PK of the auction contract owner into "COUPON_SIGNING_KEY" and auction contract address into "COUPON_PUBLIC_KEY".

Coupon generator input format<br />
<br />
const hashBuffer = generateHashBuffer( <br />
    ["uint256", "uint256", "uint256", "address", "address"], <br />
    [couponType, tokenId, bidPrice, winner, nftAddress] <br />
); <br />

- couponType: 0 for auction, 1 for offer
- tokenId
- bidPrice: the price what the bidder place (it will be 9-decimals)
- winner: winner of auction/offer
- nftAddress
