const store = require("../utils/store");

function setupSocketHandlers(io) {
  io.on("connection", socket => {
    socket.on("quiz:join", ({ code, playerName, userId }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room) return socket.emit("error", "Room not found");
      if (room.status === "ended") return socket.emit("error", "Game already ended");

      const player = { id: socket.id, userId, name: playerName, score: 0, answers: [] };
      room.players = room.players.filter(p => p.id !== socket.id);
      room.players.push(player);
      room.scores[socket.id] = 0;

      socket.join(code.toUpperCase());
      socket.data.roomCode = code.toUpperCase();
      socket.data.userId   = userId;

      io.to(code.toUpperCase()).emit("quiz:playerJoined", { players: room.players, player });
      socket.emit("quiz:joined", { room: sanitize(room), playerId: socket.id });
    });

    socket.on("quiz:start", ({ code }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room) return;
      room.status = "playing";
      room.currentQuestion = 0;
      io.to(code.toUpperCase()).emit("quiz:started", { totalQuestions: room.questions.length });
      setTimeout(() => sendQuestion(io, code.toUpperCase()), 1000);
    });

    socket.on("quiz:answer", ({ code, questionIndex, answerIndex, timeLeft }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room || room.status !== "playing") return;
      if (room.currentQuestion !== questionIndex) return;
      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.answers[questionIndex] !== undefined) return;

      const q = room.questions[questionIndex];
      const correct = answerIndex === q.correct;
      const points  = correct ? Math.max(500, Math.round(1000 * (timeLeft / (room.timePerQuestion || 20)))) : 0;
      player.answers[questionIndex] = { answerIndex, correct, points };
      player.score += points;
      room.scores[socket.id] = player.score;

      socket.emit("quiz:answerResult", { correct, points, correctAnswer: q.correct, explanation: q.explanation, totalScore: player.score });

      const answered = room.players.filter(p => p.answers[questionIndex] !== undefined).length;
      if (answered === room.players.length) {
        clearTimeout(room._timer);
        sendLeaderboard(io, room, code.toUpperCase());
      }
    });

    socket.on("quiz:chat", ({ code, message }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room) return;
      const player = room.players.find(p => p.id === socket.id);
      const msg = { id: Date.now(), playerId: socket.id, playerName: player?.name || "Guest", message: message.slice(0, 200), timestamp: new Date().toISOString() };
      room.chat.push(msg);
      io.to(code.toUpperCase()).emit("quiz:chat", msg);
    });

    socket.on("disconnect", () => {
      const code = socket.data?.roomCode;
      if (!code) return;
      const room = store.quizRooms.get(code);
      if (!room) return;
      room.players = room.players.filter(p => p.id !== socket.id);
      io.to(code).emit("quiz:playerLeft", { playerId: socket.id, players: room.players });
    });
  });

  function sendQuestion(io, code) {
    const room = store.quizRooms.get(code);
    if (!room) return;
    if (room.currentQuestion >= room.questions.length) { endGame(io, room, code); return; }
    const q = room.questions[room.currentQuestion];
    io.to(code).emit("quiz:question", {
      question: { question: q.question, options: q.options, index: room.currentQuestion, total: room.questions.length },
      timeLimit: room.timePerQuestion || 20,
    });
    room._timer = setTimeout(() => sendLeaderboard(io, room, code), (room.timePerQuestion || 20) * 1000 + 500);
  }

  function sendLeaderboard(io, room, code) {
    const lb = room.players.map(p => ({ id: p.id, name: p.name, score: p.score })).sort((a, b) => b.score - a.score);
    const q  = room.questions[room.currentQuestion];
    io.to(code).emit("quiz:leaderboard", { leaderboard: lb, correctAnswer: q.correct, explanation: q.explanation, questionIndex: room.currentQuestion });
    room.currentQuestion++;
    if (room.currentQuestion >= room.questions.length) setTimeout(() => endGame(io, room, code), 5000);
    else setTimeout(() => sendQuestion(io, code), 5000);
  }

  function endGame(io, room, code) {
    room.status = "ended";
    const lb = room.players.map(p => ({ id: p.id, name: p.name, score: p.score })).sort((a, b) => b.score - a.score);
    io.to(code).emit("quiz:ended", { leaderboard: lb });
  }

  function sanitize(room) {
    const { questions, ...safe } = room;
    return { ...safe, totalQuestions: questions.length };
  }
}

module.exports = { setupSocketHandlers };
