// ./src/pages/SupportChat.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import EmojiPicker from "emoji-picker-react";
import { getDocs } from "firebase/firestore";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import TripSyncLogo from "../assets/TripSync_Logo.png";

const SupportChat = () => {
  const { currentUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [username, setUsername] = useState("");
const [usersMap, setUsersMap] = useState({});
  const bottomRef = useRef(null);

  // ✅ Responsive check
  useEffect(() => {
    const checkScreen = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setOpen(desktop);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);
useEffect(() => {
  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const map = {};
    snapshot.forEach((doc) => {
      map[doc.id] = doc.data().username;
    });
    setUsersMap(map);
  };

  fetchUsers();
}, []);
  // ✅ Fetch Username from users collection
  useEffect(() => {
    const fetchUsername = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      } catch (err) {
        console.error("Error fetching username:", err);
      }
    };

    fetchUsername();
  }, [currentUser]);

  // ✅ Real-time message listener
  useEffect(() => {
    const q = query(
      collection(db, "support_messages"),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().timestamp?.toDate() || new Date(),
      }));
      setMessages(fetched);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send Message (NO EMAIL STORED)
  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "support_messages"), {
        text: input.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return (
    <>
      {/* Mobile Floating Button */}
      {!isDesktop && !open && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-2xl">💬</span>
          </button>
        </div>
      )}

      {/* Chat Container */}
      {open && (
        <div
          className={`fixed z-50 flex flex-col transition-all duration-500 ease-out transform
            ${
              isDesktop
                ? "bottom-8 right-8 w-[400px] h-[600px] rounded-3xl shadow-lg"
                : "inset-4 md:inset-x-20 md:inset-y-10 rounded-[2.5rem] shadow-2xl"
            }
            overflow-hidden`}
        >
          {/* 🎨 Abstract Animated Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              alt="Animated motion background"
              className="w-full h-full object-cover brightness-70"
            />
            <div className="absolute inset-0 bg-black/25"></div>
          </div>

          {/* Chat UI (above background) */}
          <div className="relative z-10 flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center font-bold border border-white/30">
                    <img
                      src={TripSyncLogo}
                      alt="TripSync Logo"
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-4 border-indigo-700 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">
                    TripSync Keralam
                  </h3>
                  <p className="text-xs text-indigo-100/80 font-medium">
                    {currentUser ? "Live with Friends" : "Please login to chat"}
                  </p>
                </div>
              </div>

              {!isDesktop && (
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-10 opacity-50 text-sm italic">
                  No messages yet.
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-indigo-600 mb-1 ml-2 uppercase">
                        {usersMap[msg.senderId] || "User"}
                      </span>
                    )}
                    <div
                      className={`px-5 py-3.5 rounded-2xl text-sm shadow-sm
                        ${
                          isMe
                            ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
                            : "bg-white text-gray-800 border border-gray-100"
                        }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[10px] mt-2 block opacity-60">
                        {formatTime(msg.time)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} className="h-2"></div>
            </div>

            {/* Bus-themed Input Area */}
            <div className="relative p-5">
              {currentUser ? (
                <div className="relative">
                  {/* Emoji Picker (Above Bus) */}
                  {showEmoji && (
                    <div className="absolute bottom-24 left-4 z-50 bg-white rounded-2xl shadow-xl p-2">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        height={350}
                      />
                    </div>
                  )}

                  {/* 🚌 Bus Body */}
                  <div className="relative w-full bg-yellow-400 rounded-2xl h-16 flex items-center px-4 shadow-lg">
                    {/* Wheels */}
                    <div className="absolute -bottom-3 left-6 w-6 h-6 bg-black rounded-full"></div>
                    <div className="absolute -bottom-3 right-6 w-6 h-6 bg-black rounded-full"></div>

                    {/* Windows */}
                    <div className="absolute top-2 left-16 flex space-x-4">
                      <div className="w-10 h-5 bg-white/30 rounded-md border border-white/40"></div>
                      <div className="w-10 h-5 bg-white/30 rounded-md border border-white/40"></div>
                      <div className="w-10 h-5 bg-white/30 rounded-md border border-white/40"></div>
                      <div className="w-10 h-5 bg-white/30 rounded-md border border-white/40"></div>
                    </div>

                    {/* Emoji Button */}
                    <button
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="absolute left-2 text-2xl hover:scale-110 transition"
                    >
                      😀
                    </button>

                    {/* Input */}
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full px-4 py-2 ml-12 focus:outline-none text-sm"
                    />

                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="absolute right-2 text-2xl hover:scale-110 transition disabled:opacity-40"
                    >
                      ✈️
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-indigo-600">
                  Login to participate in the chat
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;
