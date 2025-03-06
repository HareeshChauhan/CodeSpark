import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

/**
 * AutoScrollingText wraps message text in a ScrollView.
 * When autoScroll is true, it automatically scrolls to the bottom on text updates.
 * Otherwise, the user can manually scroll the text.
 */
const AutoScrollingText: React.FC<{ text: string; isBot: boolean; autoScroll: boolean }> = ({
  text,
  isBot,
  autoScroll,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (autoScroll) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [text, autoScroll]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollContainer}
      nestedScrollEnabled={true}
      scrollEnabled={true}
      showsVerticalScrollIndicator={true}
    >
      <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
        {text}
      </Text>
    </ScrollView>
  );
};

const Chatbot: React.FC = () => {
  const router = useRouter();
  const flatListRef = useRef<FlatList<Message>>(null);

  const defaultMessages: Message[] = [
    { text: 'Hey there!', sender: 'bot' },
    { text: 'How may I help you?', sender: 'bot' },
  ];

  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // autoScrollEnabled is used for the last bot message while text is still appending.
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);

  const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    setLoading(true);

    const userMessage: Message = { text: inputText, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    const temp = inputText;
    setInputText('');

    try {
      const response = await axios.post(
        GEMINI_API_URL,
        { contents: [{ parts: [{ text: temp }] }] },
        { headers: { 'Content-Type': 'application/json' } }
      );

      let botResponse =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
      botResponse = botResponse.replace(/\*/g, '').replace(/_/g, '');
      displayBotMessage(botResponse);
    } catch (error: any) {
      console.error('Error fetching response:', error.response?.data || error.message);
      Alert.alert('API Error', error.response?.data?.error?.message || 'Something went wrong.');
      displayBotMessage('Error fetching response.');
    } finally {
      setLoading(false);
    }
  };

  const displayBotMessage = (fullText: string) => {
    const words = fullText.split(' ');
    let currentText = '';
    let index = 0;

    // Enable auto scroll while bot is typing
    setAutoScrollEnabled(true);

    const interval = setInterval(() => {
      if (index < words.length) {
        currentText += words[index] + ' ';
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage?.sender === 'bot') {
            lastMessage.text = currentText;
          } else {
            newMessages.push({ text: currentText, sender: 'bot' });
          }
          return newMessages;
        });
        index++;
      } else {
        clearInterval(interval);
        // Disable auto scroll after full output is generated
        setAutoScrollEnabled(false);
      }
    }, 50);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied!', 'Message copied to clipboard.');
    } catch (error) {
      console.error('Error copying text:', error);
      Alert.alert('Error', 'Failed to copy text.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <LinearGradient colors={['#e8daef', '#f4f6f7']} style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#5F48EA', '#7B5FFF']} style={styles.headerContainer}>
          <TouchableOpacity style={styles.iconContainer} onPress={() => router.back()}>
            <View style={styles.iconBadge}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat with AI</Text>
        </LinearGradient>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item, index }) => {
            const isBot = item.sender === 'bot';
            // For the last bot message, if it's still auto-scrolling, enable autoScroll.
            const autoScrollForThis = isBot && index === messages.length - 1 ? autoScrollEnabled : false;
            return (
              <View style={[styles.messageRow, isBot ? styles.botRow : styles.userRow]}>
                {isBot && <Image source={require('@/assets/images/chatbot.png')} style={styles.botAvatar} />}
                <View style={[styles.messageBubble, isBot ? styles.botBubble : styles.userBubble]}>
                  <AutoScrollingText text={item.text} isBot={isBot} autoScroll={autoScrollForThis} />
                  <TouchableOpacity onPress={() => copyToClipboard(item.text)} style={styles.copyButton}>
                    <Ionicons name="copy-outline" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.chatContainer}
          // No auto-scroll for the chat container; users can scroll manually.
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.purple} />
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            ) : null
          }
        />

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything"
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            editable={!loading}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="paper-plane" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1 },
  iconContainer: { position: 'absolute', top: 15, left: 20, zIndex: 1 },
  iconBadge: { backgroundColor: '#8B6FFF', padding: 8, borderRadius: 10 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'outfit-bold', marginVertical: 10 },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  chatContainer: { flexGrow: 1, paddingBottom: 100, paddingTop: 10 },
  botAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  messageRow: { marginVertical: 4 },
  userRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  botRow: { flexDirection: 'row', alignItems: 'flex-start' },
  messageBubble: {
    maxWidth: '85%',
    padding: 10,
    borderRadius: 12,
    position: 'relative',
  },
  userBubble: { backgroundColor: '#B28CFF' },
  botBubble: { backgroundColor: '#FFFFFF' },
  scrollContainer: { maxHeight: 300 }, // Approximately 10 lines of text
  messageText: {
    fontSize: 16,
    fontFamily: 'outfit',
    marginRight: 20, // space for copy icon
  },
  userText: { color: '#FFFFFF' },
  botText: { color: '#333333' },
  copyButton: { position: 'absolute', right: 6, bottom: 6 },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingText: { marginLeft: 8, fontSize: 18, color: Colors.purple, fontFamily: 'outfit' },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: 'outfit',
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 42 / 2,
    backgroundColor: '#B28CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Chatbot;
