import { handlePromptEvent } from './gpt.js';
import { handleLoginEvent, handleUserRegistration } from './auth.js'
import { handleMealSubmission, handlePastMenu } from './meals.js';
import db from '../db.js';

export default (io, socket) => {
  // 入室メッセージをクライアントに送信する
  socket.on("enterEvent", (data) => {
    socket.broadcast.emit("enterEvent", data)
  })

  // 退室メッセージをクライアントに送信する
  socket.on("exitEvent", (data) => {
    socket.broadcast.emit("exitEvent", data)
  })

  // 投稿メッセージを送信する
  socket.on("publishEvent", (data) => {
    io.sockets.emit("publishEvent", data)
  })

  // GPTへのプロンプトを受信する  
  socket.on("promptEvent", handlePromptEvent);

  // 食事内容をDBに保存する
  socket.on("mealsEvent", handleMealSubmission);

  // DBから過去の食事内容を取得する
  socket.on("pastMenuEvent", (userName, callback) => {
    handlePastMenu(userName, callback);
  });

  // ユーザー名とパスワードがDBに含まれているかを比較する
  socket.on("loginEvent", (data, callback) => {
    handleLoginEvent(data, callback);
  });

  // 新規登録されたユーザー名とパスワードをDBにinsertする
  socket.on("userRegistration", (data, callback) => {
    handleUserRegistration(data, callback);
  });

  // 体重を登録する
  socket.on("WeightRegisterEvent", (data) => {
    const { username, weight, date } = data;

    // First, retrieve the userId based on the username
    db.get('SELECT id FROM users WHERE name = ?', [username], (err, row) => {
      if (err) {
        console.error('Error fetching userId:', err.message);
        socket.emit("weightRegisterFailure", { message: 'Error fetching userId' });
      } else if (row) {
        const userId = row.id;

        // Insert the weight entry into the weights table
        db.run('INSERT INTO weights (weights, user_id, date) VALUES (?, ?, ?)', [weight, userId, date], function(err) {
          if (err) {
            console.error('Error inserting weight:', err.message);
            socket.emit("weightRegisterFailure", { message: 'Error inserting weight' });
          } else {
            console.log('Weight registered successfully');
            socket.emit("weightRegisterSuccess", { message: 'Weight registered successfully' });
          }
        });
      } else {
        // If the username does not exist in the database
        socket.emit("weightRegisterFailure", { message: 'User not found' });
      }
    });
  });

  // 体重推移グラフ
  socket.on("getWeightHistory", (username, callback) => {
    // First, retrieve the userId based on the username
    db.get('SELECT id FROM users WHERE name = ?', [username], (err, row) => {
      if (err) {
        console.error('Error fetching userId:', err.message);
        callback({ success: false, message: 'Error fetching userId' });
      } else if (row) {
        const userId = row.id;

        // Fetch the user's weight history from the weights table, ordered by date
        db.all('SELECT weights, date FROM weights WHERE user_id = ? ORDER BY date', [userId], (err, rows) => {
          if (err) {
            console.error('Error fetching weight history:', err.message);
            callback({ success: false, message: 'Error fetching weight history' });
          } else {
            console.log('Fetched weight data:', rows);  // Log fetched data
            callback({ success: true, data: rows });
          }
        });
      } else {
        callback({ success: false, message: 'User not found' });
      }
    });
  });

  // ランキングを取得する
    socket.on("getLatestWeightsForRanking", (callback) => {
      // Fetch the latest two weights for each user
      const query = `
        SELECT users.name as username, weights.weights as weight, weights.date as weight_date
        FROM users
        INNER JOIN weights ON users.id = weights.user_id
        ORDER BY users.id, weights.date DESC
      `;
    
      db.all(query, (err, rows) => {
        if (err) {
          console.error('Error fetching ranking data:', err.message);
          callback({ success: false, message: 'Error fetching ranking data' });
        } else {
          const userWeights = {};
    
          // Group weights by username and store the latest two weights for each user
          rows.forEach(row => {
            const { username, weight, weight_date } = row;
            if (!userWeights[username]) {
              userWeights[username] = [];
            }
            if (userWeights[username].length < 2) {
              userWeights[username].push({ weight, date: weight_date });
            }
          });
    
          // Calculate the weight difference and rank users
          const ranking = Object.keys(userWeights).map(username => {
            const weights = userWeights[username];
            
            if (weights.length === 2) {
              // Calculate the difference between the latest and the previous weight
              const latestWeight = weights[0].weight;
              const previousWeight = weights[1].weight;
              const difference = latestWeight - previousWeight;
              return { username, weightDifference: difference };
            } else {
              // If there is only one weight, mark as "No data"
              return { username, weightDifference: "No data" };
            }
          });
    
          // Sort the ranking:
          // - Sort by weight difference in ascending order (reverse ranking),
          // - Place "No data" always at the end.
          const sortedRanking = ranking.sort((a, b) => {
            if (a.weightDifference === "No data") return 1;  // Move "No data" to the bottom
            if (b.weightDifference === "No data") return -1;
            return a.weightDifference - b.weightDifference;  // Sort by weight difference (ascending)
          });
    
          console.log('Fetched ranking data:', sortedRanking);
          callback({ success: true, data: sortedRanking });
        }
      });
    });
    
  
}
