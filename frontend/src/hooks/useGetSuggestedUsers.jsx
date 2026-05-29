import { setSuggestedUsers } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const controller = new AbortController();
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/v1/user/suggested', { 
                    withCredentials: true,
                    signal: controller.signal 
                });
                if (res.data.success) { 
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.log(error);
                toast.error("Failed to load suggested users");
            }
        }
        fetchSuggestedUsers();
        return () => {
            controller.abort();
        }
    }, [dispatch]);
};
export default useGetSuggestedUsers;