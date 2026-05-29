import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                searchUsers();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const searchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8000/api/v1/user/search?query=${query}`, {
                withCredentials: true
            });
            if (res.data.success) {
                setResults(res.data.users);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto my-8 px-4 min-h-[80vh]">
            <h1 className="font-bold text-2xl mb-6">Search</h1>
            <div className="relative mb-6">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-300 rounded-lg focus-visible:ring-gray-400 focus-visible:ring-1"
                />
            </div>

            <div className="space-y-4">
                {loading && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
                    </div>
                )}

                {!loading && query && results.length === 0 && (
                    <p className="text-gray-500 text-center py-10">No users found matching "{query}"</p>
                )}

                {!loading && !query && (
                    <p className="text-gray-400 text-center py-10">Type a username or keyword to search</p>
                )}

                {!loading && results.map((user) => (
                    <div
                        key={user._id}
                        onClick={() => navigate(`/profile/${user._id}`)}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors duration-200 border border-transparent hover:border-gray-100"
                    >
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={user.profilePicture} alt={user.username} />
                            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{user.username}</span>
                            <span className="text-gray-500 text-sm truncate max-w-sm">{user.bio || 'No bio yet'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Search;
