// ./src/pages/SupportChat.jsx
import { useState, useEffect } from "react";

const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isDesktop]);

  return (
    <>
      {/* Mobile Floating Button */}
      {!isDesktop && !open && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setOpen(true)}
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
            ${
              isDesktop
                ? "bottom-6 right-6 w-96 h-[500px] rounded-xl"
                : "top-16 right-3 left-3 h-[70vh] rounded-2xl"
            }
          `}
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <span className="font-medium text-sm sm:text-base">
              TripSync Support
            </span>

            {!isDesktop && (
              <button
                onClick={() => setOpen(false)}
                className="text-lg"
              >
                ✖
              </button>
            )}
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-600">
            <p>Hello 👋 How can we help you?</p>
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;