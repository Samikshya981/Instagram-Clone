import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const useGetAllPost = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const controller = new AbortController();
        const fetchAllPost = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/v1/post/all', { 
                    withCredentials: true,
                    signal: controller.signal 
                });
                if (res.data.success) { 
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.log(error);
                toast.error("Failed to load posts");
            }
        }
        fetchAllPost();
        return () => {
            controller.abort();
        }
    }, [dispatch]);
};
export default useGetAllPost;