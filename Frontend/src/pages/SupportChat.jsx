<<<<<<< HEAD
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
=======
// ./src/pages/SupportChat.jsx
import { useState, useEffect } from "react";
>>>>>>> 49ab41821f7a372b1e7f4749686e72239087a0dc

const SupportChat = () => {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  // Responsive screen check
  useEffect(() => {
    const checkScreen = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setOpen(true);
      else setOpen(false);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(
      collection(db, "support_messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JS Date if it exists
        time: doc.data().timestamp?.toDate() || new Date(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !currentUser) return;

    try {
      await addDoc(collection(db, "support_messages"), {
        text: trimmedInput,
        senderId: currentUser.uid,
        senderName: currentUser.email,
        timestamp: serverTimestamp(),
      });
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating Button (Mobile only) */}
      {!isDesktop && !open && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-full shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* Chat Container */}
      {open && (
        <div
          className={`fixed z-50 flex flex-col transition-all duration-500 ease-out transform
            ${isDesktop
              ? "bottom-8 right-8 w-[400px] h-[600px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              : "inset-4 md:inset-x-20 md:inset-y-10 rounded-[2.5rem] shadow-2xl"
            } 
            bg-white/95 backdrop-blur-xl border border-white/20 overflow-hidden
          `}
        >
          {/* Glass Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-xl font-bold border border-white/30">
                  TS
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-4 border-indigo-700 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">TripSync Chat</h3>
                <p className="text-xs text-indigo-100/80 flex items-center gap-1.5 font-medium">
                  {currentUser ? "Live with Friends" : "Please login to chat"}
                </p>
              </div>
            </div>

            {!isDesktop && (
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <span className="text-xl">✕</span>
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/50">
            {messages.length === 0 && (
              <div className="text-center py-10 opacity-50 text-sm italic">
                No messages yet. Start the conversation!
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
                    <span className="text-[10px] font-bold text-indigo-600 mb-1 ml-2 uppercase tracking-wider">
                      {msg.senderName?.split('@')[0] || "Friend"}
                    </span>
                  )}
                  <div
                    className={`relative max-w-[85%] px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all
                      ${isMe
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                      }
                    `}
                  >
                    <p className="font-medium">{msg.text}</p>
                    <span className={`text-[10px] mt-2 block opacity-60 font-semibold ${isMe ? "text-right" : "text-left"}`}>
                      {formatTime(msg.time)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} className="h-2"></div>
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white border-t border-gray-100/50 shrink-0">
            {currentUser ? (
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-50/80 border border-gray-200 rounded-[1.5rem] px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-indigo-200 active:scale-95 shrink-0"
                >
                  <span className="text-xl transform rotate-45 -translate-y-0.5 -translate-x-0.5">✈️</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-sm font-bold text-indigo-600">Login to participate in the chat</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;