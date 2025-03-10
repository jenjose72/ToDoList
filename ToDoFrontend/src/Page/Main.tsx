import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, Check, X, Moon, Sun } from 'lucide-react';

const TodoApp = () => {
  interface Task {
    id: number;
    text: string;
    completed: boolean;
  }
  
  const [tasks, setTasks] = useState(() => {
    const storedTasks = localStorage.getItem("todoTasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('todoDarkMode') === 'true');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [headerPosition, setHeaderPosition] = useState('center');
  
  const appContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('todoTasks');
      console.log("Loading from localStorage:", savedTasks);
      
      if (savedTasks) {
        const loadedTasks = JSON.parse(savedTasks) as Task[];
        if (Array.isArray(loadedTasks)) {
          console.log("Setting initial tasks:", loadedTasks);
          setTasks(loadedTasks);
          setHeaderPosition(loadedTasks.length > 0 ? 'top' : 'center');
        } else {
          console.error("Loaded tasks is not an array:", loadedTasks);
        }
      }

      const savedTheme = localStorage.getItem('todoDarkMode');
      if (savedTheme !== null) {
        setDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  
  useEffect(() => {
    try {
      console.log("Saving to localStorage:", tasks);
      localStorage.setItem('todoTasks', JSON.stringify(tasks));
      setHeaderPosition(tasks.length > 0 ? 'top' : 'center');
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('todoDarkMode', JSON.stringify(darkMode));
      document.body.className = darkMode ? 'dark' : '';
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }
  }, [darkMode]);

  const addTask = () => {
    if (newTaskText.trim() !== '') {
      const newTask: Task = {
        id: Date.now(),
        text: newTaskText.trim(),
        completed: false
      };
      setTasks((prevTasks: Task[]) => [...prevTasks, newTask]);
      setNewTaskText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const deleteTask = (id: number) => {
    setTasks((prevTasks: Task[]) => prevTasks.filter(task => task.id !== id));
  };

  const toggleComplete = (id: number) => {
    setTasks((prevTasks: Task[]) => prevTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = () => {
    if (editingText.trim() !== '' && editingTaskId !== null) {
      setTasks((prevTasks: Task[]) => prevTasks.map(task => 
        task.id === editingTaskId ? { ...task, text: editingText } : task
      ));
    }
    setEditingTaskId(null);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, targetTaskId: number) => {
    e.preventDefault();
    if (draggedTask && draggedTask.id !== targetTaskId) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetTaskId: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedTask && draggedTask.id !== targetTaskId) {
      const updatedTasks = [...tasks];
      const draggedIndex = updatedTasks.findIndex(task => task.id === draggedTask.id);
      const targetIndex = updatedTasks.findIndex(task => task.id === targetTaskId);
      
      const [removed] = updatedTasks.splice(draggedIndex, 1);
      updatedTasks.splice(targetIndex, 0, removed);
      
      setTasks(updatedTasks);
    }
    setDraggedTask(null);
  };

  const getHeaderContainerStyle = () => {
    return {
      transition: 'all 1.5s cubic-bezier(0.34, 1.10, 0.64, 1)',
      height: headerPosition === 'center' ? '100vh' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: headerPosition === 'center' ? 'center' : 'flex-start',
      alignItems: 'center'
    } as React.CSSProperties;
  };

  const getHeaderStyle = () => {
    return {
      transform: headerPosition === 'center' ? 'scale(1.3)' : 'scale(1)',
      marginBottom: headerPosition === 'center' ? '1.5rem' : '0',
      textAlign: headerPosition === 'center' ? 'center' : 'left',
      width: '100%',
      transition: 'all 1.8s cubic-bezier(0.22, 1, 0.36, 1)'
    } as React.CSSProperties;
  };

  return (
    <div 
      ref={appContainerRef}
      className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}
    >
      <div 
        className="max-w-lg mx-auto"
        style={getHeaderContainerStyle()}
      >
        <div className="w-full flex justify-between items-center mb-6">
          <h1 
            className="text-6xl font-bold"
            style={getHeaderStyle()}
          >
            To-Do List
          </h1>
          {headerPosition === 'top' && (
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
              style={{
                opacity: headerPosition === 'top' ? 1 : 0,
                transition: 'opacity 1.5s ease-in-out'
              }}
            >
              {darkMode ? <Sun size={30} /> : <Moon size={30} />}
            </button>
          )}
        </div>

        {headerPosition === 'center' && (
          <div 
            className="flex justify-center mb-6"
            style={{
              opacity: headerPosition === 'center' ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out'
            }}
          >
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            >
              {darkMode ? <Sun size={30} /> : <Moon size={30} />}
            </button>
          </div>
        )}

        <div 
          className="w-full flex mb-6" 
          style={{
            transition: 'all 1.5s cubic-bezier(0.34, 1.10, 0.64, 1)',
            transform: headerPosition === 'center' ? 'translateY(0)' : 'translateY(0)'
          }}
        >
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className={`flex-grow p-3 text-2xl rounded-l-lg focus:outline-none ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            } border`}
          />
          <button
            onClick={addTask}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg"
          >
            Add
          </button>
        </div>

        <ul 
          className="w-full space-y-3" 
          style={{
            transition: 'all 1.5s cubic-bezier(0.34, 1.10, 0.64, 1)',
            opacity: tasks.length > 0 ? 1 : 0
          }}
        >
          {tasks.map((task: Task, index: number) => (
            <li
              key={task.id}
              draggable={editingTaskId !== task.id}
              onDragStart={() => handleDragStart(task)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, task.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, task.id)}
              className={`text-xl ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              } p-4 rounded-lg shadow ${
                task.completed ? 'border-l-4 border-green-500' : ''
              } cursor-grab active:cursor-grabbing`}
              style={{
                opacity: 0,
                animation: 'fadeInUp 0.8s forwards',
                animationDelay: `${index * 0.1 + 0.2}s`
              }}
            >
              {editingTaskId === task.id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className={`flex-grow p-2 mr-2 rounded focus:outline-none ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                    }`}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        saveEdit();
                      }
                    }}
                  />
                  <button
                    onClick={saveEdit}
                    className="p-1 mx-1 text-green-500 hover:text-green-600"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 mx-1 text-red-500 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="w-5 h-5 mr-3 cursor-pointer"
                  />
                  <span 
                    className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`} 
                    style={{ transition: 'all 0.5s ease' }}
                  >
                    {task.text}
                  </span>
                  <div className="flex">
                    <button
                      onClick={() => startEditing(task)}
                      className={`p-1 mx-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
                      disabled={task.completed}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className={`p-1 mx-1 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {tasks.length === 0 && headerPosition === 'top' && (
            <div 
              className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              style={{ opacity: 0, animation: 'fadeIn 1.5s forwards' }}
            >
              No tasks yet. Add a task to get started!
            </div>
          )}
        </ul>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .drag-over {
          border: 2px dashed #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export default TodoApp;