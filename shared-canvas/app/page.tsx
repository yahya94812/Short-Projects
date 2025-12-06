"use client"
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { getDatabase, ref, push, onValue, set, onDisconnect, serverTimestamp, remove, get } from 'firebase/database';
import { 
  Pencil, Square, Circle, Type, MessageSquare, Users, 
  LogOut, Eraser, MousePointer2, Send, X, Check,
  Triangle, Diamond, Minus, ArrowRight, Undo, Download
} from 'lucide-react';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCPBmR8pzvjwhhq0Q9vAXpVV5QyG3xubc",
  authDomain: "short-projects-998ab.firebaseapp.com",
  databaseURL: "https://short-projects-998ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "short-projects-998ab",
  storageBucket: "short-projects-998ab.firebasestorage.app",
  messagingSenderId: "611620654692",
  appId: "1:611620654692:web:67a859aeda686d4d1f9971",
  measurementId: "G-EKDPHHQHRB"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const database = getDatabase(app);

interface Session {
  name: string;
  username: string;
}

interface CanvasPageProps {
  session: Session;
  onLeave: () => void;
}

interface Shape {
  id?: string;
  type: string;
  color: string;
  strokeWidth: number;
  userId: string;
  timestamp: number;
  path?: Array<{x: number; y: number}>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface User {
  id: string;
  username: string;
  joinedAt: number;
  lastActive: number;
}

function SharedCanvas() {
  const [currentPage, setCurrentPage] = useState('home');
  const [sessionName, setSessionName] = useState('');
  const [username, setUsername] = useState('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  
  const handleJoinSession = () => {
    if (sessionName.trim() && username.trim()) {
      setCurrentSession({ name: sessionName.trim(), username: username.trim() });
      setCurrentPage('canvas');
    }
  };

  const handleLeaveSession = () => {
    setCurrentPage('home');
    setCurrentSession(null);
    setSessionName('');
  };

  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
              <Pencil className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Shared Canvas</h1>
            <p className="text-gray-500 font-medium">Collaborate seamlessly with your team</p>
          </div>
          
          <div className="space-y-5">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Alice Designer"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Session ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. team-brainstorm-24"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-gray-800 placeholder-gray-400 font-medium"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                />
              </div>
            </div>
            
            <button
              onClick={handleJoinSession}
              disabled={!sessionName.trim() || !username.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Enter Studio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <CanvasPage session={currentSession!} onLeave={handleLeaveSession} />;
}

function CanvasPage({ session, onLeave }: CanvasPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#1e1b4b');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x: number; y: number} | null>(null);
  const [currentPath, setCurrentPath] = useState<Array<{x: number; y: number}>>([]);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{x: number; y: number} | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [showChat, setShowChat] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const userId = useRef(Date.now().toString());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [shapes, canvasSize]);

  useEffect(() => {
    const userRef = ref(database, `sessions/${session.name}/users/${userId.current}`);
    set(userRef, {
      username: session.username,
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });

    onDisconnect(userRef).remove();

    const shapesRef = ref(database, `sessions/${session.name}/shapes`);
    const unsubShapes = onValue(shapesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shapesArray = Object.entries(data).map(([id, shape]) => ({ id, ...(shape as object) } as Shape));
        setShapes(shapesArray);
      } else {
        setShapes([]);
      }
    });

    const messagesRef = ref(database, `sessions/${session.name}/messages`);
    const unsubMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.entries(data).map(([id, msg]) => ({ id, ...(msg as object) } as Message));
        setMessages(messagesArray.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
    });

    const usersRef = ref(database, `sessions/${session.name}/users`);
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.entries(data).map(([id, user]) => ({ id, ...(user as object) } as User));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });

    return () => {
      unsubShapes();
      unsubMessages();
      unsubUsers();
    };
  }, [session.name, session.username]);

  useEffect(() => {
    if (showChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  // --- Drawing Logic ---
  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = shape.strokeWidth;
    
    if (shape.type === 'pencil' && shape.path) {
      ctx.beginPath();
      shape.path.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    } else if (shape.type === 'rectangle' && shape.x !== undefined && shape.y !== undefined && shape.width !== undefined && shape.height !== undefined) {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === 'circle' && shape.x !== undefined && shape.y !== undefined && shape.radius !== undefined) {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape.type === 'text' && shape.text && shape.x !== undefined && shape.y !== undefined) {
      ctx.font = `${shape.fontSize || 24}px Inter, system-ui, sans-serif`;
      ctx.fillText(shape.text, shape.x, shape.y);
    } else if (shape.type === 'triangle' && shape.x !== undefined && shape.y !== undefined && shape.width !== undefined && shape.height !== undefined) {
      ctx.beginPath();
      ctx.moveTo(shape.x + shape.width / 2, shape.y);
      ctx.lineTo(shape.x, shape.y + shape.height);
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
      ctx.closePath();
      ctx.stroke();
    } else if (shape.type === 'diamond' && shape.x !== undefined && shape.y !== undefined && shape.width !== undefined && shape.height !== undefined) {
      ctx.beginPath();
      ctx.moveTo(shape.x + shape.width / 2, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
      ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
      ctx.lineTo(shape.x, shape.y + shape.height / 2);
      ctx.closePath();
      ctx.stroke();
    } else if (shape.type === 'line' && shape.startX !== undefined && shape.startY !== undefined && shape.endX !== undefined && shape.endY !== undefined) {
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
    } else if (shape.type === 'arrow' && shape.startX !== undefined && shape.startY !== undefined && shape.endX !== undefined && shape.endY !== undefined) {
      const headLength = 15;
      const dx = shape.endX - shape.startX;
      const dy = shape.endY - shape.startY;
      const angle = Math.atan2(dy, dx);
      
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(shape.endX - headLength * Math.cos(angle - Math.PI / 6), shape.endY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(shape.endX - headLength * Math.cos(angle + Math.PI / 6), shape.endY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(shape.endX, shape.endY);
      ctx.fill(); // Fill arrow head
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    shapes.forEach(shape => drawShape(ctx, shape));
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (tool === 'text') {
      setTextPosition(pos);
      return;
    }
    setIsDrawing(true);
    setStartPos(pos);
    if (tool === 'pencil') {
      setCurrentPath([pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const pos = getMousePos(e);
    
    if (tool === 'pencil') {
      setCurrentPath(prev => [...prev, pos]);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (currentPath.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else {
      // Ghost preview for all other shapes
      drawCanvas(); // Clear and redraw existing
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Create temporary shape object for preview
      let previewShape: Shape = {
        type: tool,
        color: color + '80', // Transparent preview
        strokeWidth: strokeWidth,
        userId: userId.current,
        timestamp: Date.now()
      };

      if (['rectangle', 'triangle', 'diamond'].includes(tool)) {
        previewShape.x = Math.min(startPos.x, pos.x);
        previewShape.y = Math.min(startPos.y, pos.y);
        previewShape.width = Math.abs(pos.x - startPos.x);
        previewShape.height = Math.abs(pos.y - startPos.y);
      } else if (tool === 'circle') {
        previewShape.x = startPos.x;
        previewShape.y = startPos.y;
        previewShape.radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      } else if (tool === 'line' || tool === 'arrow') {
        previewShape.startX = startPos.x;
        previewShape.startY = startPos.y;
        previewShape.endX = pos.x;
        previewShape.endY = pos.y;
      }

      drawShape(ctx, previewShape);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const pos = getMousePos(e);
    const shapesRef = ref(database, `sessions/${session.name}/shapes`);
    const baseShape = {
      color,
      strokeWidth,
      userId: userId.current,
      timestamp: Date.now()
    };

    let newShape = null;

    if (tool === 'pencil' && currentPath.length > 0) {
      newShape = { ...baseShape, type: 'pencil', path: currentPath };
    } else if (['rectangle', 'triangle', 'diamond'].includes(tool)) {
      newShape = {
        ...baseShape,
        type: tool,
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y)
      };
    } else if (tool === 'circle') {
      newShape = {
        ...baseShape,
        type: 'circle',
        x: startPos.x,
        y: startPos.y,
        radius: Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2))
      };
    } else if (tool === 'line' || tool === 'arrow') {
      newShape = {
        ...baseShape,
        type: tool,
        startX: startPos.x,
        startY: startPos.y,
        endX: pos.x,
        endY: pos.y
      };
    }

    if (newShape) push(shapesRef, newShape);
    
    setIsDrawing(false);
    setCurrentPath([]);
    drawCanvas(); // Final draw
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      const shapesRef = ref(database, `sessions/${session.name}/shapes`);
      push(shapesRef, {
        type: 'text',
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        fontSize,
        color,
        userId: userId.current,
        timestamp: Date.now()
      });
      setTextInput('');
      setTextPosition(null);
    }
  };

  const handleUndo = () => {
    // Find last shape by this user
    const myShapes = shapes.filter(s => s.userId === userId.current);
    if (myShapes.length > 0) {
      const lastShape = myShapes[myShapes.length - 1];
      const shapeRef = ref(database, `sessions/${session.name}/shapes/${lastShape.id}`);
      remove(shapeRef);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if(canvas) {
      const link = document.createElement('a');
      link.download = `canvas-${session.name}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const messagesRef = ref(database, `sessions/${session.name}/messages`);
      push(messagesRef, {
        username: session.username,
        message: newMessage,
        timestamp: Date.now()
      });
      setNewMessage('');
    }
  };

  const clearCanvas = () => {
    if(window.confirm("Are you sure you want to clear the entire canvas for everyone?")) {
        const shapesRef = ref(database, `sessions/${session.name}/shapes`);
        set(shapesRef, null);
    }
  };

  // Tool groups for the UI
  const tools = [
    { id: 'pencil', icon: Pencil, label: 'Draw' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'diamond', icon: Diamond, label: 'Diamond' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden relative">
      
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="bg-white/90 backdrop-blur shadow-sm rounded-full px-6 py-2 flex items-center gap-4 pointer-events-auto border border-gray-200/50">
           <button onClick={onLeave} className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors" title="Leave Session">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <div>
            <h2 className="font-bold text-gray-800 text-sm">{session.name}</h2>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-500 font-medium">{users.length} active</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
             <button
                onClick={handleDownload}
                className="bg-white/90 backdrop-blur shadow-sm rounded-full p-3 border border-gray-200/50 hover:bg-gray-50 text-gray-600 transition-all"
                title="Download Image"
            >
                <Download className="w-5 h-5" />
            </button>
             <button
                onClick={handleUndo}
                className="bg-white/90 backdrop-blur shadow-sm rounded-full p-3 border border-gray-200/50 hover:bg-gray-50 text-gray-600 transition-all"
                title="Undo Last Action"
            >
                <Undo className="w-5 h-5" />
            </button>
            <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full shadow-sm border border-gray-200/50 transition-all relative ${showChat ? 'bg-indigo-100 text-indigo-600' : 'bg-white/90 backdrop-blur hover:bg-gray-50 text-gray-600'}`}
            >
                <MessageSquare className="w-5 h-5" />
                {!showChat && messages.length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="flex-1 w-full h-full bg-[#fdfdfd] cursor-crosshair">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
          className="block touch-none"
        />
        
        {/* Floating Text Input */}
        {textPosition && (
          <div 
            className="absolute bg-white p-3 rounded-xl shadow-2xl border border-indigo-100 animation-fade-in" 
            style={{ left: Math.min(textPosition.x, canvasSize.width - 300), top: Math.min(textPosition.y, canvasSize.height - 100) }}
          >
            <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-indigo-500"/>
                <span className="text-xs font-bold text-gray-500 uppercase">Add Text</span>
            </div>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder="Type something..."
              className="w-64 border-2 border-indigo-100 focus:border-indigo-500 px-3 py-2 rounded-lg mb-3 outline-none text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setTextPosition(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4"/>
              </button>
              <button onClick={handleTextSubmit} className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200">
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toolbar (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-[90%] max-w-2xl">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2 flex flex-wrap items-center justify-center gap-2 transition-all hover:scale-[1.01]">
          <div className="flex flex-wrap items-center justify-center gap-1 pr-3 border-r border-gray-200">
            {tools.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    title={t.label}
                    className={`p-2.5 rounded-xl transition-all ${
                        tool === t.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <t.icon className="w-5 h-5" />
                </button>
            ))}
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="flex flex-col gap-1">
                <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-200 p-0.5 bg-white"
                title="Color"
                />
            </div>
            <div className="w-24 px-2">
                <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                title="Stroke Width"
                />
            </div>
          </div>
          
          <div className="pl-3 border-l border-gray-200">
            <button
                onClick={clearCanvas}
                className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Clear All (Everyone)"
            >
                <Eraser className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Panel (Right Side) */}
      <div 
        className={`absolute top-20 right-4 bottom-24 w-80 bg-white/95 backdrop-blur shadow-2xl rounded-2xl flex flex-col border border-gray-100 transition-transform duration-300 ease-in-out z-40 ${
            showChat ? 'translate-x-0' : 'translate-x-[120%]'
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500"/> 
            Team Chat
          </h3>
          <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-10">No messages yet.<br/>Say hello! 👋</div>
          )}
          {messages.map((msg) => {
            const isMe = msg.username === session.username;
            return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMe 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                        {!isMe && <div className="text-xs font-bold text-gray-500 mb-1">{msg.username}</div>}
                        {msg.message}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-gray-50/50 rounded-b-2xl border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="w-full pl-4 pr-12 py-3 border-none bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedCanvas;