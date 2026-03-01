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
  const isAtBottomRef = useRef(true); // Track bottom state synchronously
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);

  const [loadingMessages, setLoadingMessages] = useState(true);
  const prevLengthRef = useRef(0);
  const scrollPositionRef = useRef(0);
  // Swipe refs (mobile only)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [swipingId, setSwipingId] = useState(null);
const [swipeOffset, setSwipeOffset] = useState(0);

  // ✅ Scroll to bottom when chat opens if we were already at the bottom
  useEffect(() => {
    if (open && isAtBottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    }
  }, [open]);

  useEffect(() => {
    if (!isDesktop && open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open, isDesktop]);
  // ✅ Responsive check
  useEffect(() => {
    const checkScreen = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      // Only open automatically if switching from mobile to desktop
      if (desktop) {
        setOpen(true);
      }
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
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().timestamp?.toDate() || new Date(),
      }));

      const previousLength = prevLengthRef.current;
      const newLength = fetched.length;

      setMessages(fetched);
      setLoadingMessages(false);

      requestAnimationFrame(() => {
        if (!open) {
          prevLengthRef.current = newLength;
          return;
        }

        const isFirstLoad = prevLengthRef.current === 0;
        const lastMessage = fetched[fetched.length - 1];

        if (isFirstLoad) {
          bottomRef.current?.scrollIntoView({ behavior: "auto" });
        } else if (newLength > previousLength) {
          // Auto-scroll if msg is from me OR if user is already near the bottom
          // Changed behavior to "auto" to prevent animation conflict with new flex item rendering
          if (lastMessage?.senderId === currentUser?.uid || isAtBottomRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
          } else {
            setUnreadCount((prev) => prev + 1);
          }
        }

        prevLengthRef.current = newLength;
      });
    });

    return () => unsubscribe();
  }, [open, currentUser]);
  // ✅ Send message
  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;

    const messageText = input.trim();
    setInput("");

    // Start auto scrolling immediately to prevent the input from breaking its visual flow
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      isAtBottomRef.current = true;
    });

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
      const threshold = 100; // slightly larger threshold for detecting "near bottom"
      const atBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;

      setIsAtBottom(atBottom);
      isAtBottomRef.current = atBottom;

      if (atBottom) {
        setUnreadCount(0);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Swipe Handlers (Mobile Only)
  const handleTouchStart = (e, msg) => {
  touchStartX.current = e.changedTouches[0].screenX;
  setSwipingId(msg.id);
};

const handleTouchMove = (e, msg) => {
  const currentX = e.changedTouches[0].screenX;
  const distance = currentX - touchStartX.current;

  const isMe = msg.senderId === currentUser?.uid;

  // ✅ Restrict direction
  if (isMe && distance < 0) {
    setSwipeOffset(distance); // Right → Left
  } else if (!isMe && distance > 0) {
    setSwipeOffset(distance); // Left → Right
  }
};

const handleTouchEnd = (msg) => {
  const threshold = 80;

  if (Math.abs(swipeOffset) > threshold) {
    setReplyTo(msg);
  }

  // Reset animation
  setSwipeOffset(0);
  setSwipingId(null);
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

      <div
        className={`fixed z-[9999] flex flex-col transition-all duration-500 ease-out transform
    ${isDesktop
            ? "bottom-8 right-8 w-[400px] h-[600px] rounded-3xl shadow-lg"
            : "inset-0 rounded-t-3xl overflow-hidden"
          }
    ${open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}
    overflow-hidden touch-pan-y`}
      >
        <div className="absolute inset-0 z-0 overflow-hidden touch-pan-y">
          <img
            alt="Animated motion background"
            className="w-full h-full object-cover brightness-70"
          />
          <div className="absolute inset-0 bg-black/25"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full bg-white overflow-hidden">
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
                onClick={() => {
                  if (messagesRef.current) {
                    scrollPositionRef.current = messagesRef.current.scrollTop;
                  }
                  setOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
              >
                ✕
              </button>
            )}
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-4 min-h-0"
          >
            {loadingMessages && (
              <div className="flex flex-col gap-3 px-3 py-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            )}

            {!loadingMessages && messages.length === 0 && (
              <div className="text-center py-10 opacity-50 text-sm italic">
                No messages yet.
              </div>
            )}

            {messages.map((msg, index) => {
              const isMe = msg.senderId === currentUser?.uid;

              const prevMsg = messages[index - 1];
              const showUsername =
                !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);

              return (
                <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    onTouchStart={!isDesktop ? (e) => handleTouchStart(e, msg) : undefined}
                    onTouchMove={!isDesktop ? (e) => handleTouchMove(e, msg) : undefined}
                    onTouchEnd={!isDesktop ? () => handleTouchEnd(msg) : undefined}
                  >
                  <div
                    className={`relative pl-1.5 pr-2 py-0.5 rounded-md text-sm shadow-sm break-words max-w-[75%] leading-relaxed transition-transform duration-200 ease-out
                    ${isMe
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
                      : "bg-white text-gray-800 border border-gray-100"
                    }`}
                    style={{
                      transform:
                        swipingId === msg.id ? `translateX(${swipeOffset}px)` : "translateX(0px)",
                    }}
                  >
                    {showUsername && (
                      <div className="text-[11px] font-semibold text-indigo-500 mb-0.5">
                        {usersMap[msg.senderId] || "User"}
                      </div>
                    )}
                    {/* Desktop Reply Button */}
                    {isDesktop && (
                      <button
                        onClick={() => setReplyTo(msg)}
                        className={`absolute top-2 ${isMe ? "-left-8" : "-right-8"
                          } p-1 rounded-full hover:bg-black/10 transition`}
                      >
                        <Reply size={16} />
                      </button>
                    )}

                    {msg.replyTo && (
                      <div
                        className={`mb-2 p-2 rounded-lg border-l-4 ${isMe
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

                    <div className="max-w-full">
                      <div className="flex flex-wrap items-end gap-x-2">
                        <span className="break-words whitespace-pre-wrap">
                          {msg.text}
                        </span>

                        <span className="text-[10px] opacity-60 ml-auto -mt-6 whitespace-nowrap">
                          {formatTime(msg.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef}></div>
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
          <div className="relative px-5 pb-5 pt-0">
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
      
    </>
  );
};

export default SupportChat;
