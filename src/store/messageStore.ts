import { create } from "zustand";

interface MessageState {
  lastBotMessage: string | null;
  setLastBotMessage: (message: string) => void;
  isProcessingMessage: boolean;
  setIsProcessingMessage: (isProcessing: boolean) => void;
  messageTimestamp: number;
  setMessageTimestamp: (timestamp: number) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  lastBotMessage: null,
  setLastBotMessage: (message) => set({ lastBotMessage: message }),
  isProcessingMessage: false,
  setIsProcessingMessage: (isProcessing) =>
    set({ isProcessingMessage: isProcessing }),
  messageTimestamp: 0,
  setMessageTimestamp: (timestamp) => set({ messageTimestamp: timestamp }),
}));
