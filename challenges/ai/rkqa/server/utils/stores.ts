import { prompt, type ChatMessage } from "~~/types/chat";

interface Stores {
  chatHistory: ChatMessage[],
  clearHistory(): void;
};

const stores: Stores = {
  chatHistory: [
    {
      role: 'system',
      content: prompt,
    }
  ],
  clearHistory() {
    this.chatHistory.splice(0, this.chatHistory.length, {
      role: 'system',
      content: prompt,
    });
  },
};

export default stores; 
