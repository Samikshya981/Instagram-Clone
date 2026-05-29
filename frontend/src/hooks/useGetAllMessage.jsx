import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    useEffect(() => {
        const controller = new AbortController();
        const fetchAllMessage = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/message/all/${selectedUser?._id}`, { 
                    withCredentials: true,
                    signal: controller.signal 
                });
                if (res.data.success) {  
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.log(error);
                toast.error("Failed to load messages");
            }
        }
        if(selectedUser?._id) {
            fetchAllMessage();
        }
        return () => {
            controller.abort();
        }
    }, [selectedUser, dispatch]);
};
export default useGetAllMessage;