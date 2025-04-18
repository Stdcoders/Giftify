import React from 'react';
import { Link } from 'react-router-dom';

const Collection1 = () => {
    const decor = "https://www.vinoxo.in/9023-large_default/vinoxo-metal-simple-design-wall-art-decor-for-living-room-continuity-set-of-3.jpg";
    const fashion = "https://hips.hearstapps.com/hmg-prod/images/collection-of-trendy-silk-elastic-band-scrunchies-royalty-free-image-1716234835.jpg?crop=0.667xw:1.00xh;0.278xw,0&resize=640:*";
    
    return (
        <section className='py-16 px-4 lg:px-4'>
            <div className='container mx-auto flex flex-col md:flex-row gap-8'>
                {/* Decor */}
                <div className='relative flex-1'>
                    <img 
                        src={decor} 
                        alt="Decor" 
                        className='w-full h-[500px] md:h-[600px] lg:h-[700px] object-cover rounded-lg'
                    />
                    <div className='absolute bottom-8 left-8 bg-white bg-opacity-90 p-4 rounded-md'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-3'>Decor</h2>
                        <Link 
                            to='/collections/all?type=Decor' 
                            className='text-gray-900 underline'>
                            Shop Now!
                        </Link>
                    </div>
                </div>
                
                {/* Accessories */}
                <div className='relative flex-1'>
                    <img 
                        src={fashion} 
                        alt="Fashion & Accessories" 
                        className='w-full h-[500px] md:h-[600px] lg:h-[700px] object-cover rounded-lg'
                    />
                    <div className='absolute bottom-8 left-8 bg-white bg-opacity-90 p-4 rounded-md'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-3'>Fashion & Accessories</h2>
                        <Link 
                            to='/collections/all?type=Accessories' 
                            className='text-gray-900 underline'>
                            Shop Now!
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Collection1;
