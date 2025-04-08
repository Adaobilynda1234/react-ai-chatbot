import { useState, useEffect, useRef } from "react";
import { Chat } from "./components/Chat/Chat";
import { Controls } from "./components/Controls/Controls";
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from "./App.module.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [assistantInstance, setAssistantInstance] = useState(null);
  const isInitialized = useRef(false);

  // Initialize the assistant once
  useEffect(() => {
    if (!isInitialized.current) {
      const googleai = new GoogleGenerativeAI(
        import.meta.env.VITE_GOGGLE_AI_API_KEY
      );
      const gemini = googleai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = gemini.startChat({ history: [] });

      setAssistantInstance(chat);
      isInitialized.current = true;
    }
  }, []);

  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  async function handleContentSend(content) {
    addMessage({ content, role: "user" });

    if (!assistantInstance) {
      addMessage({
        content: "Assistant is initializing. Please try again in a moment.",
        role: "system",
      });
      return;
    }

    try {
      const result = await assistantInstance.sendMessage(content);
      addMessage({ content: result.response.text(), role: "assistant" });
    } catch (error) {
      addMessage({
        content: "Sorry, I couldn't process your request. Please try again!",
        role: "system",
      });
    }
  }

  return (
    <div className={styles.App}>
      <header className={styles.Header}>
        <img className={styles.Logo} src="/chat-bot.png" alt="Chat bot logo" />
        <h2 className={styles.Title}>AI Chatbot</h2>
      </header>
      <div className={styles.ChatContainer}>
        <Chat messages={messages} />
      </div>
      <Controls onSend={handleContentSend} />
    </div>
  );
}

export default App;
