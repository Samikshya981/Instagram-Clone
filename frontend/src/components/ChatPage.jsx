import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode, Loader2 } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const [chatUsers, setChatUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const { user, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    const sendMessageHandler = async (receiverId) => {
        if (!textMessage.trim()) return;
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/message/send/${receiverId}`, { message: textMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const fetchChatUsers = async () => {
            try {
                setLoadingUsers(true);
                const res = await axios.get('http://localhost:8000/api/v1/user/chat/users', {
                    withCredentials: true
                });
                if (res.data.success) {
                    setChatUsers(res.data.users);
                }
            } catch (error) {
                console.error("Error fetching chat users:", error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchChatUsers();

        return () => {
            dispatch(setSelectedUser(null));
        }
    }, [dispatch]);

    return (
        <div className='flex h-screen'>
            <section className='w-full md:w-1/4 my-8'>
                <h1 className='font-bold mb-4 px-3 text-xl'>{user?.username}</h1>
                <hr className='mb-4 border-gray-300' />
                <div className='overflow-y-auto h-[80vh]'>
                    {loadingUsers ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="animate-spin text-gray-400" />
                        </div>
                    ) : chatUsers.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No users to chat with</p>
                    ) : (
                        chatUsers.map((chatUser) => {
                            const isOnline = onlineUsers.includes(chatUser?._id);
                            return (
                                <div
                                    key={chatUser?._id}
                                    onClick={() => dispatch(setSelectedUser(chatUser))}
                                    className={`flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg mx-2 my-1 transition-colors duration-150 ${
                                        selectedUser?._id === chatUser?._id ? 'bg-gray-100' : ''
                                    }`}
                                >
                                    <Avatar className='w-14 h-14'>
                                        <AvatarImage src={chatUser?.profilePicture} />
                                        <AvatarFallback>{chatUser?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <span className='font-medium'>{chatUser?.username}</span>
                                        <span className={`text-xs font-bold ${isOnline ? 'text-green-600' : 'text-red-600'} `}>
                                            {isOnline ? 'online' : 'offline'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

            </section>
            {
                selectedUser ? (
                    <section className='flex-1 border-l border-l-gray-300 flex flex-col h-full'>
                        <div className='flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10'>
                            <Avatar>
                                <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span>{selectedUser?.username}</span>
                            </div>
                        </div>
                        <Messages selectedUser={selectedUser} />
                        <div className='flex items-center p-4 border-t border-t-gray-300'>
                            <Input value={textMessage} onChange={(e) => setTextMessage(e.target.value)} type="text" className='flex-1 mr-2 focus-visible:ring-transparent' placeholder="Messages..." />
                            <Button onClick={() => sendMessageHandler(selectedUser?._id)}>Send</Button>
                        </div>
                    </section>
                ) : (
                    <div className='flex flex-col items-center justify-center mx-auto'>
                        <MessageCircleCode className='w-32 h-32 my-4' />
                        <h1 className='font-medium'>Your messages</h1>
                        <span>Send a message to start a chat.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage