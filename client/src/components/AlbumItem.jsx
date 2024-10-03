// AlbumItem.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'

const AlbumItem = ({image,name,id}) => {

    const navigate = useNavigate()

  return (
    <div onClick={()=>navigate(`/albums/${id}`)} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
      <img className='rounded' src={image} alt="Image" />
      <p className='font-bold mt-2 mb-1'>{name}</p>
    </div>
  )
}

export default AlbumItem
