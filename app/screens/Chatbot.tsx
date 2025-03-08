import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Audio } from 'expo-av';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

// AutoScrollingText component as defined earlier
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
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);

  const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Function to play pop sound for every touch
  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sound/pop.mp3') // Adjust the path if necessary
      );
      await sound.setVolumeAsync(0.3);
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error('Error playing pop sound:', error);
    }
  };

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
      <StatusBar
        hidden={false}
        barStyle="light-content"
        backgroundColor="#5F48EA"
      />
      <LinearGradient colors={['#e8daef', '#f4f6f7']} style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#5F48EA', '#7B5FFF']} style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={async () => {
              await playPopSound();
              router.back();
            }}
          >
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
            const autoScrollForThis = isBot && index === messages.length - 1 ? autoScrollEnabled : false;
            return (
              <View style={[styles.messageRow, isBot ? styles.botRow : styles.userRow]}>
                {isBot && <Image source={require('@/assets/images/chatbot.png')} style={styles.botAvatar} />}
                <View style={[styles.messageBubble, isBot ? styles.botBubble : styles.userBubble]}>
                  <AutoScrollingText text={item.text} isBot={isBot} autoScroll={autoScrollForThis} />
                  <TouchableOpacity
                    onPress={async () => {
                      await playPopSound();
                      copyToClipboard(item.text);
                    }}
                    style={styles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.chatContainer}
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
            onSubmitEditing={async () => {
              await playPopSound();
              sendMessage();
            }}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={async () => {
              await playPopSound();
              sendMessage();
            }}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="paper-plane" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

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
  scrollContainer: { maxHeight: 300 },
  messageText: { fontSize: 16, fontFamily: 'outfit', marginRight: 20 },
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
    borderRadius: 21,
    backgroundColor: '#B28CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Chatbot;
