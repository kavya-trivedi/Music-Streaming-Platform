// SongItem.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'

const SongItem = ({name, image, id}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/songs/${id}`);
    }

    return (
        <div onClick={handleClick} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
            <img className='rounded' src={image} alt={name} />
            <p className='font-bold mt-2 mb-1'>{name}</p>
        </div>
    )
}

export default SongItem