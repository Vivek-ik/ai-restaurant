import React from "react";

export default function AiChatModal({ isOpen, onClose, children }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      {/* <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-4 relative"> */}
        {children}
      {/* </div> */}
    </div>
  );
}
