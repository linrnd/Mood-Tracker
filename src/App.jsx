import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null); // Currently selected mood to add
  const [dayMoods, setDayMoods] = useState(() => {
  const savedMoods = localStorage.getItem('moodData');
  return savedMoods ? JSON.parse(savedMoods) : {};
}); // Store moods for each day {day: [moods]}

  // Notes feature
  const [dayNotes, setDayNotes] = useState(() => {
    const savedNotes = localStorage.getItem('noteData');
    return savedNotes ? JSON.parse(savedNotes) : {};
  });
  const [noteMode, setNoteMode] = useState(false); // Is note mode active?
  const [editingDay, setEditingDay] = useState(null); // Which day's note is being edited?
  const [noteText, setNoteText] = useState(''); // Current note text being edited
  const [showAnalyse, setShowAnalyse] = useState(false); // Show analyse popup
  const [popupPosition, setPopupPosition] = useState({ x: null, y: null }); // Popup position
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // Auto-save to localStorage whenever dayMoods changes
useEffect(() => {
  localStorage.setItem('moodData', JSON.stringify(dayMoods));
}, [dayMoods]);

  // Auto-save notes to localStorage
  useEffect(() => {
    localStorage.setItem('noteData', JSON.stringify(dayNotes));
  }, [dayNotes]);
  // Get month and year
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  // Get actual current date for comparison
  const actualToday = new Date();
  const isCurrentMonth = actualToday.getMonth() === currentDate.getMonth() &&
                         actualToday.getFullYear() === currentDate.getFullYear();
  const isPastMonth = currentDate < new Date(actualToday.getFullYear(), actualToday.getMonth(), 1);

  // For calendar highlighting (current day in displayed month)
  const today = isCurrentMonth ? actualToday.getDate() : null;

  // For graph: how many days to show
  const graphLastDay = isPastMonth ? 31 : (isCurrentMonth ? actualToday.getDate() : 0);
  
  // Get days in month
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  
  // Create array of day numbers
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // Empty cells before first day
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Mood scores: +1 = positive, 0 = neutral, -1 = negative
  const moodScores = {
    'Happy': 1,
    'Relax': 1,
    'Peace': 1,
    'Brave': 1,
    'Tired': 0,
    'Period': 0,
    'Diarrhea': 0,
    'Procrastination': -1,
    'Uncomfortable': -1,
    'Stress': -1,
    'Anxiety/Panic': -1,
    'Sad': -1,
    'Angry': -1,
    'Guilty': -1,
    'Shame': -1
  };

  // Mood options with emojis
  const moodOptions = [
    { name: 'Happy', emoji: '❤️', category: 'emotion' },
    { name: 'Relax', emoji: '☕', category: 'emotion' },
    { name: 'Peace', emoji: '🕊️', category: 'emotion' },
    { name: 'Brave', emoji: '💪', category: 'emotion' },
    { name: 'Tired', emoji: '😴', category: 'emotion' },
    { name: 'Procrastination', emoji: '📱', category: 'emotion' },
    { name: 'Uncomfortable', emoji: '🦟', category: 'emotion' },
    { name: 'Stress', emoji: '🍄', category: 'emotion' },
    { name: 'Anxiety/Panic', emoji: '⚡', category: 'emotion' },
    { name: 'Sad', emoji: '🌧️', category: 'emotion' },
    { name: 'Angry', emoji: '🔥', category: 'emotion' },
    { name: 'Guilty', emoji: '😰', category: 'emotion' },
    { name: 'Shame', emoji: '🕳️', category: 'emotion' },
    { name: 'Period', emoji: '🩸', category: 'physical' },
    { name: 'Diarrhea', emoji: '💩', category: 'physical' }
  ];

  // Calculate daily points for the current month
  const calculateDailyPoints = () => {
    const points = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const moods = dayMoods[day] || [];
      let dayScore = 0;
      moods.forEach(mood => {
        dayScore += moodScores[mood.name] || 0;
      });
      points.push({ day, score: dayScore, hasMoods: moods.length > 0 });
    }
    return points;
  };

  const dailyPoints = calculateDailyPoints();
  
  // Select a mood to add to calendar
  const selectMood = (mood) => {
    setSelectedMood(mood);
    setNoteMode(false); // Auto-disable note mode when selecting a mood
  };
  
  // Add selected mood to a day
  const addMoodToDay = (day) => {
    if (!day || !selectedMood) return; // Don't add to empty cells or if no mood selected

    setDayMoods(prev => {
      const currentMoods = prev[day] || [];

      // Check if mood already exists for this day
      if (currentMoods.some(m => m.name === selectedMood.name)) {
        // Remove the mood if it already exists (toggle off)
        return {
          ...prev,
          [day]: currentMoods.filter(m => m.name !== selectedMood.name)
        };
      } else {
        // Add the mood
        return {
          ...prev,
          [day]: [...currentMoods, selectedMood]
        };
      }
    });
  };

  // Delete a specific mood from a day by clicking the emoji
  const deleteMoodFromDay = (day, moodToDelete, event) => {
    event.stopPropagation(); // Prevent day click from triggering

    setDayMoods(prev => {
      const currentMoods = prev[day] || [];
      return {
        ...prev,
        [day]: currentMoods.filter(m => m.name !== moodToDelete.name)
      };
    });
  };
  // Navigate to previous month
const previousMonth = () => {
  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
};

// Navigate to next month
const nextMonth = () => {
  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
};

// Go to today
const goToToday = () => {
  setCurrentDate(new Date());
};

  // Toggle note mode
  const toggleNoteMode = () => {
    setNoteMode(!noteMode);
    setSelectedMood(null); // Deselect mood when entering note mode
  };

  // Open note editor for a day
  const openNoteEditor = (day) => {
    if (!day) return;
    setEditingDay(day);
    setNoteText(dayNotes[day] || ''); // Load existing note or empty
  };

  // Save note and close editor
  const saveNote = () => {
    if (editingDay) {
      setDayNotes(prev => ({
        ...prev,
        [editingDay]: noteText
      }));
    }
    setEditingDay(null);
    setNoteText('');
  };

  // Cancel note editing
  const cancelNote = () => {
    setEditingDay(null);
    setNoteText('');
  };

  // Handle day click - either add mood or open note editor
  const handleDayClick = (day) => {
    if (noteMode) {
      openNoteEditor(day);
    } else {
      addMoodToDay(day);
    }
  };

  // Drag handlers for analyse popup
  const handleDragStart = (e) => {
    if (e.target.closest('.analyse-close')) return; // Don't drag when clicking close
    setIsDragging(true);
    const popup = e.currentTarget.closest('.analyse-popup');
    const rect = popup.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setPopupPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Reset popup position when opening
  const openAnalyse = () => {
    setPopupPosition({ x: null, y: null });
    setShowAnalyse(true);
  };

  return (
    <div className="app-container">
      {/* Left side: Calendar and Mood */}
      <div className="left-section">
        {/* Calendar Area - 80% height */}
        <div className="calendar-area">
          <h1 className="calendar-title">Mood Tracker</h1>
          <div className="calendar-header">
  <div className="month-section">
    <button className="nav-button" onClick={previousMonth}>←</button>
    <div className="month-name">{month}</div>
    <button className="nav-button" onClick={nextMonth}>→</button>
    <button className="today-button" onClick={goToToday}>Today</button>
    <button className="analyse-button" onClick={openAnalyse}>📈</button>
  </div>
  <div className="year-name">{year}</div>
</div>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="day-label">{day}</div>
            ))}
            {days.map((day, index) => (
              <div
                key={index}
                className={`day-cell ${day === today ? 'current-day' : ''} ${selectedMood || noteMode ? 'clickable' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <span className="day-number">{day}</span>
                {day && dayMoods[day] && (
                  <div className="day-moods">
                    {dayMoods[day].map((mood, moodIndex) => (
                      <span
                        key={moodIndex}
                        className="day-mood-emoji"
                        title={`${mood.name} (click to delete)`}
                        onClick={(e) => deleteMoodFromDay(day, mood, e)}
                      >
                        {mood.emoji}
                      </span>
                    ))}
                  </div>
                )}
                {/* Show note text directly below moods */}
                {day && dayNotes[day] && (
                  <div className="day-note-text">{dayNotes[day]}</div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Mood Area - 20% height */}
        <div className="mood-area">
          <h2>Type Of Mood </h2>
          <p className="mood-instruction">
            {noteMode
              ? 'Click on a day to write a note 📝'
              : selectedMood
                ? `Click on a day to add "${selectedMood.name}" ${selectedMood.emoji}`
                : 'Select a mood, then click on calendar days to add it'}
          </p>
          <div className="mood-buttons">
            {moodOptions.map(mood => (
              <button
                key={mood.name}
                className={`mood-button ${selectedMood?.name === mood.name ? 'selected' : ''}`}
                onClick={() => selectMood(mood)}
                style={mood.color ? { 
                  backgroundColor: selectedMood?.name === mood.name ? mood.color : 'transparent',
                  borderColor: mood.color 
                } : {}}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-name">{mood.name}</span>
              </button>
            ))}
          </div>
          {/* Note section - separate from moods */}
          <div className="note-section">
            <button
              className={`mood-button ${noteMode ? 'selected' : ''}`}
              onClick={toggleNoteMode}
            >
              <span className="mood-emoji">📝</span>
              <span className="mood-name">Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Note Editor Popup */}
      {editingDay && (
        <div className="note-overlay" onClick={cancelNote}>
          <div className="note-editor" onClick={(e) => e.stopPropagation()}>
            <h3>Note for Day {editingDay}</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your note here..."
              autoFocus
            />
            <div className="note-buttons">
              <button onClick={saveNote} className="save-button">Save</button>
              <button onClick={cancelNote} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Analyse Popup */}
      {showAnalyse && (
        <div
          className={`analyse-overlay ${popupPosition.x !== null ? 'no-center' : ''}`}
          onClick={() => setShowAnalyse(false)}
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div
            className="analyse-popup"
            onClick={(e) => e.stopPropagation()}
            style={popupPosition.x !== null ? {
              position: 'fixed',
              left: popupPosition.x,
              top: popupPosition.y,
              margin: 0
            } : {}}
          >
            <div
              className="analyse-header"
              onMouseDown={handleDragStart}
            >
              <h3 className="graph-title">
                {month} {year}
                <span className="score-help">
                  i
                  <span className="score-tooltip">
                    <strong>Score Calculation:</strong><br/>
                    +1: Happy, Relax, Peace, Brave<br/>
                    0: Tired, Period, Diarrhea<br/>
                    -1: All other moods
                  </span>
                </span>
              </h3>
              <button className="analyse-close" onClick={() => setShowAnalyse(false)}>×</button>
            </div>
            <div className="analyse-content">
              <div className="graph-container">
                {/* Y-axis label */}
                <div className="axis-label y-axis-label">Score</div>
                {/* Y-axis labels */}
                <div className="y-axis">
                  {(() => {
                    const pastPoints = dailyPoints.filter(p => p.day <= graphLastDay);
                    const maxScore = Math.max(...pastPoints.map(p => p.score), 3);
                    const minScore = Math.min(...pastPoints.map(p => p.score), -3);
                    const labels = [];
                    for (let i = maxScore; i >= minScore; i--) {
                      labels.push(<div key={i} className="y-label">{i}</div>);
                    }
                    return labels;
                  })()}
                </div>
                {/* Graph area */}
                <div className="graph-area">
                  {/* Zero line */}
                  <div className="zero-line" style={{
                    top: `${(() => {
                      const pastPoints = dailyPoints.filter(p => p.day <= graphLastDay);
                      const maxScore = Math.max(...pastPoints.map(p => p.score), 3);
                      const minScore = Math.min(...pastPoints.map(p => p.score), -3);
                      const range = maxScore - minScore;
                      return (maxScore / range) * 100;
                    })()}%`
                  }}></div>
                  {/* SVG Line Graph */}
                  <svg className="graph-svg" viewBox={`0 0 ${daysInMonth * 20} 200`} preserveAspectRatio="none">
                    {(() => {
                      const pastPoints = dailyPoints.filter(p => p.day <= graphLastDay);
                      if (pastPoints.length < 2) return null;

                      const maxScore = Math.max(...pastPoints.map(p => p.score), 3);
                      const minScore = Math.min(...pastPoints.map(p => p.score), -3);
                      const range = maxScore - minScore;
                      const zeroY = (maxScore / range) * 200;

                      // Create coords with score info
                      const coords = pastPoints.map((p, i) => ({
                        x: (i * 20) + 10,
                        y: ((maxScore - p.score) / range) * 200,
                        score: p.score
                      }));

                      // Build the full path as one continuous curve
                      let fullPath = `M ${coords[0].x},${coords[0].y}`;
                      for (let i = 1; i < coords.length; i++) {
                        const prev = coords[i - 1];
                        const curr = coords[i];
                        const cpx = (prev.x + curr.x) / 2;
                        fullPath += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
                      }

                      // Create clipping paths for positive (above zero) and negative (below zero)
                      const graphWidth = daysInMonth * 20;
                      const graphHeight = 200;

                      return (
                        <>
                          <defs>
                            <clipPath id="positiveClip">
                              <rect x="0" y="0" width={graphWidth} height={zeroY} />
                            </clipPath>
                            <clipPath id="negativeClip">
                              <rect x="0" y={zeroY} width={graphWidth} height={graphHeight - zeroY} />
                            </clipPath>
                          </defs>
                          {/* Pink part (positive/zero area) */}
                          <path
                            className="graph-line"
                            d={fullPath}
                            fill="none"
                            stroke="#f6abca"
                            strokeWidth="1"
                            clipPath="url(#positiveClip)"
                          />
                          {/* Blue part (negative area) */}
                          <path
                            className="graph-line"
                            d={fullPath}
                            fill="none"
                            stroke="#9ed3fb"
                            strokeWidth="1"
                            clipPath="url(#negativeClip)"
                          />
                        </>
                      );
                    })()}
                    {/* Data points - only for past days */}
                    {dailyPoints.filter(p => p.day <= graphLastDay).map((p, i) => {
                      const pastPoints = dailyPoints.filter(pt => pt.day <= graphLastDay);
                      const maxScore = Math.max(...pastPoints.map(pt => pt.score), 3);
                      const minScore = Math.min(...pastPoints.map(pt => pt.score), -3);
                      const range = maxScore - minScore;
                      const x = (i * 20) + 10;
                      const y = ((maxScore - p.score) / range) * 200;
                      // Blue for negative, pink for positive/zero
                      const pointColor = p.hasMoods
                        ? (p.score < 0 ? "#9ed3fb" : "#f6abca")
                        : "#ddd";
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={p.hasMoods ? 2 : 1}
                          fill={pointColor}
                          className="graph-point"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
              {/* X-axis labels - all days but future ones are lighter */}
              <div className="x-axis">
                {dailyPoints.map((p, i) => (
                  <div key={i} className={`x-label ${p.day > graphLastDay ? 'future' : ''}`}>{p.day}</div>
                ))}
              </div>
              {/* X-axis label */}
              <div className="axis-label x-axis-label">Day</div>
            </div>
          </div>
        </div>
      )}

      {/* Right side: Cat Picture */}
      <div className="cat-area">
        <img 
          src="https://cataas.com/cat" 
          alt="Random cat" 
          className="cat-image"
        />
      </div>
    </div>
  );
}

export default App;