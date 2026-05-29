import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, Clapperboard } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Button } from './ui/button'
import { clearNotifications } from '@/redux/rtnSlice'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);


    const logoutHandler = async () => {
        try {
            const res = await axios.post('http://localhost:8000/api/v1/user/logout', {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        } else if (textType === 'Reels') {
            navigate("/reels");
        } else if (textType === 'Search') {
            navigate("/search");
        } else if (textType === 'Explore') {
            navigate("/explore");
        } else if (textType === 'Notifications') {
            dispatch(clearNotifications());
            navigate("/notifications");
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <Clapperboard />, text: "Reels" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]
    return (
        <div className='fixed z-10 bottom-0 md:top-0 left-0 w-full md:w-64 h-14 md:h-screen bg-white border-t md:border-t-0 md:border-r border-gray-300 flex flex-row md:flex-col px-4'>
            <div className='flex md:flex-col w-full h-full'>
                <h1 className='my-8 pl-3 font-bold text-xl hidden md:block'>LOGO</h1>
                <div className='flex flex-row md:flex-col justify-around md:justify-start w-full h-full items-center md:items-stretch'>
                    {
                        sidebarItems.map((item, index) => {
                            return (
                                <div onClick={() => sidebarHandler(item.text)} key={index} className={`flex items-center gap-4 relative hover:bg-gray-100 active:scale-95 transition-all duration-200 cursor-pointer rounded-lg p-3 md:my-1 ${['Search', 'Explore', 'Notifications'].includes(item.text) ? 'hidden md:flex' : ''}`}>
                                    <div className="transition-transform group-hover:scale-105">{item.icon}</div>
                                    <span className='hidden md:inline font-medium text-[15px]'>{item.text}</span>
                                    {
                                        item.text === "Notifications" && likeNotification.length > 0 && (
                                            <div className="rounded-full h-5 w-5 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold absolute bottom-6 left-6 animate-pulse">
                                                {likeNotification.length}
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />

        </div>
    )
}

export default LeftSidebar