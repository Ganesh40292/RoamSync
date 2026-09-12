import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, MessageSquare, Users, AlertCircle, Search, Smile, Bot, Paperclip, Trash2, CheckCheck, UserPlus, Mic, MicOff, MapPin, Radio } from 'lucide-react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import tripService from '../../services/tripService';
import chatService from '../../services/chatService';
import aiService from '../../services/aiService';
import InChatInviteModal from '../../components/Modals/InChatInviteModal';
import './ChatRoom.css';

const QUICK_EMOJIS = ['👍', '❤️', '✈️', '🔥', '📍', '😍', '🎉'];

const LANDMARK_PINS = [
  '📍 Mysore Palace',
  '📍 Hampi Ruins',
  '📍 Coorg Coffee Hills',
  '📍 Gokarna Om Beach',
  '📍 Jog Falls',
  '📍 Bangalore Palace',
];

export default function ChatRoom() {
  const { user } = useSelector((state) => state.auth);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [activeChannel, setActiveChannel] = useState('GROUP'); // 'GROUP' or DM username e.g. 'sarah'
  const [messages, setMessages] = useState([]);
  const [dmMessages, setDmMessages] = useState({}); // { [username]: [] }
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMembers, setActiveMembers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const fileInputRef = useRef(null);

  const currentTrip = trips.find((t) => t.id === parseInt(selectedTripId)) || trips[0] || { id: 1, name: 'Karnataka Adventure', title: 'Karnataka Adventure' };

  // Audio Voice Note State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const stompClientRef = useRef(null);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        const fetched = await tripService.getAllTrips();
        setTrips(fetched);
        if (fetched.length > 0) {
          setSelectedTripId(fetched[0].id);
        } else {
          // No trips — still show welcome message so chat works
          setMessages(getWelcomeMessage());
        }
      } catch (e) {
        console.error(e);
        setMessages(getWelcomeMessage());
      }
    }
    loadTrips();
  }, []);

  const getWelcomeMessage = () => [
    {
      id: 1,
      sender: { username: 'Gemini AI Assistant', fullName: 'TripSync AI Bot' },
      content: '👋 Welcome to Next-Level Chat! Use the channel bar above to switch between # Group Channel and Direct 1-on-1 DMs with companions. Ask @AI Concierge anytime for travel advice!',
      timestamp: new Date().toISOString(),
      isAi: true,
    },
  ];

  const reloadMembers = async () => {
    if (!selectedTripId) return;
    try {
      const trip = await tripService.getTripById(selectedTripId);
      setActiveMembers(trip?.members || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!selectedTripId) return;

    async function loadHistory() {
      try {
        const history = await chatService.getChatHistory(selectedTripId);
        setMessages(history && history.length > 0 ? history : getWelcomeMessage());
      } catch (e) {
        console.error('Error loading history logs', e);
        setMessages(getWelcomeMessage());
      }
    }
    loadHistory();

    const trip = trips.find((t) => t.id === parseInt(selectedTripId));
    setActiveMembers(trip?.members || []);

    const socket = new SockJS('/ws');
    const client = Stomp.over(socket);
    client.debug = null;

    const token = localStorage.getItem('token');
    const connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    client.connect(connectHeaders, () => {
      setIsConnected(true);
      stompClientRef.current = client;

      client.subscribe(`/topic/trips/${selectedTripId}/chat`, (msg) => {
        try {
          const chatMsg = JSON.parse(msg.body);
          setMessages((prev) => {
            if (chatMsg.id && prev.some((m) => m.id === chatMsg.id)) {
              return prev;
            }
            return [...prev, chatMsg];
          });
        } catch (err) {
          console.error('Failed to parse incoming WebSocket message', err);
        }
      });
    }, (err) => {
      console.warn('STOMP connection error or offline:', err);
      setIsConnected(false);
    });

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, [selectedTripId, trips]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, dmMessages, activeChannel, isAiThinking]);

  // Voice Note Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const voiceMsg = {
          id: Date.now(),
          sender: { username: user?.username || 'Guest', fullName: user?.fullName || 'Guest' },
          content: `🎙️ Voice Note (${recordingTime}s)`,
          audioUrl,
          timestamp: new Date().toISOString(),
        };

        if (activeChannel === 'GROUP') {
          setMessages((prev) => [...prev, voiceMsg]);
        } else {
          setDmMessages((prev) => ({
            ...prev,
            [activeChannel]: [...(prev[activeChannel] || []), voiceMsg],
          }));
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
      // Simulation voice note fallback
      const voiceMsg = {
        id: Date.now(),
        sender: { username: user?.username || 'Guest', fullName: user?.fullName || 'Guest' },
        content: `🎙️ Voice Note (Simulated 5s)`,
        timestamp: new Date().toISOString(),
      };
      if (activeChannel === 'GROUP') {
        setMessages((prev) => [...prev, voiceMsg]);
      } else {
        setDmMessages((prev) => ({
          ...prev,
          [activeChannel]: [...(prev[activeChannel] || []), voiceMsg],
        }));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const userText = newMessage.trim();
    const isAiQuery = userText.toLowerCase().startsWith('@ai') || userText.toLowerCase().includes('gemini');

    const payload = {
      content: userText,
      senderUsername: user?.username || 'Guest',
    };

    if (replyingTo) {
      payload.replyTo = {
        sender: replyingTo.sender?.username,
        content: replyingTo.content,
      };
    }

    if (activeChannel === 'GROUP') {
      if (isConnected && stompClientRef.current) {
        stompClientRef.current.send(`/app/chat/${selectedTripId}`, {}, JSON.stringify(payload));
      } else {
        const userMsg = {
          id: Date.now(),
          sender: { username: user?.username || 'Guest', fullName: user?.fullName || 'Guest' },
          content: userText,
          replyTo: replyingTo ? { sender: replyingTo.sender?.username, content: replyingTo.content } : null,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
      }
    } else {
      // 1-on-1 Direct Messaging (DM)
      const userMsg = {
        id: Date.now(),
        sender: { username: user?.username || 'Guest', fullName: user?.fullName || 'Guest' },
        recipient: activeChannel,
        content: userText,
        replyTo: replyingTo ? { sender: replyingTo.sender?.username, content: replyingTo.content } : null,
        timestamp: new Date().toISOString(),
      };
      setDmMessages((prev) => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), userMsg],
      }));
    }

    setNewMessage('');
    setReplyingTo(null);

    if (isAiQuery) {
      setIsAiThinking(true);
      try {
        const currentTrip = trips.find((t) => t.id === parseInt(selectedTripId));
        const aiPrompt = userText.replace(/@ai/gi, '').trim() || 'Provide top travel tips for our trip';
        const aiRes = await aiService.generateItinerary({
          destination: currentTrip?.name || currentTrip?.title || 'Karnataka',
          durationDays: 3,
          budget: 'Medium',
          interests: [aiPrompt],
        });

        const aiReply = {
          id: Date.now() + 1,
          sender: { username: 'Gemini AI Assistant', fullName: 'TripSync AI Bot' },
          content: `🤖 AI Travel Tip: ${aiRes?.tripOverview || 'Here are top recommendations for your trip in Karnataka! Explore iconic heritage spots, try filter coffee, and check local weather.'}`,
          timestamp: new Date().toISOString(),
          isAi: true,
        };
        if (activeChannel === 'GROUP') {
          setMessages((prev) => [...prev, aiReply]);
        } else {
          setDmMessages((prev) => ({
            ...prev,
            [activeChannel]: [...(prev[activeChannel] || []), aiReply],
          }));
        }
      } catch (err) {
        console.error('AI chat response error', err);
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const imgMsg = {
      id: Date.now(),
      sender: { username: user?.username || 'Guest', fullName: user?.fullName || 'Guest' },
      content: `📷 Shared photo: ${file.name}`,
      imageUrl,
      timestamp: new Date().toISOString(),
    };

    if (activeChannel === 'GROUP') {
      setMessages((prev) => [...prev, imgMsg]);
    } else {
      setDmMessages((prev) => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), imgMsg],
      }));
    }
  };

  const sendLandmarkPin = (pinText) => {
    setNewMessage(pinText);
  };

  const currentChannelMessages = activeChannel === 'GROUP' ? messages : dmMessages[activeChannel] || [];

  const filteredMessages = currentChannelMessages.filter((m) =>
    (m.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container animate-fade-in">
      <div className="glass-card chat-messages-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header & Controls */}
        <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={22} style={{ color: 'var(--primary-color)' }} />
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>
                {activeChannel === 'GROUP' ? '# Group Channel' : `💬 DM with @${activeChannel}`}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {isConnected ? (
                  <span style={{ color: 'var(--success)' }}>&bull; Live STOMP Connection Active</span>
                ) : (
                  <span style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> Local Simulation Mode (STOMP Standby)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            >
              <UserPlus size={14} /> Invite Companions
            </button>

            <button
              onClick={() => setNewMessage('@AI Concierge: ')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid var(--primary-color)' }}
            >
              <Bot size={14} style={{ color: 'var(--primary-color)' }} /> @AI Concierge
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search chat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '100px' }}
              />
            </div>

            <select
              className="form-input"
              style={{ padding: '0.4rem 0.8rem', background: 'var(--dark-bg)', fontSize: '0.85rem' }}
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.name || t.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Channel Switcher Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveChannel('GROUP')}
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '16px',
              border: activeChannel === 'GROUP' ? '1px solid var(--primary-color)' : '1px solid transparent',
              background: activeChannel === 'GROUP' ? 'rgba(124,58,237,0.25)' : 'none',
              color: activeChannel === 'GROUP' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: activeChannel === 'GROUP' ? 'bold' : 'normal',
            }}
          >
            # Group Channel (All)
          </button>

          {activeMembers.filter((m) => m.username !== user?.username).map((m) => (
            <button
              key={m.username}
              onClick={() => setActiveChannel(m.username)}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '16px',
                border: activeChannel === m.username ? '1px solid var(--secondary-color)' : '1px solid transparent',
                background: activeChannel === m.username ? 'rgba(6,182,212,0.25)' : 'none',
                color: activeChannel === m.username ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: activeChannel === m.username ? 'bold' : 'normal',
              }}
            >
              💬 DM @{m.username}
            </button>
          ))}
        </div>

        {/* Chat Message Stream */}
        <div className="chat-history" ref={chatHistoryRef} style={{ position: 'relative' }}>
          {/* Top Pinned Message Glass Banner */}
          {pinnedMessage && (
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: 'rgba(124, 58, 237, 0.25)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--primary-color)',
                borderRadius: '8px',
                padding: '0.5rem 0.8rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                <span style={{ fontWeight: 'bold' }}>📌 Pinned by @{pinnedMessage.sender?.username}:</span>
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{pinnedMessage.content}</span>
              </div>
              <button onClick={() => setPinnedMessage(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
          )}

          {filteredMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
              No messages in {activeChannel === 'GROUP' ? 'Group Channel' : `@${activeChannel} DM`}. Type below to start chatting!
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelf = msg.sender?.username === user?.username;
              const isAi = msg.isAi || msg.sender?.username?.includes('Gemini');
              return (
                <div key={msg.id} className={`chat-bubble ${isSelf ? 'chat-bubble-sent' : 'chat-bubble-received'}`} style={{ borderLeft: isAi ? '3px solid var(--secondary-color)' : undefined, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span className="chat-sender-name" style={{ color: isAi ? 'var(--secondary-color)' : undefined, fontWeight: 'bold' }}>
                      {isAi ? '🤖 Gemini AI Assistant' : `@${msg.sender?.username || 'Companion'}`}
                    </span>
                    
                    {/* Message Actions Bar (Pin, Reply) */}
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => setPinnedMessage(msg)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }} title="Pin Message">📌</button>
                      <button onClick={() => setReplyingTo(msg)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }} title="Reply">⚡</button>
                    </div>
                  </div>

                  {/* Quoted Parent Reply */}
                  {msg.replyTo && (
                    <div style={{ background: 'rgba(0,0,0,0.25)', borderLeft: '2px solid var(--primary-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <strong>@{msg.replyTo.sender}</strong>: {msg.replyTo.content}
                    </div>
                  )}

                  {msg.imageUrl && (
                    <div style={{ margin: '0.4rem 0' }}>
                      <img src={msg.imageUrl} alt="Shared Attachment" style={{ maxWidth: '240px', maxHeight: '180px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'cover' }} />
                    </div>
                  )}

                  {msg.audioUrl ? (
                    <div style={{ margin: '0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <audio controls src={msg.audioUrl} style={{ height: '32px', maxWidth: '220px' }} />
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span className="chat-message-time" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSelf && <CheckCheck size={12} style={{ color: '#10b981' }} />}
                  </div>
                </div>
              );
            })
          )}

          {isAiThinking && (
            <div className="chat-bubble chat-bubble-received" style={{ borderLeft: '3px solid var(--secondary-color)', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              🤖 Gemini AI Assistant is generating travel recommendations...
            </div>
          )}

          {newMessage.trim().length > 0 && (
            <div style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', color: 'var(--secondary-color)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>Composing message</span>
              <span className="animate-pulse">...</span>
            </div>
          )}
        </div>

        {/* Landmark Pin Quick Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
            <MapPin size={12} style={{ color: 'var(--secondary-color)' }} /> Pin Landmark:
          </span>
          {LANDMARK_PINS.map((pin) => (
            <button
              key={pin}
              type="button"
              onClick={() => sendLandmarkPin(pin)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#e5e7eb', fontSize: '0.75rem', cursor: 'pointer', padding: '0.15rem 0.5rem', borderRadius: '12px', whiteSpace: 'nowrap' }}
            >
              {pin}
            </button>
          ))}
        </div>

        {/* Quoted Reply Banner Above Input */}
        {replyingTo && (
          <div style={{ background: 'rgba(124, 58, 237, 0.15)', borderLeft: '3px solid var(--primary-color)', padding: '0.4rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-primary)' }}>⚡ Replying to <strong>@{replyingTo.sender?.username}</strong>: "{replyingTo.content}"</span>
            <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>&times;</button>
          </div>
        )}

        {/* Input Form & Voice Notes Recorder & Image Attachment */}
        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          {/* Image Attachment Paperclip Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Attach Photo / Document"
          >
            <Paperclip size={18} />
          </button>
          {/* Voice Notes Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'none',
              border: isRecording ? '1px solid var(--danger)' : 'none',
              color: isRecording ? 'var(--danger)' : 'var(--text-muted)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={isRecording ? `Recording... (${recordingTime}s)` : 'Record Voice Note'}
          >
            {isRecording ? <MicOff size={18} className="animate-pulse-glow" /> : <Mic size={18} />}
          </button>

          {isRecording && (
            <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Radio size={14} className="animate-pulse" /> Rec {recordingTime}s
            </span>
          )}

          <input
            type="text"
            className="form-input"
            style={{ flexGrow: 1 }}
            placeholder={activeChannel === 'GROUP' ? "Type a message or '@AI Concierge'..." : `Direct message @${activeChannel}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}

          />
          <button type="submit" className="btn-primary animate-pulse-glow" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={16} />
            Send
          </button>
        </form>
      </div>

      {/* Online Companions Sidebar */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Users size={18} style={{ color: 'var(--primary-color)' }} />
            Companions ({activeMembers.length || 1})
          </h4>
          <button onClick={() => setIsInviteOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }} title="Add Companion">
            <UserPlus size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(activeMembers.length > 0 ? activeMembers : [user]).map((member, idx) => (
            <div key={idx} onClick={() => setActiveChannel(member?.username || 'GROUP')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', background: activeChannel === member?.username ? 'rgba(124, 58, 237, 0.15)' : 'transparent' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                  {(member?.username || 'U')[0].toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--dark-bg)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{member?.fullName || member?.username || 'Companion'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{member?.username || 'user'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InChatInviteModal
        trip={currentTrip}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onCompanionAdded={(newMember) => {
          if (newMember) {
            setActiveMembers((prev) => [...prev, newMember]);
          }
          reloadMembers();
        }}
      />
    </div>
  );
}
