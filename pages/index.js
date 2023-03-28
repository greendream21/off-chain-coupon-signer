import { useState } from 'react'

export default function Home() {

  const [message,setMessage] = useState('')

  const retrieveCoupons = (type) => {
    fetch(`/api/retrieveCoupons?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        alert(data.message)
        setMessage(data.message)
      })
    
  }

  return (
    <div className="text-center">
      <h1 className="text-8xl font-bold uppercase text-center">Coupon Signer</h1>
      <button 
        type="button"
        onClick={()=>retrieveCoupons("auction")}
        className="text-white inline-block mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
      >
        Retrieve Auction Coupons
      </button>
      <button 
        type="button"
        onClick={()=>retrieveCoupons("offer")}
        className="text-white inline-block mt-8 bg-gradient-to-r from-red-500 to-purple-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
      >
        Retrieve Offer Coupons
      </button>
      <div className="mt-20 text-center"></div>
    </div>
  )
}
