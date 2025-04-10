import { useState, useEffect, useRef } from "react";
import { Chat } from "./components/Chat/Chat";
import { Controls } from "./components/Controls/Controls";
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from "./App.module.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [assistantInstance, setAssistantInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  function updateLastMessage(content) {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const lastMessage = newMessages[newMessages.length - 1];
      newMessages[newMessages.length - 1] = {
        ...lastMessage,
        content,
      };
      return newMessages;
    });
  }

  async function handleContentSend(content) {
    addMessage({ content, role: "user" });
    setIsLoading(true);

    if (!assistantInstance) {
      addMessage({
        content: "Assistant is initializing. Please try again in a moment.",
        role: "system",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Add an empty assistant message that we'll update as streaming comes in
      addMessage({ content: "", role: "assistant" });
      
      // Use streaming
      const result = await assistantInstance.sendMessageStream(content);
      
      let accumulatedText = "";
      
      for await (const chunk of result.stream) {
        accumulatedText += chunk.text();
        updateLastMessage(accumulatedText);
      }
      
    } catch (error) {
      console.error("Streaming error:", error);
      updateLastMessage("Sorry, I couldn't process your request. Please try again!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.App}>
      <header className={styles.Header}>
        <img className={styles.Logo} src="/chat-bot.png" alt="Chat bot logo" />
        <h2 className={styles.Title}>Adaobi's AI Chatbot</h2>
      </header>
      <div className={styles.ChatContainer}>
        <Chat messages={messages} />
      </div>
      <Controls onSend={handleContentSend} isLoading={isLoading} />
    </div>
  );
}

export default App;