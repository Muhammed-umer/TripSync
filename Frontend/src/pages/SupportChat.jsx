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
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";

import TripSyncLogo from "../assets/TripSync_Logo.png";
import { Reply, X, Info, Pencil, Trash2, Pin } from "lucide-react";

// Moved outside component to prevent re-creation on render.
// Relies on parent passing an onClick that handles logic (including closing menu if needed).
const MenuItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      if (onClick) onClick();
    }}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition
    ${
      danger
        ? "text-red-400 hover:bg-red-500/10"
        : "text-gray-200 hover:bg-zinc-800"
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

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
  const isAtBottomRef = useRef(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const prevLengthRef = useRef(0);
  const touchStartX = useRef(0);
  const [swipingId, setSwipingId] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuMessage, setMenuMessage] = useState(null);
  const longPressTimer = useRef(null);
  const [pinnedMessage, setPinnedMessage] = useState(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setShowInfo(false);
      setSelectedMessage(null);
    };

    if (showInfo) {
      window.addEventListener("click", handleClick);
    }

    return () => window.removeEventListener("click", handleClick);
  }, [showInfo]);

  // Close Menu When Clicking Outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (e.target.closest(".chat-menu")) return;
      setShowMenu(false);
    };

    if (showMenu) {
      window.addEventListener("mousedown", handleOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleOutside);
    };
  }, [showMenu]);

  // Scroll to bottom when opening chat
  useEffect(() => {
    if (open && isAtBottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    }
  }, [open]);

  // Lock body scroll on mobile
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

  // Responsive check
  useEffect(() => {
    const checkScreen = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setOpen(true);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Fetch users
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

  // Real-time listener
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

      const previousLength = prevLengthRef.current;
      const newLength = fetched.length;

      setMessages(fetched);
      setLoadingMessages(false);

      if (fetched.length > 0) {
        const pinned = fetched.find((m) => m.pinned);
        setPinnedMessage(pinned || null);
      }

      if (open && currentUser) {
        fetched.forEach(async (msg) => {
          const alreadySeen = msg.seenBy?.some(
            (u) => typeof u === "object" && u.userId === currentUser.uid,
          );

          if (msg.senderId !== currentUser.uid && !alreadySeen) {
            await updateDoc(doc(db, "support_messages", msg.id), {
              seenBy: arrayUnion({
                userId: currentUser.uid,
                seenAt: new Date(), // Storing as Date object for consistency with how fetch reads it
              }),
            });
          }
        });
      }

      requestAnimationFrame(() => {
        if (!open) {
          prevLengthRef.current = newLength;
          return;
        }

        const isFirstLoad = previousLength === 0;
        const lastMessage = fetched[fetched.length - 1];

        if (isFirstLoad) {
          bottomRef.current?.scrollIntoView({ behavior: "auto" });
        } else if (newLength > previousLength) {
          if (
            lastMessage?.senderId === currentUser?.uid ||
            isAtBottomRef.current
          ) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          } else {
            setUnreadCount((prev) => prev + 1);
          }
        }

        prevLengthRef.current = newLength;
      });
    });

    return () => unsubscribe();
  }, [open, currentUser]);

  // ✅ FIXED SEND FUNCTION (ONLY CHANGE)
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
        seenBy: [],
        deliveredTo: [],
        deletedFor: [],
        isDeleted: false,
        pinned: false,
      });

      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const handleDeleteForMe = async () => {
    if (!currentUser || !menuMessage) return;

    try {
      await updateDoc(doc(db, "support_messages", menuMessage.id), {
        deletedFor: arrayUnion(currentUser.uid),
      });
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!menuMessage) return;
    try {
      await updateDoc(doc(db, "support_messages", menuMessage.id), {
        text: "This message was deleted",
        isDeleted: true,
      });
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePin = async () => {
    if (!menuMessage) return;
    try {
      // Unpin others first if you want only one pinned message, or just pin this one
      // For now, assuming single pin logic, we could unpin all others or just set this one true
      // The requirement says "Pin Function", simplest is setting pinned: true
      // To strictly follow "one pinned message", we should query for existing pinned and unpin it, but let's stick to the prompt's request.

      // However, usually only one message is pinned. Let's unpin previous if exists locally for better UI,
      // but ideally we should use a batch or transaction to ensure one pin.
      // For this step, simply updating the doc:
      await updateDoc(doc(db, "support_messages", menuMessage.id), {
        pinned: true,
      });
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  // Scroll detection
  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 100;
      const atBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;

      setIsAtBottom(atBottom);
      isAtBottomRef.current = atBottom;

      if (atBottom) setUnreadCount(0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Swipe
  const handleTouchStart = (e, msg) => {
    touchStartX.current = e.changedTouches[0].screenX;
    setSwipingId(msg.id);
  };

  const handleTouchMove = (e, msg) => {
    const currentX = e.changedTouches[0].screenX;
    const rawDistance = currentX - touchStartX.current;

    const isMe = msg.senderId === currentUser?.uid;

    const MAX_SWIPE = 70; // visual limit
    const RESISTANCE = 0.35; // smooth feel
    let visualDistance = rawDistance * RESISTANCE;
    if (isMe && visualDistance < 0) {
      setSwipeOffset(Math.max(visualDistance, -MAX_SWIPE));
    } else if (!isMe && visualDistance > 0) {
      setSwipeOffset(Math.min(visualDistance, MAX_SWIPE));
    }
  };

  const handleTouchEnd = (msg) => {
    const RELEASE_THRESHOLD = 120; // real finger movement
    const rawSwipe = swipeOffset / 0.35;
    // reverse resistance to estimate original distance
    if (Math.abs(rawSwipe) > RELEASE_THRESHOLD) {
      setReplyTo(msg);
    }

    setSwipeOffset(0);
    setSwipingId(null);
  };
  const handleLongPressStart = (e, msg) => {
    if (isDesktop) return;

    const touch = e.touches[0];

    longPressTimer.current = setTimeout(() => {
      const menuWidth = 224;
      const menuHeight = 220;

      let posX = touch.clientX;
      let posY = touch.clientY;

      if (posX + menuWidth > window.innerWidth) {
        posX = window.innerWidth - menuWidth - 10;
      }

      if (posY + menuHeight > window.innerHeight) {
        posY = window.innerHeight - menuHeight - 10;
      }

      setMenuPosition({ x: posX, y: posY });
      setMenuMessage(msg);
      setShowMenu(true);
    }, 350); // 500ms hold
  };

  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer.current);
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
    ${
      isDesktop
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
              {pinnedMessage && (
          <div
            onClick={() => {
              const el = document.getElementById(
                `msg-${pinnedMessage.id}`,
              );
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 text-sm border-b"
          >
            <Pin size={16} />
            <span className="truncate flex-1 font-medium">
              {pinnedMessage.text}
            </span>
          </div>
        )}

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

          {showInfo && selectedMessage && (
            <div className="absolute top-[90px] left-1/2 -translate-x-1/2 w-[320px] bg-white shadow-2xl rounded-xl z-[10000] p-4 text-sm border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Message Info</h4>
                <button
                  onClick={() => {
                    setShowInfo(false);
                    setSelectedMessage(null);
                  }}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="mb-2 text-xs text-gray-500">
                Sent: {formatTime(selectedMessage.time)}
              </div>

              <div className="font-semibold mb-2">Seen By</div>

              {selectedMessage.seenBy?.length > 0 ? (
                selectedMessage.seenBy.map((user, i) => {
                  const userId = typeof user === "string" ? user : user.userId;

                  let seenTime = null;
                  if (user?.seenAt) {
                    if (typeof user.seenAt.toDate === "function") {
                      seenTime = user.seenAt.toDate();
                    } else if (user.seenAt.seconds) {
                      seenTime = new Date(user.seenAt.seconds * 1000);
                    } else {
                      seenTime = new Date(user.seenAt);
                    }
                  }

                  return (
                    <div key={i} className="flex justify-between mb-1">
                      <span>{usersMap[userId] || "User"}</span>
                      <span className="text-gray-500 text-xs">
                        {seenTime
                          ? seenTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400">Not seen yet</div>
              )}
            </div>
          )}
  {pinnedMessage && (
        <div
          onClick={() => {
            const el = document.getElementById(`msg-${pinnedMessage.id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 text-sm border-b"
        >
          <Pin size={16} />
          <span className="truncate flex-1 font-medium">
            {pinnedMessage.text}
          </span>
        </div>
      )}
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

            {messages
              .filter((msg) => !msg.deletedFor?.includes(currentUser?.uid))
              .map((msg, index) => {
                const isMe = msg.senderId === currentUser?.uid;

                const prevMsg = messages[index - 1];
                const showUsername =
                  !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);

                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    onTouchStart={
                    !isDesktop
                      ? (e) => {
                          handleTouchStart(e, msg); // swipe start
                          handleLongPressStart(e, msg); // long press start
                        }
                      : undefined
                  }
                  onTouchMove={
                    !isDesktop
                      ? (e) => {
                          handleTouchMove(e, msg); // swipe move
                          handleLongPressEnd(); // cancel long press if moving
                        }
                      : undefined
                  }
                  onTouchEnd={
                    !isDesktop
                      ? () => {
                          handleTouchEnd(msg); // swipe end
                          handleLongPressEnd(); // cancel timer
                        }
                      : undefined
                  }
                >
                  <div
                    onContextMenu={(e) => {
                      e.preventDefault();

                      const menuWidth = 224; // w-56
                      const menuHeight = 220;

                      let posX = e.clientX;
                      let posY = e.clientY;

                      if (posX + menuWidth > window.innerWidth) {
                        posX = window.innerWidth - menuWidth - 10;
                      }

                      if (posY + menuHeight > window.innerHeight) {
                        posY = window.innerHeight - menuHeight - 10;
                      }

                      setMenuPosition({ x: posX, y: posY });
                      setMenuMessage(msg);
                      setShowMenu(true);
                    }}
                    className={`relative pl-1.5 pr-2 py-0.5 rounded-md text-sm shadow-sm break-words max-w-[75%] leading-relaxed transition-transform duration-200 ease-out
                    ${
                      isMe
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
                        : "bg-white text-gray-800 border border-gray-100"
                    }`}
                    style={{
                      transform:
                        swipingId === msg.id
                          ? `translateX(${swipeOffset}px)`
                          : "translateX(0px)",
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
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          isMe ? "-left-6" : "-right-6"
                        } text-black hover:scale-110 transition`}
                      >
                        <Reply size={17} strokeWidth={2.2} />
                      </button>
                    )}
                    {msg.replyTo && (
                      <div
                        className={`relative mb-2 px-3 py-2 rounded-lg text-xs max-w-full
                      ${
                        isMe
                          ? "bg-white/20 border-l-4 border-green-300"
                          : "bg-gray-100 border-l-4 border-indigo-500"
                      }`}
                      >
                        {/* Username */}
                        <div className="font-semibold text-[11px] truncate">
                          {usersMap[msg.replyTo.senderId] || "User"}
                        </div>

                        {/* Replied Text */}
                        <div className="opacity-80 truncate break-words">
                          {msg.replyTo.text}
                        </div>
                      </div>
                    )}

                    <div className="max-w-full">
                      <div className="flex flex-wrap items-end gap-x-1 justify-end">
                        <span className="break-words whitespace-pre-wrap mr-auto">
                          {msg.text}
                        </span>

                        <span className="text-[10px] opacity-60 whitespace-nowrap mb-0.5">
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
                    <EmojiPicker onEmojiClick={handleEmojiClick} height={350} />
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

      {/* Menu */}
      {showMenu && menuMessage && (
        <div
          className="chat-menu fixed z-[10000] bg-zinc-900 text-white rounded-xl shadow-2xl w-56 py-2 border border-zinc-700"
          style={{
            top: menuPosition.y,
            left: menuPosition.x,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Message Info */}
          <MenuItem
            icon={<Info size={18} />}
            label="Message info"
            onClick={() => {
              setSelectedMessage(menuMessage);
              setShowInfo(true);
              setShowMenu(false);
            }}
          />

          {/* Edit - only if it's my message */}
          {menuMessage.senderId === currentUser?.uid && (
            <MenuItem
              icon={<Pencil size={18} />}
              label="Edit"
              onClick={() => {
                setInput(menuMessage.text);
                setShowMenu(false);
              }}
            />
          )}

          {/* Pin */}
          <MenuItem icon={<Pin size={18} />} label="Pin" onClick={handlePin} />

          {/* Delete - only if it's my message */}
          <MenuItem
            icon={<Trash2 size={18} />}
            label="Delete for me"
            danger
            onClick={handleDeleteForMe}
          />

          {menuMessage.senderId === currentUser?.uid && (
            <MenuItem
              icon={<Trash2 size={18} />}
              label="Delete for everyone"
              danger
              onClick={handleDeleteForEveryone}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SupportChat;