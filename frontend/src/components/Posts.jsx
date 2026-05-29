import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'

const Posts = () => {
  const {posts} = useSelector(store=>store.post);
  
  if (!posts || posts.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center my-20">
              <p className="text-gray-500 text-lg font-semibold">No posts yet</p>
              <p className="text-gray-400 text-sm mt-2">Start following people to see their posts here.</p>
          </div>
      )
  }

  return (
    <div>
        {
            posts.map((post) => <Post key={post._id} post={post}/>)
        }
    </div>
  )
}

export default Posts