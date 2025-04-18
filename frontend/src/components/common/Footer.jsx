import React from 'react'
import { Link } from 'react-router-dom';
import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io";
import { RiTwitterXLine } from "react-icons/ri";
import { FiPhoneCall } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className='border-t py-12'>
        <div className='container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0'>
            {/* Newsletter */}
            <div className='flex flex-col ml-5'>
                <h3 className='text-lg text-gray-800 mb-4'>Newsletter</h3>
                <p className='text-gray-500 mb-4'>
                    Be the first to hear about new products, exclusive events and online offers.
                </p>
                <p className='font-medium text-sm text-gray-600 mb-6'>Sign up and get 20% off on your first Giftify order!</p>
                <form className='flex w-full max-w-md'>
                    <input type="email" placeholder='Enter your email' 
                    className='p-3 flex-grow text-sm border border-gray-300
                    rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all'
                    required />
                    <button type='submit' className='bg-black text-white px-6 py-3 text-sm
                    rounded-r-md hover:bg-gray-500 transition-all'>Subscribe</button>
                </form>
            </div>
            
            {/* Discover Links */}
            <div>
                <h3 className='text-lg text-gray-800 mb-4 ml-4'>Discover</h3>
                <ul className='space-y-2 text-gray-600 ml-4'>
                    {['Decor', 'Tech & Gadgets', 'Kids', 'Pet Love', 'Travel & Adventure', 'Sports', 'Books', 'Fashion & Accessories'].map((item, index) => (
                        <li key={index}>
                            <Link to='/collections/all' className='hover:text-gray-600 transition-colors'>{item}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Support Links */}
            <div>
                <h3 className='text-lg text-gray-800 mb-4 ml-4'>Support</h3>
                <ul className='space-y-2 text-gray-600 ml-4'>
                    {['Contact Us', 'About Us', 'FAQs', 'Features'].map((item, index) => (
                        <li key={index}>
                            <Link to='#' className='hover:text-gray-600 transition-colors'>{item}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Follow Us */}
            <div className='flex flex-col'>
                <h3 className='text-lg text-gray-800 mb-4 ml-4'>Follow Us</h3>
                <div className='flex items-center space-x-4 mb-6 ml-4'>
                    <a href="#" className='hover:text-gray-500'><TbBrandMeta className='h-5 w-5'/></a>
                    <a href="#" className='hover:text-gray-500'><IoLogoInstagram className='h-5 w-5'/></a>
                    <a href="#" className='hover:text-gray-500'><RiTwitterXLine className='h-5 w-5'/></a>
                </div>
                <div className='flex items-center space-x-2 ml-4'>
                    <FiPhoneCall className='h-5 w-5 text-gray-600'/>
                    <div>
                        <p className='text-gray-800 text-sm'>Call Us</p>
                        <p className='text-gray-800 font-medium'>7219688335</p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Footer Bottom */}
        <div className='container mx-auto mt-12 px-4 lg:px-0 border-t border-gray-200 pt-6'>
            <p className='text-gray-500 text-sm tracking-tighter text-center'>
                2025, Giftify. All Rights Reserved.
            </p>
        </div>
    </footer>
  )
}

export default Footer;
