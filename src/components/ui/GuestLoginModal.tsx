// components/ui/GuestLoginModal.tsx
import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onContinue: (name: string, sentence: string) => void;
}

export const GuestLoginModal: React.FC<Props> = ({ onClose, onContinue }) => {
  const [name, setName] = useState("");
  const [sentence, setSentence] = useState("");

  const isDisabled = name.trim() === "" || sentence.trim() === "";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Guest Login</h2>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Say something to begin"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              isDisabled
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={() => onContinue(name, sentence)}
            disabled={isDisabled}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
