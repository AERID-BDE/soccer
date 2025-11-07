import React, { useState, useEffect } from 'react';
import { Users, Trophy, Calendar, Plus, Shuffle, Save, Upload, Edit2, Trash2, Menu, X, LogOut } from 'lucide-react';

const FootballTournament = ({ user, onSignOut }) => {
  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
      setIsSmallMobile(window.innerWidth <= 480);
      // Close mobile menu when resizing to desktop
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [view, setView] = useState('setup'); // setup, teams, matches, leaderboard
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [eventWinnerAwarded, setEventWinnerAwarded] = useState({});
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [newMatchTeam1, setNewMatchTeam1] = useState('');
  const [newMatchTeam2, setNewMatchTeam2] = useState('');
  const [showWinners, setShowWinners] = useState(false);

  // Aerid theme colors
  const theme = {
    navy900: '#0C1E2A',
    navy800: '#0F2533',
    navy700: '#123043',
    navy600: '#163B52',
    navy500: '#1C4861',
    navy300: '#3E7994',
    gold500: '#D9A441',
    gold600: '#D19A34',
    gold700: '#B8872E',
    gold400: '#E0B55B',
    gold300: '#E7C772',
    gold200: '#F0D790',
    textPrimary: '#F5EADD',
    textSecondary: '#EDE3CC',
    textMuted: '#5A6A7B',
    success: '#3AC17E',
    danger: '#F05B5B'
  };

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load data from JSON file or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from data.json first
        const response = await fetch('/data.json');
        if (response.ok) {
          const data = await response.json();
          if (data.players) setPlayers(data.players);
          if (data.events) setEvents(data.events);
          if (data.matches) setMatches(data.matches);
          if (data.eventWinnerAwarded) setEventWinnerAwarded(data.eventWinnerAwarded);
          
          // Also save to localStorage
          localStorage.setItem('players', JSON.stringify(data.players || []));
          localStorage.setItem('events', JSON.stringify(data.events || []));
          localStorage.setItem('matches', JSON.stringify(data.matches || []));
          localStorage.setItem('eventWinnerAwarded', JSON.stringify(data.eventWinnerAwarded || {}));
          setIsInitialLoad(false);
          return;
        }
      } catch (error) {
        console.log('data.json not found, loading from localStorage');
      }
      
      // Fallback to localStorage
      const savedPlayers = localStorage.getItem('players');
      const savedEvents = localStorage.getItem('events');
      const savedMatches = localStorage.getItem('matches');
      const savedEventWinners = localStorage.getItem('eventWinnerAwarded');
      
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedMatches) setMatches(JSON.parse(savedMatches));
      if (savedEventWinners) setEventWinnerAwarded(JSON.parse(savedEventWinners));
      setIsInitialLoad(false);
    };
    
    loadData();
  }, []);

  // Save data to localStorage and update data.json
  const saveData = async () => {
    // Don't save on initial load
    if (isInitialLoad) return;
    
    // Save to localStorage
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('matches', JSON.stringify(matches));
    localStorage.setItem('eventWinnerAwarded', JSON.stringify(eventWinnerAwarded));
    
    // Save to data.json via API
    const data = {
      players,
      events,
      matches,
      eventWinnerAwarded,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      // Try to save via API endpoint (works in dev mode with Vite plugin)
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log('Data saved to data.json successfully');
      } else {
        console.warn('Failed to save to data.json via API, data is in localStorage');
      }
    } catch (error) {
      // API not available (production build), data is still in localStorage
      console.log('API not available, data saved to localStorage only');
    }
  };

  useEffect(() => {
    saveData();
  }, [players, events, matches, eventWinnerAwarded]);

  // Export all data to JSON file (saves to data.json)
  const exportToJSON = () => {
    const data = {
      players,
      events,
      matches,
      eventWinnerAwarded,
      lastUpdated: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json'; // Save as data.json
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Also update localStorage
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('matches', JSON.stringify(matches));
    localStorage.setItem('eventWinnerAwarded', JSON.stringify(eventWinnerAwarded));
  };

  // Import data from JSON file (loads from data.json)
  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.players) setPlayers(data.players);
          if (data.events) setEvents(data.events);
          if (data.matches) setMatches(data.matches);
          if (data.eventWinnerAwarded) setEventWinnerAwarded(data.eventWinnerAwarded);
          
          // Also update localStorage
          localStorage.setItem('players', JSON.stringify(data.players || []));
          localStorage.setItem('events', JSON.stringify(data.events || []));
          localStorage.setItem('matches', JSON.stringify(data.matches || []));
          localStorage.setItem('eventWinnerAwarded', JSON.stringify(data.eventWinnerAwarded || {}));
          
          alert('Données importées avec succès depuis data.json !');
        } catch (error) {
          console.error('Erreur lors de l\'importation:', error);
          alert('Erreur lors de l\'importation du fichier JSON');
        }
      };
      reader.readAsText(file);
    }
    // Reset input to allow re-uploading the same file
    event.target.value = '';
  };

  // Add new player
  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, { 
        id: Date.now(), 
        name: newPlayerName.trim(),
        totalPoints: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        dayWins: 0
      }]);
      setNewPlayerName('');
    }
  };

  // Delete player
  const deletePlayer = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  // Start editing player
  const startEditingPlayer = (player) => {
    setEditingPlayerId(player.id);
    setEditingPlayerName(player.name);
  };

  // Save edited player
  const saveEditedPlayer = () => {
    if (editingPlayerName.trim()) {
      setPlayers(players.map(p => 
        p.id === editingPlayerId ? { ...p, name: editingPlayerName.trim() } : p
      ));
      setEditingPlayerId(null);
      setEditingPlayerName('');
    }
  };

  // Cancel editing player
  const cancelEditingPlayer = () => {
    setEditingPlayerId(null);
    setEditingPlayerName('');
  };

  // Create new event
  const createEvent = () => {
    if (newEventDate) {
      const event = {
        id: Date.now(),
        date: newEventDate,
        teams: [],
        winnerTeamId: null
      };
      setEvents([...events, event]);
      setCurrentEvent(event.id);
      setNewEventDate('');
      setTeams([]);
      setView('setup');
    }
  };

  // Delete event and remove its stats from leaderboard
  const deleteEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return;
    }

    // Remove points from players for this event's matches
    const eventMatches = matches.filter(m => m.eventId === eventId && m.validated);
    const updatedPlayers = [...players];

    eventMatches.forEach(match => {
      const result = match.score1 > match.score2 ? 'team1' : 
                     match.score2 > match.score1 ? 'team2' : 'draw';

      // Remove points from team1 players
      match.team1.players.forEach(player => {
        const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
        if (playerIndex !== -1) {
          if (result === 'team1') {
            updatedPlayers[playerIndex].totalPoints -= 3;
            updatedPlayers[playerIndex].wins -= 1;
          } else if (result === 'draw') {
            updatedPlayers[playerIndex].totalPoints -= 2;
            updatedPlayers[playerIndex].draws -= 1;
          } else {
            updatedPlayers[playerIndex].totalPoints -= 1;
            updatedPlayers[playerIndex].losses -= 1;
          }
        }
      });

      // Remove points from team2 players
      match.team2.players.forEach(player => {
        const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
        if (playerIndex !== -1) {
          if (result === 'team2') {
            updatedPlayers[playerIndex].totalPoints -= 3;
            updatedPlayers[playerIndex].wins -= 1;
          } else if (result === 'draw') {
            updatedPlayers[playerIndex].totalPoints -= 2;
            updatedPlayers[playerIndex].draws -= 1;
          } else {
            updatedPlayers[playerIndex].totalPoints -= 1;
            updatedPlayers[playerIndex].losses -= 1;
          }
        }
      });
    });

    // Remove winner bonus if event had a winner
    if (eventWinnerAwarded[eventId]) {
      const winnerTeam = event.teams?.find(t => t.id === eventWinnerAwarded[eventId]);
      if (winnerTeam) {
        winnerTeam.players.forEach(player => {
          const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
          if (playerIndex !== -1) {
            updatedPlayers[playerIndex].totalPoints -= 2;
            updatedPlayers[playerIndex].dayWins -= 1;
          }
        });
      }
    }

    // Remove event winner from eventWinnerAwarded
    const newEventWinnerAwarded = { ...eventWinnerAwarded };
    delete newEventWinnerAwarded[eventId];

    // Remove event matches
    const updatedMatches = matches.filter(m => m.eventId !== eventId);

    // Remove event
    const updatedEvents = events.filter(e => e.id !== eventId);

    // Update states
    setPlayers(updatedPlayers);
    setMatches(updatedMatches);
    setEvents(updatedEvents);
    setEventWinnerAwarded(newEventWinnerAwarded);

    // Clear current event if it was deleted
    if (currentEvent === eventId) {
      setCurrentEvent(null);
      setTeams([]);
      setView('setup');
    }
  };

  // Randomize teams
  const randomizeTeams = () => {
    if (!currentEvent) {
      alert('Veuillez d\'abord créer un événement');
      return;
    }

    // Check if event has a winner
    if (eventWinnerAwarded[currentEvent]) {
      alert('Impossible de régénérer les équipes : un vainqueur a déjà été attribué à cet événement.');
      return;
    }

    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const playersPerTeam = Math.floor(shuffled.length / numTeams);
    const newTeams = [];
    
    for (let i = 0; i < numTeams; i++) {
      const start = i * playersPerTeam;
      let end = start + playersPerTeam;
      
      // Add remaining players to last team
      if (i === numTeams - 1) {
        end = shuffled.length;
      }
      
      newTeams.push({
        id: Date.now() + i,
        name: `Équipe ${i + 1}`,
        players: shuffled.slice(start, end),
        color: getTeamColor(i),
        eventId: currentEvent
      });
    }
    
    setTeams(newTeams);
    
    // Update event with teams
    const updatedEvents = events.map(event => {
      if (event.id === currentEvent) {
        return { ...event, teams: newTeams };
      }
      return event;
    });
    setEvents(updatedEvents);
    
    setView('teams');
  };

  const getTeamColor = (index) => {
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  // Drag and drop handlers
  const handleDragStart = (player, teamId) => {
    setDraggedPlayer({ player, sourceTeamId: teamId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetTeamId) => {
    if (!draggedPlayer) return;

    // Check if event has a winner
    if (eventWinnerAwarded[currentEvent]) {
      alert('Impossible de modifier les équipes : un vainqueur a déjà été attribué à cet événement.');
      return;
    }

    const newTeams = teams.map(team => {
      if (team.id === draggedPlayer.sourceTeamId) {
        return {
          ...team,
          players: team.players.filter(p => p.id !== draggedPlayer.player.id)
        };
      }
      if (team.id === targetTeamId) {
        return {
          ...team,
          players: [...team.players, draggedPlayer.player]
        };
      }
      return team;
    });
    
    setTeams(newTeams);
    
    // Update event with new teams
    const updatedEvents = events.map(event => {
      if (event.id === currentEvent) {
        return { ...event, teams: newTeams };
      }
      return event;
    });
    setEvents(updatedEvents);
    
    setDraggedPlayer(null);
  };

  // Create matches between teams
  const generateMatches = () => {
    // Check if event has a winner
    if (eventWinnerAwarded[currentEvent]) {
      alert('Impossible de générer les matchs : un vainqueur a déjà été attribué à cet événement.');
      return;
    }

    const newMatches = [];
    const baseTime = Date.now();
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        newMatches.push({
          id: baseTime + i * 1000 + j + Math.random(), // Unique ID using timestamp + indices + random
          eventId: currentEvent,
          team1: teams[i],
          team2: teams[j],
          score1: null,
          score2: null,
          validated: false,
          date: new Date().toISOString()
        });
      }
    }
    setMatches([...matches, ...newMatches]);
    setView('matches');
  };

  // Add a new match manually
  const addMatch = () => {
    // Check if event has a winner
    if (eventWinnerAwarded[currentEvent]) {
      alert('Impossible d\'ajouter un match : un vainqueur a déjà été attribué à cet événement.');
      return;
    }

    if (!newMatchTeam1 || !newMatchTeam2) {
      alert('Veuillez sélectionner deux équipes différentes');
      return;
    }

    if (newMatchTeam1 === newMatchTeam2) {
      alert('Veuillez sélectionner deux équipes différentes');
      return;
    }

    const team1 = teams.find(t => t.id === parseInt(newMatchTeam1));
    const team2 = teams.find(t => t.id === parseInt(newMatchTeam2));

    if (!team1 || !team2) {
      alert('Erreur : équipe introuvable');
      return;
    }

    // Create match with unique ID (allow duplicate matches)
    const newMatch = {
      id: Date.now() + Math.random(), // Unique ID using timestamp + random
      eventId: currentEvent,
      team1: team1,
      team2: team2,
      score1: null,
      score2: null,
      validated: false,
      date: new Date().toISOString()
    };

    setMatches([...matches, newMatch]);
    setNewMatchTeam1('');
    setNewMatchTeam2('');
    setShowAddMatchForm(false);
  };

  // Record match score and validate
  const updateMatchScore = (matchId, team, score) => {
    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        if (team === 1) {
          return { ...match, score1: score };
        } else {
          return { ...match, score2: score };
        }
      }
      return match;
    });
    setMatches(updatedMatches);
  };

  // Validate match result
  const validateMatchResult = (matchId) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match.score1 === null || match.score2 === null) {
      alert('Veuillez renseigner les deux scores avant de valider');
      return;
    }

    if (match.score1 < 0 || match.score2 < 0) {
      alert('Les scores ne peuvent pas être négatifs');
      return;
    }

    const previousValidated = match.validated;

    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, validated: true };
      }
      return m;
    });
    setMatches(updatedMatches);

    // Update player points
    const updatedMatch = updatedMatches.find(m => m.id === matchId);
    if (updatedMatch) {
      updatePlayerPointsFromScore(updatedMatch, previousValidated);
      
      // Check if all matches are done and award winner
      // Use updatedMatches instead of matches state to ensure we have the latest data
      checkAndAwardEventWinner(updatedMatch.eventId, updatedMatches);
    }
  };

  // Unvalidate match for correction
  const unvalidateMatch = (matchId) => {
    if (!confirm('Voulez-vous corriger ce match ? Les points seront recalculés.')) {
      return;
    }

    const match = matches.find(m => m.id === matchId);
    if (!match || !match.validated) return;

    // Remove points from this match
    const updatedPlayers = [...players];
    const result = match.score1 > match.score2 ? 'team1' : 
                   match.score2 > match.score1 ? 'team2' : 'draw';

    match.team1.players.forEach(player => {
      const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
      if (playerIndex !== -1) {
        if (result === 'team1') {
          updatedPlayers[playerIndex].totalPoints -= 3;
          updatedPlayers[playerIndex].wins -= 1;
        } else if (result === 'draw') {
          updatedPlayers[playerIndex].totalPoints -= 2;
          updatedPlayers[playerIndex].draws -= 1;
        } else {
          updatedPlayers[playerIndex].totalPoints -= 1;
          updatedPlayers[playerIndex].losses -= 1;
        }
      }
    });

    match.team2.players.forEach(player => {
      const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
      if (playerIndex !== -1) {
        if (result === 'team2') {
          updatedPlayers[playerIndex].totalPoints -= 3;
          updatedPlayers[playerIndex].wins -= 1;
        } else if (result === 'draw') {
          updatedPlayers[playerIndex].totalPoints -= 2;
          updatedPlayers[playerIndex].draws -= 1;
        } else {
          updatedPlayers[playerIndex].totalPoints -= 1;
          updatedPlayers[playerIndex].losses -= 1;
        }
      }
    });

    setPlayers(updatedPlayers);

    // Unvalidate the match
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, validated: false };
      }
      return m;
    });
    setMatches(updatedMatches);

    // Remove event winner if exists
    if (eventWinnerAwarded[match.eventId]) {
      const winnerTeam = teams.find(t => t.id === eventWinnerAwarded[match.eventId]);
      if (winnerTeam) {
        const updatedPlayersAfterWinner = updatedPlayers.map(player => {
          const isInWinningTeam = winnerTeam.players.some(p => p.id === player.id);
          if (isInWinningTeam) {
            return {
              ...player,
              totalPoints: player.totalPoints - 2,
              dayWins: player.dayWins - 1
            };
          }
          return player;
        });
        setPlayers(updatedPlayersAfterWinner);
      }

      const newEventWinnerAwarded = { ...eventWinnerAwarded };
      delete newEventWinnerAwarded[match.eventId];
      setEventWinnerAwarded(newEventWinnerAwarded);
    }
  };

  // Update player points based on match scores
  const updatePlayerPointsFromScore = (match, wasAlreadyValidated) => {
    const updatedPlayers = [...players];
    
    // If match was already validated, remove previous points first
    if (wasAlreadyValidated) {
      const previousResult = match.score1 > match.score2 ? 'team1' : 
                            match.score2 > match.score1 ? 'team2' : 'draw';
      
      // Remove previous points
      match.team1.players.forEach(player => {
        const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
        if (playerIndex !== -1) {
          if (previousResult === 'team1') {
            updatedPlayers[playerIndex].totalPoints -= 3;
            updatedPlayers[playerIndex].wins -= 1;
          } else if (previousResult === 'draw') {
            updatedPlayers[playerIndex].totalPoints -= 2;
            updatedPlayers[playerIndex].draws -= 1;
          } else {
            updatedPlayers[playerIndex].totalPoints -= 1;
            updatedPlayers[playerIndex].losses -= 1;
          }
        }
      });

      match.team2.players.forEach(player => {
        const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
        if (playerIndex !== -1) {
          if (previousResult === 'team2') {
            updatedPlayers[playerIndex].totalPoints -= 3;
            updatedPlayers[playerIndex].wins -= 1;
          } else if (previousResult === 'draw') {
            updatedPlayers[playerIndex].totalPoints -= 2;
            updatedPlayers[playerIndex].draws -= 1;
          } else {
            updatedPlayers[playerIndex].totalPoints -= 1;
            updatedPlayers[playerIndex].losses -= 1;
          }
        }
      });
    }

    // Determine winner
    const result = match.score1 > match.score2 ? 'team1' : 
                   match.score2 > match.score1 ? 'team2' : 'draw';

    // Add new points
    match.team1.players.forEach(player => {
      const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
      if (playerIndex !== -1) {
        if (result === 'team1') {
          updatedPlayers[playerIndex].totalPoints += 3;
          updatedPlayers[playerIndex].wins += 1;
        } else if (result === 'draw') {
          updatedPlayers[playerIndex].totalPoints += 2;
          updatedPlayers[playerIndex].draws += 1;
        } else {
          updatedPlayers[playerIndex].totalPoints += 1;
          updatedPlayers[playerIndex].losses += 1;
        }
      }
    });

    match.team2.players.forEach(player => {
      const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
      if (playerIndex !== -1) {
        if (result === 'team2') {
          updatedPlayers[playerIndex].totalPoints += 3;
          updatedPlayers[playerIndex].wins += 1;
        } else if (result === 'draw') {
          updatedPlayers[playerIndex].totalPoints += 2;
          updatedPlayers[playerIndex].draws += 1;
        } else {
          updatedPlayers[playerIndex].totalPoints += 1;
          updatedPlayers[playerIndex].losses += 1;
        }
      }
    });

    setPlayers(updatedPlayers);
  };

  // Award event winner bonus (winning team gets +2 points per player)
  const awardEventWinner = (eventId, teamId) => {
    if (!eventId || !teamId) return;
    
    // Check if winner already awarded for this event
    if (eventWinnerAwarded[eventId]) {
      return;
    }

    const winningTeam = teams.find(t => t.id === teamId);
    if (!winningTeam) return;

    const updatedPlayers = players.map(player => {
      const isInWinningTeam = winningTeam.players.some(p => p.id === player.id);
      if (isInWinningTeam) {
        return {
          ...player,
          totalPoints: player.totalPoints + 2,
          dayWins: player.dayWins + 1
        };
      }
      return player;
    });
    setPlayers(updatedPlayers);

    // Mark event as having winner awarded
    setEventWinnerAwarded({
      ...eventWinnerAwarded,
      [eventId]: teamId
    });

    // Update event with winner
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return { ...event, winnerTeamId: teamId };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  // Check if all matches for an event are validated and award winner automatically
  const checkAndAwardEventWinner = (eventId, matchesToCheck = null) => {
    if (!eventId || eventWinnerAwarded[eventId]) return;

    // Use provided matches or fallback to state
    const matchesToUse = matchesToCheck || matches;
    const eventMatches = matchesToUse.filter(m => m.eventId === eventId);
    if (eventMatches.length === 0) return;

    // Check if all matches are validated
    const allValidated = eventMatches.every(m => m.validated);
    if (!allValidated) return;

    // Get team leaderboard
    const leaderboard = getTeamLeaderboard(eventId, matchesToUse);
    if (leaderboard.length === 0) return;

    // Award to the team in first place
    const winningTeam = leaderboard[0];
    awardEventWinner(eventId, winningTeam.id);
  };

  // Calculate leaderboard
  const getLeaderboard = (eventId = null) => {
    let relevantMatches = matches.filter(m => m.validated);
    if (eventId) {
      relevantMatches = relevantMatches.filter(m => m.eventId === eventId);
    }

    const playerStats = {};
    
    relevantMatches.forEach(match => {
      const result = match.score1 > match.score2 ? 'team1' : 
                     match.score2 > match.score1 ? 'team2' : 'draw';

      [...match.team1.players, ...match.team2.players].forEach(player => {
        if (!playerStats[player.id]) {
          playerStats[player.id] = {
            ...player,
            eventPoints: 0,
            eventWins: 0,
            eventDraws: 0,
            eventLosses: 0
          };
        }

        const isTeam1 = match.team1.players.some(p => p.id === player.id);
        const won = (isTeam1 && result === 'team1') || (!isTeam1 && result === 'team2');
        const draw = result === 'draw';

        if (won) {
          playerStats[player.id].eventPoints += 3;
          playerStats[player.id].eventWins += 1;
        } else if (draw) {
          playerStats[player.id].eventPoints += 2;
          playerStats[player.id].eventDraws += 1;
        } else {
          playerStats[player.id].eventPoints += 1;
          playerStats[player.id].eventLosses += 1;
        }
      });
    });

    return Object.values(playerStats).sort((a, b) => b.eventPoints - a.eventPoints);
  };

  // Calculate team rankings for an event
  const getTeamLeaderboard = (eventId, matchesToCheck = null) => {
    if (!eventId) return [];

    const event = events.find(e => e.id === eventId);
    if (!event || !event.teams) return [];

    // Use provided matches or fallback to state
    const matchesToUse = matchesToCheck || matches;
    const relevantMatches = matchesToUse.filter(m => m.eventId === eventId && m.validated);
    const teamStats = {};

    // Initialize team stats
    event.teams.forEach(team => {
      teamStats[team.id] = {
        id: team.id,
        name: team.name,
        color: team.color,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        matchesPlayed: 0,
        goalsFor: 0,
        goalsAgainst: 0
      };
    });

    // Calculate stats from matches
    relevantMatches.forEach(match => {
      const team1Id = match.team1.id;
      const team2Id = match.team2.id;
      
      const result = match.score1 > match.score2 ? 'team1' : 
                     match.score2 > match.score1 ? 'team2' : 'draw';

      // Process team 1
      if (teamStats[team1Id]) {
        teamStats[team1Id].matchesPlayed += 1;
        teamStats[team1Id].goalsFor += match.score1;
        teamStats[team1Id].goalsAgainst += match.score2;
        
        if (result === 'team1') {
          teamStats[team1Id].points += 3;
          teamStats[team1Id].wins += 1;
        } else if (result === 'draw') {
          teamStats[team1Id].points += 2;
          teamStats[team1Id].draws += 1;
        } else if (result === 'team2') {
          teamStats[team1Id].points += 1;
          teamStats[team1Id].losses += 1;
        }
      }

      // Process team 2
      if (teamStats[team2Id]) {
        teamStats[team2Id].matchesPlayed += 1;
        teamStats[team2Id].goalsFor += match.score2;
        teamStats[team2Id].goalsAgainst += match.score1;
        
        if (result === 'team2') {
          teamStats[team2Id].points += 3;
          teamStats[team2Id].wins += 1;
        } else if (result === 'draw') {
          teamStats[team2Id].points += 2;
          teamStats[team2Id].draws += 1;
        } else if (result === 'team1') {
          teamStats[team2Id].points += 1;
          teamStats[team2Id].losses += 1;
        }
      }
    });

    return Object.values(teamStats).sort((a, b) => {
      // Sort by points first
      if (b.points !== a.points) return b.points - a.points;
      // Then by goal difference
      const diffA = a.goalsFor - a.goalsAgainst;
      const diffB = b.goalsFor - b.goalsAgainst;
      if (diffB !== diffA) return diffB - diffA;
      // Then by goals scored
      return b.goalsFor - a.goalsFor;
    });
  };

  // Get rank with ties (e.g., 1, 1, 3, 4, 4, 4, 7)
  const getRankWithTies = (sortedArray, index, pointsKey = 'eventPoints') => {
    if (index === 0) return 1;
    
    const currentPoints = sortedArray[index][pointsKey];
    const previousPoints = sortedArray[index - 1][pointsKey];
    
    if (currentPoints === previousPoints) {
      return getRankWithTies(sortedArray, index - 1, pointsKey);
    }
    
    return index + 1;
  };

  // Find best player and their top 4 teammates
  const getWinners = () => {
    // Find the best player (highest totalPoints)
    if (players.length === 0) return null;
    
    const bestPlayer = [...players].sort((a, b) => b.totalPoints - a.totalPoints)[0];
    
    // Count matches played together with each teammate
    const teammateCounts = {};
    const validatedMatches = matches.filter(m => m.validated);
    
    validatedMatches.forEach(match => {
      // Check if best player is in team1
      const isInTeam1 = match.team1.players.some(p => p.id === bestPlayer.id);
      const isInTeam2 = match.team2.players.some(p => p.id === bestPlayer.id);
      
      if (isInTeam1) {
        // Count teammates from team1 (excluding best player)
        match.team1.players.forEach(player => {
          if (player.id !== bestPlayer.id) {
            if (!teammateCounts[player.id]) {
              teammateCounts[player.id] = {
                player: player,
                matchesTogether: 0
              };
            }
            teammateCounts[player.id].matchesTogether += 1;
          }
        });
      }
      
      if (isInTeam2) {
        // Count teammates from team2 (excluding best player)
        match.team2.players.forEach(player => {
          if (player.id !== bestPlayer.id) {
            if (!teammateCounts[player.id]) {
              teammateCounts[player.id] = {
                player: player,
                matchesTogether: 0
              };
            }
            teammateCounts[player.id].matchesTogether += 1;
          }
        });
      }
    });
    
    // Get top 4 teammates
    const topTeammates = Object.values(teammateCounts)
      .sort((a, b) => b.matchesTogether - a.matchesTogether)
      .slice(0, 4);
    
    return {
      bestPlayer,
      topTeammates
    };
  };

  // Import players from CSV
  const importPlayersFromCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          const newPlayers = [];
          
          // Skip header line (index 0)
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const columns = line.split(';');
            if (columns.length >= 4) {
              const nom = columns[3]?.trim();
              const prenom = columns[4]?.trim();
              
              if (nom && prenom) {
                const fullName = `${prenom} ${nom}`;
                // Check if player already exists
                const exists = players.some(p => p.name.toLowerCase() === fullName.toLowerCase());
                if (!exists) {
                  newPlayers.push({
                    id: Date.now() + i,
                    name: fullName,
                    totalPoints: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    dayWins: 0
                  });
                }
              }
            }
          }
          
          if (newPlayers.length > 0) {
            setPlayers([...players, ...newPlayers]);
            alert(`${newPlayers.length} joueur(s) importé(s) avec succès !`);
          } else {
            alert('Aucun nouveau joueur trouvé dans le fichier CSV');
          }
        } catch (error) {
          console.error('Erreur:', error);
          alert('Erreur lors de l\'importation du fichier CSV');
        }
      };
      reader.readAsText(file);
    }
  };

  // Responsive styles
  const responsivePadding = isMobile ? '0.75rem' : '1rem';
  const responsiveCardPadding = isMobile ? '1rem' : '1.5rem';
  const responsiveTitleSize = isMobile ? '1.5rem' : '1.875rem';
  const responsiveSubtitleSize = isMobile ? '1.125rem' : '1.5rem';
  const responsiveButtonPadding = isMobile ? '0.75rem 1rem' : '0.75rem 1.5rem';
  const responsiveButtonFontSize = isMobile ? '0.875rem' : '1rem';

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(180deg, ${theme.navy700} 0%, ${theme.navy900} 100%)`, 
      padding: responsivePadding,
      overflowX: 'hidden'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ 
          background: theme.navy800, 
          borderRadius: isMobile ? '12px' : '16px', 
          boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
          padding: responsiveCardPadding,
          marginBottom: isMobile ? '1rem' : '1.5rem',
          border: `2px solid ${theme.navy600}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: isMobile ? '0.75rem' : '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.75rem', flex: isMobile ? '1 1 100%' : 'auto' }}>
              <Trophy style={{ width: isMobile ? '1.5rem' : '2rem', height: isMobile ? '1.5rem' : '2rem', color: theme.gold500 }} />
              <h1 style={{ 
                fontSize: responsiveTitleSize, 
                fontWeight: 'bold', 
                color: theme.textPrimary,
                margin: 0,
                fontFamily: 'Montserrat, system-ui, sans-serif',
                lineHeight: '1.2'
              }}>
                {isMobile ? 'Tournoi' : 'Tournoi de Football'}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', alignItems: 'center' }}>
              {user && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem',
                  background: theme.navy700,
                  borderRadius: '12px',
                  border: `1px solid ${theme.navy600}`,
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: isMobile ? 'space-between' : 'flex-start',
                  order: isMobile ? -1 : 0
                }}>
                  {user.picture && (
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: `2px solid ${theme.gold500}`
                      }}
                    />
                  )}
                  <span style={{
                    fontSize: isMobile ? '0.875rem' : '0.9375rem',
                    color: theme.textPrimary,
                    fontWeight: '500',
                    flex: 1
                  }}>
                    {user.name}
                  </span>
                  <button
                    onClick={onSignOut}
                    style={{
                      padding: '0.5rem',
                      background: theme.navy600,
                      color: theme.textPrimary,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      minHeight: '36px',
                      transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.navy500;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme.navy600;
                    }}
                    title="Déconnexion"
                  >
                    <LogOut style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>
              )}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem', 
                padding: responsiveButtonPadding,
                background: `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                color: theme.navy900,
                borderRadius: '12px',
                border: `2px solid ${theme.gold700}`,
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 0 0 3px rgba(217,164,65,0.25), 0 0 24px rgba(217,164,65,0.35)',
                transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                fontSize: responsiveButtonFontSize,
                minHeight: '44px',
                width: isMobile ? '100%' : 'auto',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,164,65,0.25), 0 0 24px rgba(217,164,65,0.35), 0 10px 30px rgba(0,0,0,0.36)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,164,65,0.25), 0 0 24px rgba(217,164,65,0.35)';
              }}>
                <Upload style={{ width: '1rem', height: '1rem' }} />
                Importer Joueurs (CSV)
                <input type="file" accept=".csv" onChange={importPlayersFromCSV} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Navigation - Desktop */}
          {!isMobile && (
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '1rem', 
              flexWrap: 'wrap'
            }}>
              {['setup', 'teams', 'matches', 'leaderboard'].map(viewName => (
                <button
                  key={viewName}
                  onClick={() => setView(viewName)}
                  disabled={(viewName === 'teams' && (!currentEvent || teams.length === 0)) || 
                           (viewName === 'matches' && (!currentEvent || matches.filter(m => m.eventId === currentEvent).length === 0))}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    border: '2px solid',
                    cursor: viewName === 'teams' && (!currentEvent || teams.length === 0) || viewName === 'matches' && (!currentEvent || matches.filter(m => m.eventId === currentEvent).length === 0) ? 'not-allowed' : 'pointer',
                    background: view === viewName ? `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)` : theme.navy700,
                    color: view === viewName ? theme.navy900 : theme.textPrimary,
                    borderColor: view === viewName ? theme.gold700 : theme.navy600,
                    opacity: (viewName === 'teams' && (!currentEvent || teams.length === 0)) || (viewName === 'matches' && (!currentEvent || matches.filter(m => m.eventId === currentEvent).length === 0)) ? 0.5 : 1,
                    transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                    fontSize: '1rem',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {viewName === 'setup' && 'Configuration'}
                  {viewName === 'teams' && `Équipes ${currentEvent ? '(Événement)' : '(Aucun événement)'}`}
                  {viewName === 'matches' && `Matchs ${currentEvent ? '(Événement)' : '(Aucun événement)'}`}
                  {viewName === 'leaderboard' && 'Classement'}
                </button>
              ))}
            </div>
          )}

          {/* Navigation - Mobile Hamburger Menu */}
          {isMobile && (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: theme.navy700,
                  border: `2px solid ${theme.navy600}`,
                  color: theme.textPrimary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  minWidth: '44px',
                  marginTop: '0.75rem',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.navy600;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.navy700;
                }}
              >
                {mobileMenuOpen ? (
                  <X style={{ width: '1.5rem', height: '1.5rem' }} />
                ) : (
                  <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
                )}
              </button>

              {/* Mobile Menu Overlay */}
              {mobileMenuOpen && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(12, 30, 42, 0.95)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1rem',
                  gap: '0.75rem',
                  animation: 'fadeIn 0.2s ease-in'
                }}
                onClick={() => setMobileMenuOpen(false)}
                >
                  <div style={{
                    background: theme.navy800,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: `2px solid ${theme.navy600}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxWidth: '400px',
                    margin: '0 auto',
                    width: '100%',
                    marginTop: '2rem'
                  }}
                  onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: theme.textPrimary,
                        margin: 0
                      }}>
                        Navigation
                      </h3>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          padding: '0.5rem',
                          background: 'transparent',
                          border: 'none',
                          color: theme.textPrimary,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '44px',
                          minWidth: '44px'
                        }}
                      >
                        <X style={{ width: '1.5rem', height: '1.5rem' }} />
                      </button>
                    </div>
                    {['setup', 'teams', 'matches', 'leaderboard'].map(viewName => {
                      const isDisabled = (viewName === 'teams' && (!currentEvent || teams.length === 0)) || 
                                       (viewName === 'matches' && (!currentEvent || matches.filter(m => m.eventId === currentEvent).length === 0));
                      return (
                        <button
                          key={viewName}
                          onClick={() => {
                            if (!isDisabled) {
                              setView(viewName);
                              setMobileMenuOpen(false);
                            }
                          }}
                          disabled={isDisabled}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            fontWeight: '600',
                            border: '2px solid',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            background: view === viewName ? `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)` : theme.navy700,
                            color: view === viewName ? theme.navy900 : theme.textPrimary,
                            borderColor: view === viewName ? theme.gold700 : theme.navy600,
                            opacity: isDisabled ? 0.5 : 1,
                            transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                            fontSize: '1rem',
                            minHeight: '52px',
                            width: '100%',
                            textAlign: 'left',
                            WebkitTapHighlightColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>
                            {viewName === 'setup' && '⚙️ Configuration'}
                            {viewName === 'teams' && '👥 Équipes'}
                            {viewName === 'matches' && '⚽ Matchs'}
                            {viewName === 'leaderboard' && '🏆 Classement'}
                          </span>
                          {view === viewName && <span style={{ fontSize: '1.25rem' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Setup View */}
        {view === 'setup' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: isMobile ? '1rem' : '1.5rem' 
          }}>
            {/* Player Management */}
            <div style={{ 
              background: theme.navy800, 
              borderRadius: isMobile ? '12px' : '16px', 
              boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
              padding: responsiveCardPadding,
              border: `2px solid ${theme.navy600}`
            }}>
              <h2 style={{ 
                fontSize: responsiveSubtitleSize, 
                fontWeight: 'bold', 
                marginBottom: isMobile ? '0.75rem' : '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: theme.textPrimary,
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                <Users style={{ width: '1.5rem', height: '1.5rem', color: theme.gold500 }} />
                Gestion des Joueurs
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  placeholder="Nom du joueur"
                  style={{
                    width: '100%',
                    padding: isSmallMobile ? '1rem' : '0.75rem 1rem',
                    border: `2px solid ${theme.navy600}`,
                    borderRadius: '12px',
                    background: theme.navy700,
                    color: theme.textPrimary,
                    fontSize: isSmallMobile ? '16px' : '1rem',
                    minHeight: isSmallMobile ? '56px' : '44px'
                  }}
                />
                <button
                  onClick={addPlayer}
                  style={{
                    width: '100%',
                    padding: isSmallMobile ? '1rem 1.5rem' : isMobile ? '0.875rem 1.25rem' : '0.75rem 1rem',
                    background: `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                    color: theme.navy900,
                    borderRadius: '12px',
                    border: `2px solid ${theme.gold700}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                    transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                    minHeight: isSmallMobile ? '56px' : isMobile ? '52px' : '44px',
                    fontSize: isSmallMobile ? '1rem' : isMobile ? '1rem' : '0.875rem',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.32)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.28)';
                  }}
                >
                  <Plus style={{ width: isSmallMobile ? '1.5rem' : isMobile ? '1.25rem' : '1rem', height: isSmallMobile ? '1.5rem' : isMobile ? '1.25rem' : '1rem' }} />
                  Ajouter
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                {players.map(player => (
                  <div key={player.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem',
                    background: theme.navy700,
                    borderRadius: '12px',
                    border: `1px solid ${theme.navy600}`
                  }}>
                    {editingPlayerId === player.id ? (
                      <>
                        <input
                          type="text"
                          value={editingPlayerName}
                          onChange={(e) => setEditingPlayerName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEditedPlayer()}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: theme.navy600,
                            color: theme.textPrimary,
                            border: `2px solid ${theme.gold500}`,
                            borderRadius: '8px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                          <button
                            onClick={saveEditedPlayer}
                            style={{
                              padding: '0.5rem',
                              background: theme.success,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditingPlayer}
                            style={{
                              padding: '0.5rem',
                              background: theme.navy600,
                              color: theme.textPrimary,
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: '500', color: theme.textPrimary }}>{player.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                            {player.totalPoints} pts
                          </div>
                          <button
                            onClick={() => startEditingPlayer(player)}
                            style={{
                              padding: '0.5rem',
                              background: theme.navy600,
                              color: theme.gold400,
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Edit2 style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deletePlayer(player.id);
                            }}
                            type="button"
                            style={{
                              padding: '0.5rem',
                              background: theme.danger,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '36px',
                              minHeight: '36px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#E04444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = theme.danger;
                            }}
                          >
                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Event Management */}
            <div style={{ 
              background: theme.navy800, 
              borderRadius: '16px', 
              boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
              padding: '1.5rem',
              border: `2px solid ${theme.navy600}`
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: theme.textPrimary,
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                <Calendar style={{ width: '1.5rem', height: '1.5rem', color: theme.gold500 }} />
                Événements
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isSmallMobile ? '1rem' : '0.75rem 1rem',
                    border: `2px solid ${theme.navy600}`,
                    borderRadius: '12px',
                    background: theme.navy700,
                    color: theme.textPrimary,
                    fontSize: isSmallMobile ? '16px' : '1rem',
                    minHeight: isSmallMobile ? '56px' : '44px'
                  }}
                />
                <button
                  onClick={createEvent}
                  style={{
                    width: '100%',
                    padding: isSmallMobile ? '1rem 1.5rem' : isMobile ? '0.875rem 1.25rem' : '0.75rem 1rem',
                    background: `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                    color: theme.navy900,
                    borderRadius: '12px',
                    border: `2px solid ${theme.gold700}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                    transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                    minHeight: isSmallMobile ? '56px' : isMobile ? '52px' : '44px',
                    fontSize: isSmallMobile ? '1rem' : isMobile ? '1rem' : '0.875rem',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.32)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.28)';
                  }}
                >
                  <Calendar style={{ width: isSmallMobile ? '1.5rem' : isMobile ? '1.25rem' : '1rem', height: isSmallMobile ? '1.5rem' : isMobile ? '1.25rem' : '1rem' }} />
                  Créer
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                {events.map(event => (
                  <div
                    key={event.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: currentEvent === event.id ? theme.navy600 : theme.navy700,
                      border: `2px solid ${currentEvent === event.id ? theme.gold500 : theme.navy600}`,
                      transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div
                      onClick={() => {
                        setCurrentEvent(event.id);
                        if (event.teams && event.teams.length > 0) {
                          setTeams(event.teams);
                        }
                      }}
                      style={{ flex: 1 }}
                    >
                      <div style={{ fontWeight: '500', color: theme.textPrimary }}>
                        {new Date(event.date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      {event.winnerTeamId && (
                        <div style={{ fontSize: '0.875rem', color: theme.success, fontWeight: '500', marginTop: '0.25rem' }}>
                          🏆 Vainqueur attribué
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteEvent(event.id);
                      }}
                      type="button"
                      style={{
                        padding: '0.5rem',
                        background: theme.danger,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '36px',
                        minHeight: '36px',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E04444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.danger;
                      }}
                    >
                      <Trash2 style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Team Configuration */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${theme.navy600}` }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: theme.textPrimary }}>Configuration des Équipes</h3>
                {!currentEvent && (
                  <div style={{ fontSize: '0.875rem', color: theme.gold400, marginBottom: '0.75rem' }}>
                    ⚠️ Veuillez d'abord créer un événement
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '500', color: theme.textPrimary }}>Nombre d'équipes:</label>
                  <select
                    value={numTeams}
                    onChange={(e) => setNumTeams(Number(e.target.value))}
                    style={{
                      padding: '0.75rem 1rem',
                      border: `2px solid ${theme.navy600}`,
                      borderRadius: '12px',
                      background: theme.navy700,
                      color: theme.textPrimary
                    }}
                  >
                    {[2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={randomizeTeams}
                  disabled={players.length < numTeams || !currentEvent || eventWinnerAwarded[currentEvent]}
                  style={{
                    width: '100%',
                    padding: isMobile ? '1rem 1.25rem' : '0.75rem 1rem',
                    background: (players.length < numTeams || !currentEvent || eventWinnerAwarded[currentEvent]) ? theme.navy600 : `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                    color: (players.length < numTeams || !currentEvent || eventWinnerAwarded[currentEvent]) ? theme.textMuted : theme.navy900,
                    borderRadius: '12px',
                    border: `2px solid ${(players.length < numTeams || !currentEvent || eventWinnerAwarded[currentEvent]) ? theme.navy600 : theme.gold700}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    cursor: (players.length < numTeams || !currentEvent || eventWinnerAwarded[currentEvent]) ? 'not-allowed' : 'pointer',
                    opacity: (players.length < numTeams || !currentEvent || eventWinnerAwarded[currentEvent]) ? 0.5 : 1,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                    transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                    minHeight: isMobile ? '56px' : '44px',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!(players.length < numTeams || !currentEvent)) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.32)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(players.length < numTeams || !currentEvent)) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.28)';
                    }
                  }}
                >
                  <Shuffle style={{ width: isMobile ? '1.25rem' : '1rem', height: isMobile ? '1.25rem' : '1rem' }} />
                  Générer les Équipes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teams View */}
        {view === 'teams' && currentEvent && (
          <div style={{ 
            background: theme.navy800, 
            borderRadius: isMobile ? '12px' : '16px', 
            boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
            padding: responsiveCardPadding,
            border: `2px solid ${theme.navy600}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '1rem' : '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ 
                  fontSize: responsiveSubtitleSize, 
                  fontWeight: 'bold', 
                  color: theme.textPrimary,
                  fontFamily: 'Montserrat, system-ui, sans-serif'
                }}>
                  Équipes de l'Événement
                </h2>
                <p style={{ color: theme.textSecondary, fontSize: isMobile ? '0.75rem' : '0.875rem', marginTop: '0.25rem' }}>
                  {new Date(events.find(e => e.id === currentEvent)?.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={generateMatches}
                disabled={eventWinnerAwarded[currentEvent]}
                style={{
                  padding: isMobile ? '1rem 1.25rem' : '0.75rem 1.5rem',
                  background: eventWinnerAwarded[currentEvent] ? theme.navy600 : `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                  color: eventWinnerAwarded[currentEvent] ? theme.textMuted : theme.navy900,
                  borderRadius: '12px',
                  border: `2px solid ${eventWinnerAwarded[currentEvent] ? theme.navy600 : theme.gold700}`,
                  fontWeight: '600',
                  cursor: eventWinnerAwarded[currentEvent] ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                  transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: isMobile ? '56px' : '44px',
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  WebkitTapHighlightColor: 'transparent',
                  width: isMobile ? '100%' : 'auto',
                  opacity: eventWinnerAwarded[currentEvent] ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.32)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.28)';
                }}
              >
                Générer les Matchs
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: isMobile ? '0.75rem' : '1rem' }}>
              {teams.filter(t => t.eventId === currentEvent).map(team => (
                <div
                  key={team.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(team.id)}
                  style={{
                    border: `2px solid ${theme.navy600}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    background: theme.navy700
                  }}
                >
                  <div style={{
                    background: team.color.includes('blue') ? '#3B82F6' : 
                               team.color.includes('red') ? '#EF4444' : 
                               team.color.includes('green') ? '#10B981' : 
                               team.color.includes('yellow') ? '#F59E0B' : 
                               team.color.includes('purple') ? '#8B5CF6' : theme.gold500,
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px 12px 0 0',
                    margin: '-1rem -1rem 1rem -1rem'
                  }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{team.name}</h3>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{team.players.length} joueurs</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {team.players.map(player => (
                      <div
                        key={player.id}
                        draggable={!eventWinnerAwarded[currentEvent]}
                        onDragStart={() => handleDragStart(player, team.id)}
                        style={{
                          padding: '0.5rem',
                          background: theme.navy600,
                          borderRadius: '8px',
                          cursor: eventWinnerAwarded[currentEvent] ? 'not-allowed' : 'move',
                          color: theme.textPrimary,
                          transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                          opacity: eventWinnerAwarded[currentEvent] ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!eventWinnerAwarded[currentEvent]) {
                            e.currentTarget.style.background = theme.navy500;
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = theme.navy600;
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {player.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matches View */}
        {view === 'matches' && currentEvent && (
          <div style={{ 
            background: theme.navy800, 
            borderRadius: '16px', 
            boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
            padding: '1.5rem',
            border: `2px solid ${theme.navy600}`
          }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: theme.textPrimary,
                  fontFamily: 'Montserrat, system-ui, sans-serif'
                }}>
                  Matchs de l'Événement
                </h2>
                <p style={{ color: theme.textSecondary, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {new Date(events.find(e => e.id === currentEvent)?.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={() => {
                  if (eventWinnerAwarded[currentEvent]) {
                    alert('Impossible d\'ajouter un match : un vainqueur a déjà été attribué à cet événement.');
                    return;
                  }
                  setShowAddMatchForm(!showAddMatchForm);
                }}
                disabled={eventWinnerAwarded[currentEvent]}
                style={{
                  padding: isMobile ? '1rem 1.25rem' : '0.75rem 1.5rem',
                  background: eventWinnerAwarded[currentEvent] ? theme.navy600 : `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                  color: eventWinnerAwarded[currentEvent] ? theme.textMuted : theme.navy900,
                  borderRadius: '12px',
                  border: `2px solid ${eventWinnerAwarded[currentEvent] ? theme.navy600 : theme.gold700}`,
                  fontWeight: '600',
                  cursor: eventWinnerAwarded[currentEvent] ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                  transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: isMobile ? '56px' : '44px',
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  WebkitTapHighlightColor: 'transparent',
                  width: isMobile ? '100%' : 'auto',
                  opacity: eventWinnerAwarded[currentEvent] ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.32)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.28)';
                }}
              >
                <Plus style={{ width: isMobile ? '1.25rem' : '1rem', height: isMobile ? '1.25rem' : '1rem' }} />
                {showAddMatchForm ? 'Annuler' : 'Ajouter un Match'}
              </button>
            </div>

            {/* Add Match Form */}
            {showAddMatchForm && (
              <div style={{
                marginBottom: isMobile ? '1rem' : '1.5rem',
                padding: responsiveCardPadding,
                background: theme.navy700,
                borderRadius: '12px',
                border: `2px solid ${theme.navy600}`
              }}>
                <h3 style={{ 
                  fontSize: isMobile ? '1rem' : '1.125rem', 
                  fontWeight: 'bold', 
                  marginBottom: isMobile ? '0.75rem' : '1rem',
                  color: theme.textPrimary
                }}>
                  Nouveau Match
                </h3>
                <div style={{ display: 'flex', gap: isMobile ? '0.75rem' : '1rem', flexWrap: 'wrap', alignItems: 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ flex: 1, minWidth: isMobile ? '100%' : '200px', width: isMobile ? '100%' : 'auto' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: theme.textPrimary,
                      fontWeight: '500',
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}>
                      Équipe 1
                    </label>
                    <select
                      value={newMatchTeam1}
                      onChange={(e) => setNewMatchTeam1(e.target.value)}
                      style={{
                        width: '100%',
                        padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                        border: `2px solid ${theme.navy600}`,
                        borderRadius: '12px',
                        background: theme.navy600,
                        color: theme.textPrimary,
                        minHeight: isMobile ? '52px' : '44px',
                        fontSize: isMobile ? '16px' : '1rem',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      <option value="">Sélectionner une équipe</option>
                      {teams.filter(t => t.eventId === currentEvent).map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? '1.25rem' : '1.5rem', 
                    fontWeight: 'bold', 
                    color: theme.textMuted,
                    paddingBottom: isMobile ? '0' : '0.5rem',
                    textAlign: 'center',
                    width: isMobile ? '100%' : 'auto'
                  }}>
                    VS
                  </div>
                  <div style={{ flex: 1, minWidth: isMobile ? '100%' : '200px', width: isMobile ? '100%' : 'auto' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: theme.textPrimary,
                      fontWeight: '500',
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}>
                      Équipe 2
                    </label>
                    <select
                      value={newMatchTeam2}
                      onChange={(e) => setNewMatchTeam2(e.target.value)}
                      style={{
                        width: '100%',
                        padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                        border: `2px solid ${theme.navy600}`,
                        borderRadius: '12px',
                        background: theme.navy600,
                        color: theme.textPrimary,
                        minHeight: isMobile ? '52px' : '44px',
                        fontSize: isMobile ? '16px' : '1rem',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      <option value="">Sélectionner une équipe</option>
                      {teams.filter(t => t.eventId === currentEvent).map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addMatch}
                    style={{
                      padding: isMobile ? '1rem 1.25rem' : '0.75rem 1.5rem',
                      background: `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                      color: theme.navy900,
                      borderRadius: '12px',
                      border: `2px solid ${theme.gold700}`,
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                      transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      minHeight: isMobile ? '56px' : '44px',
                      fontSize: isMobile ? '1rem' : '0.875rem',
                      WebkitTapHighlightColor: 'transparent',
                      width: isMobile ? '100%' : 'auto'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.32)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.28)';
                    }}
                  >
                    <Plus style={{ width: isMobile ? '1.25rem' : '1rem', height: isMobile ? '1.25rem' : '1rem' }} />
                    Créer
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matches.filter(m => m.eventId === currentEvent).map(match => (
                <div key={match.id} style={{
                  border: `2px solid ${match.validated ? theme.success : theme.navy600}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  background: match.validated ? theme.navy700 : theme.navy700
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: isMobile ? '0.5rem' : '1rem' }}>
                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'right', width: isMobile ? '100%' : 'auto' }}>
                          <div style={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.125rem', color: theme.textPrimary }}>{match.team1.name}</div>
                          <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: theme.textSecondary }}>
                            {match.team1.players.map(p => p.name).join(', ')}
                          </div>
                        </div>
                        
                        {/* Score inputs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.75rem' }}>
                          <input
                            type="number"
                            min="0"
                            value={match.score1 ?? ''}
                            onChange={(e) => updateMatchScore(match.id, 1, parseInt(e.target.value) || 0)}
                            disabled={match.validated}
                            style={{
                              width: isMobile ? '56px' : '64px',
                              padding: isMobile ? '0.75rem 0.5rem' : '0.5rem',
                              textAlign: 'center',
                              fontSize: isMobile ? '1.125rem' : '1.25rem',
                              fontWeight: 'bold',
                              border: `2px solid ${match.validated ? theme.navy600 : theme.gold500}`,
                              borderRadius: '8px',
                              background: match.validated ? theme.navy600 : theme.navy700,
                              color: theme.textPrimary,
                              minHeight: '44px'
                            }}
                            placeholder="0"
                          />
                          <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 'bold', color: theme.textMuted }}>-</div>
                          <input
                            type="number"
                            min="0"
                            value={match.score2 ?? ''}
                            onChange={(e) => updateMatchScore(match.id, 2, parseInt(e.target.value) || 0)}
                            disabled={match.validated}
                            style={{
                              width: isMobile ? '56px' : '64px',
                              padding: isMobile ? '0.75rem 0.5rem' : '0.5rem',
                              textAlign: 'center',
                              fontSize: isMobile ? '1.125rem' : '1.25rem',
                              fontWeight: 'bold',
                              border: `2px solid ${match.validated ? theme.navy600 : theme.gold500}`,
                              borderRadius: '8px',
                              background: match.validated ? theme.navy600 : theme.navy700,
                              color: theme.textPrimary,
                              minHeight: '44px'
                            }}
                            placeholder="0"
                          />
                        </div>
                        
                        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left', width: isMobile ? '100%' : 'auto' }}>
                          <div style={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.125rem', color: theme.textPrimary }}>{match.team2.name}</div>
                          <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: theme.textSecondary }}>
                            {match.team2.players.map(p => p.name).join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginLeft: isMobile ? '0' : '1rem', width: isMobile ? '100%' : 'auto' }}>
                      {match.validated ? (
                        <div style={{
                          padding: '0.75rem 1.5rem',
                          background: theme.success,
                          color: 'white',
                          borderRadius: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          ✓ Validé
                        </div>
                      ) : (
                        <button
                          onClick={() => validateMatchResult(match.id)}
                          style={{
                            padding: isMobile ? '1rem 1.25rem' : '0.75rem 1.5rem',
                            background: `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                            color: theme.navy900,
                            borderRadius: '12px',
                            border: `2px solid ${theme.gold700}`,
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                            transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            minHeight: isMobile ? '56px' : '44px',
                            fontSize: isMobile ? '1rem' : '0.875rem',
                            WebkitTapHighlightColor: 'transparent',
                            width: isMobile ? '100%' : 'auto'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.32)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.28)';
                          }}
                        >
                          Valider le résultat
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Show result after validation */}
                  {match.validated && (
                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: `1px solid ${theme.navy600}`,
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: theme.textPrimary
                    }}>
                      {match.score1 > match.score2 && `🏆 Victoire ${match.team1.name}`}
                      {match.score2 > match.score1 && `🏆 Victoire ${match.team2.name}`}
                      {match.score1 === match.score2 && '🤝 Match nul'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Event Winner Display */}
            {teams.filter(t => t.eventId === currentEvent).length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${theme.navy600}` }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem', color: theme.textPrimary }}>
                  🏆 Vainqueur de l'Événement (+2 points par joueur)
                </h3>
                {eventWinnerAwarded[currentEvent] ? (
                  <div style={{
                    padding: '1rem',
                    background: theme.navy700,
                    border: `2px solid ${theme.success}`,
                    borderRadius: '12px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: theme.success, fontSize: '1.125rem' }}>
                      ✓ Vainqueur attribué : {teams.find(t => t.id === eventWinnerAwarded[currentEvent])?.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginTop: '0.5rem' }}>
                      Tous les joueurs de cette équipe ont reçu +2 points !
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '1rem',
                    background: theme.navy700,
                    border: `2px solid ${theme.navy500}`,
                    borderRadius: '12px'
                  }}>
                    <div style={{ color: theme.textSecondary }}>
                      ℹ️ Le vainqueur sera automatiquement déterminé une fois tous les matchs validés
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard View */}
        {view === 'leaderboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}>
            {/* Winners Button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              marginBottom: isMobile ? '0.5rem' : '0'
            }}>
              <button
                onClick={() => setShowWinners(!showWinners)}
                style={{
                  padding: responsiveButtonPadding,
                  background: `linear-gradient(135deg, ${theme.gold700} 0%, ${theme.gold500} 45%, ${theme.gold300} 100%)`,
                  color: theme.navy900,
                  borderRadius: '12px',
                  border: `2px solid ${theme.gold700}`,
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 0 0 3px rgba(217,164,65,0.25), 0 0 24px rgba(217,164,65,0.35)',
                  transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                  fontSize: responsiveButtonFontSize,
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,164,65,0.25), 0 0 24px rgba(217,164,65,0.35), 0 10px 30px rgba(0,0,0,0.36)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,164,65,0.25), 0 0 24px rgba(217,164,65,0.35)';
                }}
              >
                <Trophy style={{ width: '1.25rem', height: '1.25rem' }} />
                {showWinners ? 'Masquer les Gagnants' : 'Voir les Gagnants'}
              </button>
            </div>

            {/* Winners Display */}
            {showWinners && (() => {
              const winners = getWinners();
              if (!winners || winners.topTeammates.length === 0) {
                return (
                  <div style={{ 
                    background: theme.navy800, 
                    borderRadius: isMobile ? '12px' : '16px', 
                    boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
                    padding: responsiveCardPadding,
                    border: `2px solid ${theme.navy600}`,
                    textAlign: 'center'
                  }}>
                    <p style={{ color: theme.textSecondary, fontSize: '1rem' }}>
                      Pas assez de données pour afficher les gagnants. Il faut au moins des matchs validés.
                    </p>
                  </div>
                );
              }
              
              return (
                <div style={{ 
                  background: theme.navy800, 
                  borderRadius: isMobile ? '12px' : '16px', 
                  boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
                  padding: responsiveCardPadding,
                  border: `2px solid ${theme.gold500}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative gradient overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.gold700} 0%, ${theme.gold500} 50%, ${theme.gold300} 100%)`
                  }}></div>
                  
                  <h2 style={{ 
                    fontSize: responsiveSubtitleSize, 
                    fontWeight: 'bold', 
                    marginBottom: isMobile ? '1rem' : '1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: theme.gold400,
                    fontFamily: 'Montserrat, system-ui, sans-serif'
                  }}>
                    <Trophy style={{ width: '2rem', height: '2rem', color: theme.gold500 }} />
                    Les Gagnants
                  </h2>

                  {/* Best Player */}
                  <div style={{
                    background: `linear-gradient(135deg, ${theme.gold700}20 0%, ${theme.gold500}15 100%)`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: `2px solid ${theme.gold500}`,
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: theme.gold400,
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      🏆 Meilleur Joueur
                    </div>
                    <div style={{
                      fontSize: isMobile ? '1.5rem' : '2rem',
                      fontWeight: 'bold',
                      color: theme.textPrimary,
                      marginBottom: '0.5rem',
                      fontFamily: 'Montserrat, system-ui, sans-serif'
                    }}>
                      {winners.bestPlayer.name}
                    </div>
                    <div style={{
                      fontSize: '1.125rem',
                      color: theme.gold400,
                      fontWeight: '600'
                    }}>
                      {winners.bestPlayer.totalPoints} points
                    </div>
                  </div>

                  {/* Top Teammates */}
                  <div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: theme.textSecondary,
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      Ses 4 Plus Fidèles Coéquipiers
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                      gap: '1rem'
                    }}>
                      {winners.topTeammates.map((teammate, index) => (
                        <div
                          key={teammate.player.id}
                          style={{
                            background: theme.navy700,
                            borderRadius: '12px',
                            padding: '1rem',
                            border: `2px solid ${theme.navy600}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 180ms cubic-bezier(0.33, 1, 0.68, 1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = theme.gold500;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = theme.navy600;
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: theme.gold400,
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: theme.navy600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {index + 1}
                          </div>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: theme.textPrimary,
                            textAlign: 'center'
                          }}>
                            {teammate.player.name}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: theme.textSecondary,
                            textAlign: 'center'
                          }}>
                            {teammate.matchesTogether} match{teammate.matchesTogether > 1 ? 's' : ''} ensemble
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* Global Leaderboard */}
            <div style={{ 
              background: theme.navy800, 
              borderRadius: isMobile ? '12px' : '16px', 
              boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
              padding: responsiveCardPadding,
              border: `2px solid ${theme.navy600}`
            }}>
              <h2 style={{ 
                fontSize: responsiveSubtitleSize, 
                fontWeight: 'bold', 
                marginBottom: isMobile ? '0.75rem' : '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: theme.textPrimary,
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                <Trophy style={{ width: '1.5rem', height: '1.5rem', color: theme.gold500 }} />
                Classement Global des Joueurs
              </h2>

              <div style={{ 
                overflowX: 'auto', 
                WebkitOverflowScrolling: 'touch',
                margin: isMobile ? '0 -1rem' : '0',
                padding: isMobile ? '0 1rem' : '0'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  minWidth: isMobile ? '600px' : 'auto'
                }}>
                  <thead style={{ background: theme.navy700 }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: theme.textPrimary, fontWeight: '600' }}>Rang</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: theme.textPrimary, fontWeight: '600' }}>Joueur</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>Points</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>V</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>N</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>D</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>Victoires du jour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...players].sort((a, b) => b.totalPoints - a.totalPoints).map((player, index, array) => {
                      const rank = getRankWithTies(array, index, 'totalPoints');
                      return (
                        <tr key={player.id} style={{ 
                          background: rank <= 3 ? theme.navy700 : 'transparent',
                          borderBottom: `1px solid ${theme.navy600}`
                        }}>
                          <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            fontWeight: 'bold', 
                            color: theme.textPrimary,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>
                            {rank === 1 && index === 0 && '🥇'}
                            {rank === 1 && index > 0 && array[index - 1].totalPoints !== player.totalPoints && '🥇'}
                            {rank === 2 && '🥈'}
                            {rank === 3 && '🥉'}
                            {rank > 3 && rank}
                            {rank === 1 && ''}
                          </td>
                          <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            fontWeight: '500', 
                            color: theme.textPrimary,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>{player.name}</td>
                          <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            textAlign: 'center', 
                            fontWeight: 'bold', 
                            color: theme.gold400,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>{player.totalPoints}</td>
                          <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            textAlign: 'center', 
                            color: theme.textSecondary,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>{player.wins}</td>
                          <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            textAlign: 'center', 
                            color: theme.textSecondary,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>{player.draws}</td>
                          <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            textAlign: 'center', 
                            color: theme.textSecondary,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>{player.losses}</td>
                          <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            textAlign: 'center', 
                            color: theme.textSecondary,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>{player.dayWins}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Event Leaderboards */}
            {currentEvent && (
              <>
                {/* Event Team Leaderboard */}
                <div style={{ 
                  background: theme.navy800, 
                  borderRadius: '16px', 
                  boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
                  padding: '1.5rem',
                  border: `2px solid ${theme.navy600}`
                }}>
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: '1rem',
                    color: theme.textPrimary,
                    fontFamily: 'Montserrat, system-ui, sans-serif'
                  }}>
                    🏆 Classement des Équipes - {new Date(events.find(e => e.id === currentEvent)?.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>

                  {eventWinnerAwarded[currentEvent] && (
                    <div style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      background: theme.navy700,
                      border: `2px solid ${theme.gold500}`,
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontWeight: 'bold', color: theme.gold400 }}>
                        🏆 Événement terminé - Vainqueur : {teams.find(t => t.id === eventWinnerAwarded[currentEvent])?.name}
                      </div>
                    </div>
                  )}

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: theme.navy700 }}>
                        <tr>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: theme.textPrimary, fontWeight: '600' }}>Rang</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: theme.textPrimary, fontWeight: '600' }}>Équipe</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>Points</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>V</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>N</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>D</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>BP</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>BC</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>Diff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getTeamLeaderboard(currentEvent).map((team, index, array) => {
                          const rank = getRankWithTies(array, index, 'points');
                          const goalDiff = team.goalsFor - team.goalsAgainst;
                          const isWinner = eventWinnerAwarded[currentEvent] === team.id;
                          return (
                            <tr key={team.id} style={{ 
                              background: isWinner ? theme.navy600 : (rank <= 3 ? theme.navy700 : 'transparent'),
                              borderBottom: `1px solid ${theme.navy600}`,
                              border: isWinner ? `2px solid ${theme.gold500}` : 'none'
                            }}>
                              <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            fontWeight: 'bold', 
                            color: theme.textPrimary,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>
                                {isWinner && '👑 '}
                                {rank === 1 && index === 0 && '🥇'}
                                {rank === 1 && index > 0 && array[index - 1].points !== team.points && '🥇'}
                                {rank === 2 && '🥈'}
                                {rank === 3 && '🥉'}
                                {rank > 3 && rank}
                                {rank === 1 && ''}
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    background: team.color.includes('blue') ? '#3B82F6' : 
                                               team.color.includes('red') ? '#EF4444' : 
                                               team.color.includes('green') ? '#10B981' : 
                                               team.color.includes('yellow') ? '#F59E0B' : 
                                               team.color.includes('purple') ? '#8B5CF6' : theme.gold500
                                  }}></div>
                                  <span style={{ fontWeight: isWinner ? 'bold' : '500', color: theme.textPrimary }}>{team.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 'bold', color: isWinner ? theme.gold400 : theme.gold300 }}>{team.points}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textSecondary }}>{team.wins}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textSecondary }}>{team.draws}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textSecondary }}>{team.losses}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textSecondary }}>{team.goalsFor}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textSecondary }}>{team.goalsAgainst}</td>
                              <td style={{ 
                                padding: '0.75rem 1rem', 
                                textAlign: 'center', 
                                fontWeight: '500',
                                color: goalDiff > 0 ? theme.success : goalDiff < 0 ? theme.danger : theme.textMuted
                              }}>
                                {goalDiff > 0 ? '+' : ''}{goalDiff}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Event Player Leaderboard */}
                <div style={{ 
                  background: theme.navy800, 
                  borderRadius: '16px', 
                  boxShadow: '0 6px 18px rgba(0,0,0,0.32)', 
                  padding: '1.5rem',
                  border: `2px solid ${theme.navy600}`
                }}>
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: '1rem',
                    color: theme.textPrimary,
                    fontFamily: 'Montserrat, system-ui, sans-serif'
                  }}>
                    👤 Classement des Joueurs - {new Date(events.find(e => e.id === currentEvent)?.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: theme.navy700 }}>
                        <tr>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: theme.textPrimary, fontWeight: '600' }}>Rang</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: theme.textPrimary, fontWeight: '600' }}>Joueur</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>Points</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>V</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>N</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textPrimary, fontWeight: '600' }}>D</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getLeaderboard(currentEvent).map((player, index, array) => {
                          const rank = getRankWithTies(array, index, 'eventPoints');
                          return (
                            <tr key={player.id} style={{ 
                              background: rank <= 3 ? theme.navy700 : 'transparent',
                              borderBottom: `1px solid ${theme.navy600}`
                            }}>
                              <td style={{ 
                            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', 
                            fontWeight: 'bold', 
                            color: theme.textPrimary,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}>
                                {rank === 1 && index === 0 && '🥇'}
                                {rank === 1 && index > 0 && array[index - 1].eventPoints !== player.eventPoints && '🥇'}
                                {rank === 2 && '🥈'}
                                {rank === 3 && '🥉'}
                                {rank > 3 && rank}
                                {rank === 1 && ''}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: '500', color: theme.textPrimary }}>{player.name}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 'bold', color: theme.gold400 }}>{player.eventPoints}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textSecondary }}>{player.eventWins}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textSecondary }}>{player.eventDraws}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: theme.textSecondary }}>{player.eventLosses}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FootballTournament;
