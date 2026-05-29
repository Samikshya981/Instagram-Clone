import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSelectedPost } from '@/redux/postSlice';
import CommentDialog from './CommentDialog';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCommentDialog, setOpenCommentDialog] = useState(false);
    const dispatch = useDispatch();

    const fetchExplorePosts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/v1/post/explore', {
                withCredentials: true
            });
            if (res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.error('Error fetching explore posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExplorePosts();
    }, []);

    const handlePostClick = (post) => {
        dispatch(setSelectedPost(post));
        setOpenCommentDialog(true);
    };

    return (
        <div className="max-w-4xl mx-auto my-8 px-4 min-h-[80vh]">
            <h1 className="font-bold text-2xl mb-6">Explore</h1>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-gray-500 w-10 h-10" />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                    <p className="text-lg font-semibold">No explore posts available</p>
                    <p className="text-sm text-gray-400">Check back later for new content!</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            onClick={() => handlePostClick(post)}
                            className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-gray-100"
                        >
                            <img
                                src={post.image}
                                alt="Explore post"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white font-semibold">
                                <div className="flex items-center gap-1.5 hover:scale-110 transition-transform">
                                    <Heart className="fill-white w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-sm md:text-base">{post.likes?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 hover:scale-110 transition-transform">
                                    <MessageCircle className="fill-white w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-sm md:text-base">{post.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Comment Dialog integration */}
            {openCommentDialog && (
                <CommentDialog open={openCommentDialog} setOpen={setOpenCommentDialog} />
            )}
        </div>
    );
};

export default Explore;
