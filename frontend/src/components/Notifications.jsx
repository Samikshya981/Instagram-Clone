import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/v1/notification', {
                withCredentials: true
            });
            if (res.data.success) {
                setNotifications(res.data.notifications);
                // Mark notifications as read in backend
                markNotificationsAsRead();
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markNotificationsAsRead = async () => {
        try {
            await axios.post('http://localhost:8000/api/v1/notification/read', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const handleNotificationClick = (notification) => {
        if (notification.type === 'follow') {
            navigate(`/profile/${notification.sender?._id}`);
        } else if (notification.type === 'like' || notification.type === 'comment') {
            // Navigate to home feed or show post details if applicable
            navigate(`/`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto my-8 px-4 min-h-[80vh]">
            <h1 className="font-bold text-2xl mb-6">Notifications</h1>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-lg font-semibold">All caught up!</p>
                    <p className="text-sm">No new notifications to display.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors duration-200 border border-transparent ${
                                !notif.isRead ? 'bg-blue-50/30' : ''
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <Avatar className="w-11 h-11 border border-gray-100">
                                    <AvatarImage src={notif.sender?.profilePicture} alt={notif.sender?.username} />
                                    <AvatarFallback>{notif.sender?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-sm">
                                    <p className="text-gray-800">
                                        <span className="font-bold mr-1">{notif.sender?.username}</span>
                                        {notif.type === 'like' && 'liked your post.'}
                                        {notif.type === 'comment' && 'commented on your post.'}
                                        {notif.type === 'follow' && 'started following you.'}
                                    </p>
                                    {notif.message && (notif.type === 'comment') && (
                                        <p className="text-gray-500 italic text-xs mt-0.5 line-clamp-1">{notif.message}</p>
                                    )}
                                    <span className="text-gray-400 text-xs mt-1">{formatTime(notif.createdAt)}</span>
                                </div>
                            </div>

                            {/* Show post thumbnail if like/comment */}
                            {(notif.type === 'like' || notif.type === 'comment') && notif.post?.image && (
                                <div className="w-11 h-11 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 ml-4">
                                    <img src={notif.post.image} alt="Post thumbnail" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
