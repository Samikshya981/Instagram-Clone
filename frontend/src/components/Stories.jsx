import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Plus, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

const Stories = () => {
    const { user } = useSelector((store) => store.auth);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Viewer State
    const [activeStoryIndex, setActiveStoryIndex] = useState(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);
    const progressIntervalRef = useRef(null);

    const fetchStories = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/v1/story/all', {
                withCredentials: true,
            });
            if (res.data.success) {
                setStories(res.data.stories);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStories();
        }
    }, [user]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const res = await axios.post('http://localhost:8000/api/v1/story/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success('Story uploaded!');
                // Prepend or add new story to list
                setStories((prev) => [res.data.story, ...prev]);
            }
        } catch (error) {
            console.error('Error uploading story:', error);
            toast.error(error.response?.data?.message || 'Failed to upload story');
        } finally {
            setUploading(false);
        }
    };

    const triggerUpload = (e) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    // Story viewer logic
    const openStoryViewer = (index) => {
        setActiveStoryIndex(index);
        setProgress(0);
    };

    const closeStoryViewer = () => {
        setActiveStoryIndex(null);
        setProgress(0);
    };

    const handleNextStory = () => {
        if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((prev) => prev + 1);
            setProgress(0);
        } else {
            closeStoryViewer();
        }
    };

    const handlePrevStory = () => {
        if (activeStoryIndex > 0) {
            setActiveStoryIndex((prev) => prev - 1);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (activeStoryIndex !== null) {
            progressIntervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(progressIntervalRef.current);
                        handleNextStory();
                        return 0;
                    }
                    return prev + 2; // Increments by 2% every 100ms -> 100% in 5s
                });
            }, 100);
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [activeStoryIndex, stories.length]);

    // Check if the current user has any active story
    const currentUserStories = stories.filter((s) => s.user?._id === user?._id);
    const hasOwnStory = currentUserStories.length > 0;

    // Filter distinct users who have stories to list them in the bar
    // Standard view groups stories by user
    const groupedStories = [];
    const seenUsers = new Set();
    stories.forEach((story) => {
        if (!seenUsers.has(story.user?._id)) {
            seenUsers.add(story.user?._id);
            groupedStories.push(story);
        }
    });

    return (
        <div className="w-full max-w-2xl mx-auto border-b border-gray-200 py-4 px-1 flex gap-4 overflow-x-auto scrollbar-hide items-center">
            {/* Hidden upload input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Current user's story circle */}
            <div className="flex flex-col items-center flex-shrink-0 relative group">
                <div 
                    onClick={() => {
                        if (hasOwnStory) {
                            const ownIndexInMaster = stories.findIndex((s) => s.user?._id === user?._id);
                            openStoryViewer(ownIndexInMaster);
                        } else {
                            fileInputRef.current?.click();
                        }
                    }}
                    className={`w-[66px] h-[66px] rounded-full p-[2px] cursor-pointer transition-transform active:scale-95 group-hover:scale-105 ${
                        hasOwnStory ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : 'border border-gray-300'
                    }`}
                >
                    <Avatar className="w-full h-full border-2 border-white rounded-full">
                        <AvatarImage src={user?.profilePicture} alt="you" className="object-cover w-full h-full" />
                        <AvatarFallback className="text-sm">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
                
                {/* Plus button overlay */}
                <button
                    onClick={triggerUpload}
                    disabled={uploading}
                    className="absolute bottom-5 right-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full p-1 border-2 border-white cursor-pointer transition-transform active:scale-90"
                >
                    {uploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Plus className="w-3.5 h-3.5 font-bold" />
                    )}
                </button>
                <span className="text-xs text-gray-700 mt-1.5 truncate w-16 text-center">Your story</span>
            </div>

            {/* Loading Indicator */}
            {loading && stories.length === 0 && (
                <div className="flex items-center justify-center flex-1 py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            )}

            {/* Other users' stories */}
            {groupedStories
                .filter((s) => s.user?._id !== user?._id)
                .map((story) => {
                    const masterIndex = stories.findIndex((s) => s._id === story._id);
                    return (
                        <div
                            key={story._id}
                            onClick={() => openStoryViewer(masterIndex)}
                            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                        >
                            <div className="w-[66px] h-[66px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600 transition-transform active:scale-95 group-hover:scale-105">
                                <Avatar className="w-full h-full border-2 border-white rounded-full">
                                    <AvatarImage src={story.user?.profilePicture} alt={story.user?.username} className="object-cover w-full h-full" />
                                    <AvatarFallback>{story.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="text-xs text-gray-700 mt-1.5 truncate w-16 text-center">
                                {story.user?.username}
                            </span>
                        </div>
                    );
                })}

            {/* Story Viewer Fullscreen Modal Overlay */}
            {activeStoryIndex !== null && stories[activeStoryIndex] && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                    
                    {/* Left arrow */}
                    {activeStoryIndex > 0 && (
                        <button
                            onClick={handlePrevStory}
                            className="absolute left-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors hidden md:block"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    {/* Right arrow */}
                    {activeStoryIndex < stories.length - 1 && (
                        <button
                            onClick={handleNextStory}
                            className="absolute right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors hidden md:block"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {/* Main Viewer Box */}
                    <div className="relative w-full max-w-lg aspect-[9/16] h-[90vh] bg-black rounded-lg overflow-hidden flex flex-col justify-between">
                        
                        {/* Progress and User Info Bar */}
                        <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-black/80 to-transparent flex flex-col gap-3">
                            {/* Segmented Progress bar */}
                            <div className="flex gap-1.5 w-full">
                                {stories.map((s, idx) => (
                                    <div key={idx} className="h-1 bg-white/30 flex-1 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded transition-all duration-100 ease-linear"
                                            style={{
                                                width:
                                                    idx === activeStoryIndex
                                                        ? `${progress}%`
                                                        : idx < activeStoryIndex
                                                        ? '100%'
                                                        : '0%',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* User details and Close action */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="w-9 h-9 border border-white/20">
                                        <AvatarImage src={stories[activeStoryIndex].user?.profilePicture} className="object-cover" />
                                        <AvatarFallback className="text-black bg-white">
                                            {stories[activeStoryIndex].user?.username?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-white font-semibold text-sm drop-shadow-sm">
                                        {stories[activeStoryIndex].user?.username}
                                    </span>
                                </div>
                                <button
                                    onClick={closeStoryViewer}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Interactive touch targets for mobile */}
                        <div className="absolute inset-0 z-10 flex">
                            <div onClick={handlePrevStory} className="w-1/3 h-full cursor-w-resize" />
                            <div onClick={handleNextStory} className="w-2/3 h-full cursor-e-resize" />
                        </div>

                        {/* Story Image */}
                        <img
                            src={stories[activeStoryIndex].image}
                            alt="Story content"
                            className="w-full h-full object-contain bg-black select-none pointer-events-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stories;
