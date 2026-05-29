import { useEffect, lazy, Suspense } from 'react'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'
import axios from 'axios'
import { setAuthUser } from './redux/authSlice'

const ChatPage = lazy(() => import('./components/ChatPage'));
const EditProfile = lazy(() => import('./components/EditProfile'));
const Profile = lazy(() => import('./components/Profile'));
const Reels = lazy(() => import('./components/Reels'));
const Search = lazy(() => import('./components/Search'));
const Explore = lazy(() => import('./components/Explore'));
const Notifications = lazy(() => import('./components/Notifications'));


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: '/',
        element: <ProtectedRoutes><Home /></ProtectedRoutes>
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoutes> <Profile /></ProtectedRoutes>
      },
      {
        path: '/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      {
        path: '/chat',
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
      },
      {
        path: '/reels',
        element: <ProtectedRoutes><Reels /></ProtectedRoutes>
      },
      {
        path: '/search',
        element: <ProtectedRoutes><Search /></ProtectedRoutes>
      },
      {
        path: '/explore',
        element: <ProtectedRoutes><Explore /></ProtectedRoutes>
      },
      {
        path: '/notifications',
        element: <ProtectedRoutes><Notifications /></ProtectedRoutes>
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])

function App() {
  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          dispatch(setAuthUser(null));
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:8000', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      dispatch(setSocket(socketio));

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center font-semibold text-gray-500">Loading...</div>}>
      <RouterProvider router={browserRouter} />
    </Suspense>
  )
}

export default App
