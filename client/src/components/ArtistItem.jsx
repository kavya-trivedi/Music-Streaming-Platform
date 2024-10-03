// ArtistItem.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'

const ArtistItem = ({image,name,id}) => {

    const navigate = useNavigate()

  return (
    <div onClick={()=>navigate(`/artists/${id}`)} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
      <img className='rounded-full w-[150px] h-[150px]' src={image} alt="Image" />
      <p className='font-bold mt-2 mb-1'>{name}</p>
    </div>
  )
}

export default ArtistItem
