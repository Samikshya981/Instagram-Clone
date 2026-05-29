import React, { useState, memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const [showHeart, setShowHeart] = useState(false);
    const dispatch = useDispatch();

    const handleDoubleTap = () => {
        if (!liked) likeOrDislikeHandler();
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
    }

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // apne post ko update krunga
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {

        try {
            const res = await axios.post(`http://localhost:8000/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`, {withCredentials:true});
            if(res.data.success){
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='my-6 w-full max-w-[470px] mx-auto border-b border-gray-200 pb-4'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-2'>
                        <h1 className="font-semibold text-[14px]">{post.author?.username}</h1>
                       {user?._id === post.author._id &&  <Badge variant="secondary" className="text-[10px] h-5">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {
                        post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">Unfollow</Button>
                        }
                        
                        <Button variant='ghost' className="cursor-pointer w-fit">Add to favorites</Button>
                        {
                            user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <div className='relative cursor-pointer mt-3' onDoubleClick={handleDoubleTap}>
                <img
                    className='rounded-[3px] w-full aspect-square object-cover animate-fade-in'
                    src={post.image}
                    alt="post_img"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500?text=Unavailable' }}
                />
                {showHeart && (
                    <FaHeart className='absolute top-1/2 left-1/2 text-white text-[100px] drop-shadow-xl animate-heart-pop z-20' />
                )}
            </div>

            <div className='flex items-center justify-between my-2 mt-3'>
                <div className='flex items-center gap-4'>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-[#FF3040] active:scale-90 transition-transform hover:opacity-70' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer hover:text-gray-500 active:scale-90 transition-transform' />
                    }

                    <MessageCircle size={'24'} onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer hover:text-gray-500 active:scale-90 transition-transform' />
                    <Send size={'24'} className='cursor-pointer hover:text-gray-500 active:scale-90 transition-transform' />
                </div>
                <Bookmark size={'24'} onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-500 active:scale-90 transition-transform' />
            </div>
            <span className='font-semibold text-sm block mb-1'>{postLike} likes</span>
            <p className='text-sm'>
                <span className='font-semibold mr-2'>{post.author?.username}</span>
                {post.caption}
            </p>
            {
                comment.length > 0 && (
                    <span onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer text-sm text-gray-400'>View all {comment.length} comments</span>
                )
            }
            <CommentDialog open={open} setOpen={setOpen} />
            <div className='flex items-center justify-between'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full'
                />
                {
                    text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
                }

            </div>
        </div>
    )
}

export default memo(Post)