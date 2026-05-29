import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    // const [userProfile, setUserProfile] = useState(null);
    useEffect(() => {
        const controller = new AbortController();
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/user/${userId}/profile`, { 
                    withCredentials: true,
                    signal: controller.signal 
                });
                if (res.data.success) { 
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.log(error);
                toast.error("Failed to load user profile");
            }
        }
        fetchUserProfile();
        return () => {
            controller.abort();
        }
    }, [userId, dispatch]);
};
export default useGetUserProfile;