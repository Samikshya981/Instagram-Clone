import React from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const REELS_DATA = [
  { id: 1, videoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60', likes: '1.2M', comments: '4K', author: 'cristiano' },
  { id: 2, videoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&auto=format&fit=crop&q=60', likes: '890K', comments: '1K', author: 'zuck' },
];

const Reels = () => {
  return (
    <div className='flex justify-center h-[calc(100vh-56px)] md:h-screen bg-black w-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide'>
      <div className='w-full max-w-sm flex flex-col'>
        {REELS_DATA.map((reel) => (
          <div key={reel.id} className='relative w-full h-[calc(100vh-56px)] md:h-screen snap-center flex-shrink-0 flex items-center justify-center bg-black'>
            <img 
              src={reel.videoUrl} 
              alt="reel" 
              loading="lazy"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500x900?text=Unavailable' }}
              className='w-full h-full object-cover' 
            />
            
            {/* Overlay Actions */}
            <div className='absolute bottom-20 right-4 flex flex-col items-center gap-6'>
              <div className='flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity'>
                <Heart className='text-white w-7 h-7' />
                <span className='text-white text-xs font-bold mt-1'>{reel.likes}</span>
              </div>
              <div className='flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity'>
                <MessageCircle className='text-white w-7 h-7' />
                <span className='text-white text-xs font-bold mt-1'>{reel.comments}</span>
              </div>
              <div className='flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity'>
                <Send className='text-white w-7 h-7' />
              </div>
              <div className='flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity'>
                <MoreHorizontal className='text-white w-7 h-7' />
              </div>
            </div>

            {/* Overlay User Info */}
            <div className='absolute bottom-6 left-4 flex flex-col gap-3'>
              <div className='flex items-center gap-2 cursor-pointer'>
                <Avatar className='w-9 h-9 border border-gray-300'>
                  <AvatarFallback className="text-black">{reel.author[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className='text-white font-semibold text-sm'>{reel.author}</span>
                <button className='text-white font-semibold text-xs border border-white px-3 py-1 rounded-lg ml-2 hover:bg-white hover:text-black transition-colors'>Follow</button>
              </div>
              <p className='text-white text-sm w-3/4 truncate font-medium'>Check out this amazing content! #reels #viral</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reels;
