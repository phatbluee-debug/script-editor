import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Download, Eye, Edit3, Film, Users, MapPin, Mic, Square, Play, Pause, Upload, Volume2, Save, RefreshCw } from 'lucide-react';

export default function ScriptEditor() {
  const [scenes, setScenes] = useState([
    {
      id: 1,
      number: 1,
      heading: 'INT. PHÒNG KHÁCH - BAN NGÀY',
      description: 'Căn phòng được trang trí đơn giản, ánh sáng tự nhiên từ cửa sổ.',
      characters: ['MINH', 'LAN'],
      dialogues: [
        { character: 'MINH', text: 'Em có nghe thấy tiếng gì không?', audioData: null },
        { character: 'LAN', text: 'Không, anh đang lo lắng quá đấy.', audioData: null }
      ]
    }
  ]);

  const [currentScene, setCurrentScene] = useState(0);
  const [scriptId, setScriptId] = useState(Date.now().toString());
  const [scriptTitle, setScriptTitle] = useState('Kịch Bản Chưa Đặt Tên');
  const [author, setAuthor] = useState('Tác giả');
  const [viewMode, setViewMode] = useState('edit');
  const [saveStatus, setSaveStatus] = useState('');
  const [savedScripts, setSavedScripts] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFor, setRecordingFor] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);

  useEffect(() => {
    loadSavedScripts();
  }, []);

  const loadSavedScripts = () => {
    const stored = JSON.parse(localStorage.getItem('scriptEditorScripts') || '[]');
    setSavedScripts(stored);
  };

  const loadScript = (id) => {
    const stored = JSON.parse(localStorage.getItem('scriptEditorScripts') || '[]');
    const script = stored.find(s => s.id === id);
    if (script) {
      setScriptId(script.id);
      setScriptTitle(script.title);
      setAuthor(script.author);
      setScenes(script.scenes);
      setCurrentScene(0);
      setSaveStatus('Đã tải kịch bản!');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const saveToStorage = () => {
    try {
      setSaveStatus('Đang lưu...');
      const scriptData = {
        id: scriptId,
        title: scriptTitle,
        author: author,
        scenes: scenes,
        updatedAt: new Date().toISOString()
      };
      
      const stored = JSON.parse(localStorage.getItem('scriptEditorScripts') || '[]');
      const existingIndex = stored.findIndex(s => s.id === scriptId);
      
      if (existingIndex !== -1) {
        stored[existingIndex] = scriptData;
      } else {
        stored.push(scriptData);
      }
      
      localStorage.setItem('scriptEditorScripts', JSON.stringify(stored));
      setSaveStatus('✓ Đã lưu!');
      loadSavedScripts();
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      setSaveStatus('✗ Lỗi!');
    }
  };

  const deleteScript = (id) => {
    if (!confirm('Bạn có chắc muốn xóa kịch bản này?')) return;
    const stored = JSON.parse(localStorage.getItem('scriptEditorScripts') || '[]');
    const filtered = stored.filter(s => s.id !== id);
    localStorage.setItem('scriptEditorScripts', JSON.stringify(filtered));
    loadSavedScripts();
    if (scriptId === id) {
      setScriptId(Date.now().toString());
      setScriptTitle('Kịch Bản Mới');
      setAuthor('Tác giả');
      setScenes([{
        id: 1, number: 1, heading: 'INT/EXT. ĐỊA ĐIỂM - THỜI GIAN',
        description: 'Mô tả cảnh quay...', characters: [], dialogues: []
      }]);
    }
  };

  const addScene = () => {
    setScenes([...scenes, {
      id: Date.now(), number: scenes.length + 1, heading: 'INT/EXT. ĐỊA ĐIỂM - THỜI GIAN',
      description: 'Mô tả cảnh quay...', characters: [], dialogues: []
    }]);
    setCurrentScene(scenes.length);
  };

  const deleteScene = (index) => {
    if (scenes.length > 1) {
      const newScenes = scenes.filter((_, i) => i !== index);
      setScenes(newScenes.map((s, i) => ({ ...s, number: i + 1 })));
      if (currentScene >= newScenes.length) setCurrentScene(newScenes.length - 1);
    }
  };

  const updateScene = (field, value) => {
    const newScenes = [...scenes];
    newScenes[currentScene][field] = value;
    setScenes(newScenes);
  };

  const addDialogue = () => {
    const newScenes = [...scenes];
    newScenes[currentScene].dialogues.push({ character: 'NHÂN VẬT', text: 'Lời thoại...', audioData: null });
    setScenes(newScenes);
  };

  const updateDialogue = (index, field, value) => {
    const newScenes = [...scenes];
    newScenes[currentScene].dialogues[index][field] = value;
    setScenes(newScenes);
  };

  const deleteDialogue = (index) => {
    const newScenes = [...scenes];
    newScenes[currentScene].dialogues.splice(index, 1);
    setScenes(newScenes);
  };

  const startRecording = async (dialogueIndex) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const newScenes = [...scenes];
          newScenes[currentScene].dialogues[dialogueIndex].audioData = reader.result;
          setScenes(newScenes);
        };
        reader.readAsDataURL(blob);
        
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingFor(dialogueIndex);
    } catch (error) {
      alert('Không thể truy cập microphone.');
      console.error('Error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingFor(null);
    }
  };

  const handleAudioUpload = (dialogueIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newScenes = [...scenes];
        newScenes[currentScene].dialogues[dialogueIndex].audioData = reader.result;
        setScenes(newScenes);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAudio = (dialogueIndex) => {
    const dialogue = scenes[currentScene].dialogues[dialogueIndex];
    if (!dialogue.audioData) return;
    
    if (playingAudio === dialogueIndex) {
      if (currentAudio) {
        currentAudio.pause();
        setPlayingAudio(null);
      }
    } else {
      if (currentAudio) currentAudio.pause();
      const audio = new Audio(dialogue.audioData);
      audio.onended = () => {
        setPlayingAudio(null);
        setCurrentAudio(null);
      };
      audio.play();
      setCurrentAudio(audio);
      setPlayingAudio(dialogueIndex);
    }
  };

  const deleteAudio = (dialogueIndex) => {
    const newScenes = [...scenes];
    newScenes[currentScene].dialogues[dialogueIndex].audioData = null;
    setScenes(newScenes);
    if (playingAudio === dialogueIndex && currentAudio) {
      currentAudio.pause();
      setPlayingAudio(null);
      setCurrentAudio(null);
    }
  };

  const exportScript = () => {
    let script = `${scriptTitle.toUpperCase()}\nTác giả: ${author}\n\n${'='.repeat(60)}\n\n`;
    scenes.forEach(scene => {
      script += `CẢNH ${scene.number}\n\n${scene.heading}\n\n${scene.description}\n\n`;
      if (scene.characters.length > 0) script += `Nhân vật: ${scene.characters.join(', ')}\n\n`;
      scene.dialogues.forEach(dialogue => {
        script += `${dialogue.character}\n${dialogue.text}\n`;
        if (dialogue.audioData) script += `[Có file ghi âm]\n`;
        script += `\n`;
      });
      script += `\n${'-'.repeat(60)}\n\n`;
    });
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptTitle}.txt`;
    a.click();
  };

  const createNewScript = () => {
    if (confirm('Tạo kịch bản mới? (Nhớ lưu trước!)')) {
      setScriptId(Date.now().toString());
      setScriptTitle('Kịch Bản Mới');
      setAuthor('Tác giả');
      setScenes([{
        id: 1, number: 1, heading: 'INT/EXT. ĐỊA ĐIỂM - THỜI GIAN',
        description: 'Mô tả cảnh quay...', characters: [], dialogues: []
      }]);
      setCurrentScene(0);
    }
  };

  useEffect(() => {
    return () => {
      if (currentAudio) currentAudio.pause();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentAudio]);

  const scene = scenes[currentScene];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="bg-black bg-opacity-50 backdrop-blur-md border-b border-purple-500 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-purple-400" />
            <div>
              <input type="text" value={scriptTitle} onChange={(e) => setScriptTitle(e.target.value)}
                className="bg-transparent text-xl font-bold border-none outline-none focus:text-purple-300 transition"
                placeholder="Tên kịch bản" />
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                className="bg-transparent text-sm text-gray-400 border-none outline-none block"
                placeholder="Tác giả" />
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs bg-yellow-600 px-2 py-1 rounded">LocalStorage</span>
            {saveStatus && <span className="text-sm text-green-400">{saveStatus}</span>}
            <button onClick={createNewScript} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition text-sm">
              <Plus className="w-4 h-4" />Mới
            </button>
            <button onClick={saveToStorage} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg flex items-center gap-2 transition text-sm">
              <Save className="w-4 h-4" />Lưu
            </button>
            <button onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition text-sm">
              {viewMode === 'edit' ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
            <button onClick={exportScript} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition text-sm">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1 bg-black bg-opacity-30 rounded-xl p-4 backdrop-blur-sm border border-purple-500 border-opacity-30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Đã Lưu</h3>
              <button onClick={loadSavedScripts} className="p-1 hover:bg-purple-600 rounded transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedScripts.map((s) => (
                <div key={s.id} className={`p-2 rounded-lg transition text-xs ${scriptId === s.id ? 'bg-yellow-600 bg-opacity-50' : 'bg-gray-800 bg-opacity-50 hover:bg-opacity-70'}`}>
                  <div onClick={() => loadScript(s.id)} className="cursor-pointer">
                    <p className="font-bold truncate">{s.title}</p>
                    <p className="text-gray-400">{s.author}</p>
                  </div>
                  <button onClick={() => deleteScript(s.id)} className="mt-1 p-1 hover:bg-red-600 rounded transition w-full text-xs">Xóa</button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 bg-black bg-opacity-30 rounded-xl p-4 backdrop-blur-sm border border-purple-500 border-opacity-30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />Cảnh
              </h3>
              <button onClick={addScene} className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scenes.map((s, index) => (
                <div key={s.id} onClick={() => setCurrentScene(index)}
                  className={`p-2 rounded-lg cursor-pointer transition ${currentScene === index ? 'bg-purple-600 bg-opacity-50' : 'bg-gray-800 bg-opacity-50 hover:bg-opacity-70'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">Cảnh {s.number}</span>
                    {scenes.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); deleteScene(index); }} className="p-1 hover:bg-red-600 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 truncate">{s.heading}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {viewMode === 'edit' ? (
              <div className="bg-black bg-opacity-30 rounded-xl p-4 backdrop-blur-sm border border-purple-500 border-opacity-30">
                <h2 className="text-xl font-bold mb-4 text-purple-300">Cảnh {scene.number}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-purple-300">Tiêu đề</label>
                    <input type="text" value={scene.heading} onChange={(e) => updateScene('heading', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-purple-500 border-opacity-30 focus:border-purple-500 outline-none"
                      placeholder="INT/EXT. ĐỊA ĐIỂM - THỜI GIAN" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-purple-300">Mô tả</label>
                    <textarea value={scene.description} onChange={(e) => updateScene('description', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-purple-500 border-opacity-30 focus:border-purple-500 outline-none resize-none"
                      rows="2" placeholder="Mô tả cảnh..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-purple-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />Nhân vật
                    </label>
                    <input type="text" value={scene.characters.join(', ')}
                      onChange={(e) => updateScene('characters', e.target.value.split(',').map(c => c.trim()))}
                      className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-purple-500 border-opacity-30 focus:border-purple-500 outline-none"
                      placeholder="NHÂN VẬT 1, NHÂN VẬT 2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-purple-300">Hội thoại</label>
                      <button onClick={addDialogue} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" />Thêm
                      </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {scene.dialogues.map((dialogue, index) => (
                        <div key={index} className="bg-gray-800 bg-opacity-30 p-3 rounded-lg border border-gray-700">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <input type="text" value={dialogue.character} onChange={(e) => updateDialogue(index, 'character', e.target.value)}
                                className="w-full px-3 py-1 bg-gray-900 rounded mb-2 border border-gray-600 focus:border-purple-500 outline-none text-sm font-semibold"
                                placeholder="TÊN NHÂN VẬT" />
                              <textarea value={dialogue.text} onChange={(e) => updateDialogue(index, 'text', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 rounded border border-gray-600 focus:border-purple-500 outline-none resize-none"
                                rows="2" placeholder="Lời thoại..." />
                              <div className="mt-2 flex gap-2 flex-wrap">
                                {!dialogue.audioData && (
                                  <button onClick={() => isRecording && recordingFor === index ? stopRecording() : startRecording(index)}
                                    className={`px-3 py-1 rounded flex items-center gap-2 text-sm ${isRecording && recordingFor === index ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {isRecording && recordingFor === index ? <><Square className="w-4 h-4" />Dừng</> : <><Mic className="w-4 h-4" />Ghi</>}
                                  </button>
                                )}
                                {!dialogue.audioData && (
                                  <label className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center gap-2 text-sm cursor-pointer">
                                    <Upload className="w-4 h-4" />Tải
                                    <input type="file" accept="audio/*" onChange={(e) => handleAudioUpload(index, e)} className="hidden" />
                                  </label>
                                )}
                                {dialogue.audioData && (
                                  <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded">
                                    <button onClick={() => toggleAudio(index)} className="p-1 hover:bg-purple-600 rounded">
                                      {playingAudio === index ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                    <Volume2 className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-green-400">Audio</span>
                                    <button onClick={() => deleteAudio(index)} className="p-1 hover:bg-red-600 rounded ml-2">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button onClick={() => deleteDialogue(index)} className="p-2 hover:bg-red-600 rounded h-fit">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white text-black rounded-xl p-8 font-mono">
                <h1 className="text-3xl font-bold text-center mb-2">{scriptTitle.toUpperCase()}</h1>
                <p className="text-center text-gray-600 mb-8">Tác giả: {author}</p>
                {scenes.map((s) => (
                  <div key={s.id} className="mb-8">
                    <div className="mb-4">
                      <p className="font-bold text-sm">CẢNH {s.number}</p>
                      <p className="font-bold">{s.heading}</p>
                    </div>
                    <p className="mb-4 italic">{s.description}</p>
                    {s.characters.length > 0 && <p className="mb-4 text-sm text-gray-600">Nhân vật: {s.characters.join(', ')}</p>}
                    <div className="space-y-3">
                      {s.dialogues.map((dialogue, i) => (
                        <div key={i} className="ml-8">
                          <p className="font-bold text-center mb-1">{dialogue.character}</p>
                          <p className="ml-8 mr-8">{dialogue.text}</p>
                          {dialogue.audioData && <p className="text-xs text-green-600 text-center mt-1">🎵 [Có ghi âm]</p>}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-300 mt-6"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
