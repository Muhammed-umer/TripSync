// src/components/SupportChat.jsx
import { useState, useEffect } from "react";

const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Always open on desktop
  useEffect(() => {
    if (isDesktop) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isDesktop]);

  return (
    <>
      {/* Floating Icon (Only on Mobile) */}
      {!isDesktop && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setOpen(!open)}
            className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl"
          >
            💬
          </button>
        </div>
      )}

      {/* Chat Box */}
      {open && (
        <div
          className={`
            fixed z-50 bg-white shadow-2xl flex flex-col
            ${isDesktop 
              ? "bottom-6 right-6 w-96 h-[500px] rounded-xl" 
              : "bottom-24 right-6 w-80 rounded-xl"}
          `}
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-3 rounded-t-xl flex justify-between">
            <span className="font-medium">TripSync Support</span>

            {!isDesktop && (
              <button onClick={() => setOpen(false)}>✖</button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-600">
            <p>Hello 👋 How can we help you?</p>
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button className="bg-indigo-600 text-white px-3 rounded text-sm">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;