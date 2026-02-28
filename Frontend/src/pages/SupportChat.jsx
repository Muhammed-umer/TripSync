// ./src/pages/SupportChat.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import EmojiPicker from "emoji-picker-react";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import TripSyncLogo from "../assets/TripSync_Logo.png";
import { Reply, X } from "lucide-react";

const SupportChat = () => {
  const { currentUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const messagesRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Swipe refs (mobile only)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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

  // ✅ Fetch users once
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
      setLoadingMessages(false);

      const container = messagesRef.current;
      if (!container) return;

      requestAnimationFrame(() => {
        // First load → instant bottom
        if (!hasLoadedInitially) {
          container.scrollTop = container.scrollHeight;
          setHasLoadedInitially(true);
          return;
        }

        // Follow only if already at bottom
        if (isAtBottom) {
          container.scrollTop = container.scrollHeight;
        }
      });
    });

    return () => unsubscribe();
  }, [isAtBottom, hasLoadedInitially]);
  // ✅ Send message
  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;

    const messageText = input.trim();
    setInput("");

    try {
      await addDoc(collection(db, "support_messages"), {
        text: messageText,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        replyTo: replyTo
          ? {
              text: replyTo.text,
              senderId: replyTo.senderId,
            }
          : null,
      });

      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  // ✅ Scroll detection
  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 50;
      const atBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;

      setIsAtBottom(atBottom);

      if (atBottom) {
        setUnreadCount(0);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Swipe Handlers (Mobile Only)
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e, msg) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const distance = touchEndX.current - touchStartX.current;

    // Swipe right threshold
    if (distance > 70) {
      setReplyTo(msg);
    }
  };

  return (
    <>
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
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              alt="Animated motion background"
              className="w-full h-full object-cover brightness-70"
            />
            <div className="absolute inset-0 bg-black/25"></div>
          </div>

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

            {/* Messages */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-4"
            >
              {!loadingMessages && messages.length === 0 && (
                <div className="text-center py-10 opacity-50 text-sm italic">
                  No messages yet.
                </div>
              )}

              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.uid;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                    onTouchStart={!isDesktop ? handleTouchStart : undefined}
                    onTouchEnd={
                      !isDesktop ? (e) => handleTouchEnd(e, msg) : undefined
                    }
                  >
                    <div
                      className={`relative group px-4 py-3 rounded-xl text-sm shadow-sm break-words whitespace-pre-wrap max-w-[75%]
                      ${
                        isMe
                          ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
                          : "bg-white text-gray-800 border border-gray-100"
                      }`}
                    >
                      {!isMe && (
                        <div className="text-[11px] font-semibold text-indigo-500 mb-0.5">
                          {usersMap[msg.senderId] || "User"}
                        </div>
                      )}
                      {/* Desktop Reply Button */}
                      {isDesktop && (
                        <button
                          onClick={() => setReplyTo(msg)}
                          className={`absolute top-2 ${
                            isMe ? "-left-8" : "-right-8"
                          } p-1 rounded-full hover:bg-black/10 transition`}
                        >
                          <Reply size={16} />
                        </button>
                      )}

                      {msg.replyTo && (
                        <div
                          className={`mb-2 p-2 rounded-lg border-l-4 ${
                            isMe
                              ? "bg-green-100 border-green-500"
                              : "bg-gray-100 border-indigo-500"
                          }`}
                        >
                          <div className="text-xs font-semibold">
                            {usersMap[msg.replyTo.senderId] || "User"}
                          </div>
                          <div className="text-xs truncate opacity-80">
                            {msg.replyTo.text}
                          </div>
                        </div>
                      )}

                      <p>{msg.text}</p>

                      <span className="text-[10px] mt-2 block opacity-60">
                        {formatTime(msg.time)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} ></div>
            </div>

            {/* ✅ Unread Button OUTSIDE scroll */}
            {!isAtBottom && unreadCount > 0 && (
              <div className="absolute bottom-28 right-6 z-50">
                <button
                  onClick={() => {
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                    setUnreadCount(0);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg text-xs"
                >
                  {unreadCount} New Message{unreadCount > 1 ? "s" : ""}
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="relative p-5">
              {currentUser ? (
                <div className="relative">
                  {showEmoji && (
                    <div className="absolute bottom-24  left-4 z-50 bg-white rounded-2xl shadow-xl p-2">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        height={350}
                      />
                    </div>
                  )}

                  {replyTo && (
                    <div className="relative bg-white p-3 rounded-lg mb-1 border-l-4 border-indigo-600 shadow">
                      {/* Close Icon */}
                      <button
                        onClick={() => setReplyTo(null)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition"
                      >
                        <X size={14} className="text-gray-600" />
                      </button>

                      <div className="text-xs font-semibold">
                        {usersMap[replyTo.senderId] || "User"}
                      </div>

                      <div className="text-xs truncate opacity-80 pr-6">
                        {replyTo.text}
                      </div>
                    </div>
                  )}

                  {/* Bus Body */}
                  <div className="relative w-full bg-yellow-400 rounded-2xl h-16 flex items-center px-4 shadow-lg">
                    <div className="absolute -bottom-3 left-6 w-6 h-6 bg-black rounded-full"></div>
                    <div className="absolute -bottom-3 right-6 w-6 h-6 bg-black rounded-full"></div>

                    <div className="absolute top-2 left-16 flex space-x-4">
                      <div className="w-10 h-5 bg-white/30 rounded-md border border-white/40"></div>
                      <div className="w-10 h-5 bg-white/30 rounded-md border border-white/40"></div>
                      <div className="w-10 h-5 bg-white/30 rounded-md border border-white/40"></div>
                      <div className="w-10 h-5 bg-white/30 rounded-md border border-white/40"></div>
                    </div>

                    <button
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="absolute left-2 text-2xl hover:scale-110 transition"
                    >
                      😀
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full px-4 py-2 ml-12 focus:outline-none text-sm"
                    />

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
