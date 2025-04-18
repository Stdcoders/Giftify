import React from 'react'
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className='relative'>
      <video
        className="w-full h-[400px] md:h-[600px] lg:h-[750px] object-cover"
        autoPlay
        muted
        loop
        playsInline
        style={{ height: '500px', objectFit: 'cover' }}
      >
        <source
          src="https://cdn.pixabay.com/video/2024/12/09/245753_large.mp4"
          type="video/mp4"
        />
        {/* Fallback image in case video doesn't load */}
        <img
          src="https://cdn.pixabay.com/photo/2021/11/29/15/01/christmas-6832802_1280.jpg"
          alt="Gift collection"
          className="w-full h-full object-cover"
        />
      </video>
      <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
        <div className='text-center text-white p-6'>
          <p className='text-[35px] md:text-7xl font-bold tracking-tighter 
              uppercase md-4'>Explore<br />our range of gifts!</p>
          <br />
          <Link
            to="/collections/all"
            className='bg-white text-gray-950 px-6 py-2
                rounded-sm text-lg hover:text-white hover:bg-blue-950 transition-colors duration-300'
          >
            Discover Now!
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
