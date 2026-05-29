import React from 'react'
import Posts from './Posts'
import Stories from './Stories'

const Feed = () => {
  return (
    <div className='flex-1 my-8 flex flex-col items-center'>
        <Stories />
        <Posts/>
    </div>
  )
}

export default Feed