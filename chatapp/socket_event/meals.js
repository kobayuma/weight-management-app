import db from '../db.js'; // db.jsからインポート

export const handleMealSubmission = (data, callback) => {
  const { userName, mealTime, stapleFood, mainDish, sideDish, drink } = data;
  // ユーザーIDを取得するクエリ
  db.get('SELECT id FROM users WHERE name = ?', [userName], (err, row) => {
    if (err) {
      console.error('Error fetching user ID:', err.message);
      callback({ success: false, message: 'ユーザーIDの取得に失敗しました' });
      return;
    }
    
    if (!row) {
      console.error('User not found');
      callback({ success: false, message: 'ユーザーが見つかりません' });
      return;
    }
    const userId = row.id;
    
    const date = new Date().toISOString().split('T')[0];
    const mealType = mealTime === '朝食' ? 1 : mealTime === '昼食' ? 2 : 3;

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      db.run('INSERT INTO menu(date, user_id, type) VALUES (?, ?, ?)', [date, userId, mealType], function(err) {
        if (err) {
          console.error('Error inserting menu:', err.message);
          db.run('ROLLBACK');
          callback({ success: false, message: '食事の保存に失敗しました' });
          return;
        }
        const menuId = this.lastID;
      
        const insertMealContent = (type, content, cb) => {
          db.run('INSERT INTO meal_contents(menu_id, type, content) VALUES (?, ?, ?)', [menuId, type, content], cb);
        };

        insertMealContent(1, stapleFood, (err) => {
          if (err) {
            console.error('Error inserting staple food:', err.message);
            db.run('ROLLBACK');
            callback({ success: false, message: '主食の保存に失敗しました' });
            return;
          }

          insertMealContent(2, mainDish, (err) => {
            if (err) {
              console.error('Error inserting main dish:', err.message);
              db.run('ROLLBACK');
              callback({ success: false, message: '主菜の保存に失敗しました' });
              return;
            }

            insertMealContent(3, sideDish, (err) => {
              if (err) {
                console.error('Error inserting side dish:', err.message);
                db.run('ROLLBACK');
                callback({ success: false, message: '副菜の保存に失敗しました' });
                return;
              }

              insertMealContent(4, drink, (err) => {
                if (err) {
                  console.error('Error inserting drink:', err.message);
                  db.run('ROLLBACK');
                  callback({ success: false, message: '飲み物の保存に失敗しました' });
                  return;
                }

                db.run('COMMIT');
                callback({ success: true });
              });
            });
          });
        });
      });
    });
  });
};

export const handlePastMenu = (userName, callback) => {
  db.get('SELECT id FROM users WHERE name = ?', [userName], (err, row) => {
    if (err) {
      console.error('Error fetching user ID:', err.message);
      callback({ success: false, message: 'ユーザーIDの取得に失敗しました' });
      return;
    }

    if (!row) {
      console.error('User not found');
      callback({ success: false, message: 'ユーザーが見つかりません' });
      return;
    }
    const userId = row.id;

    const sql = `
      SELECT menu.date, menu.type, mc1.content AS stapleFood, mc2.content AS mainDish, mc3.content AS sideDish, mc4.content AS drink
      FROM menu
      LEFT JOIN meal_contents AS mc1 ON menu.id = mc1.menu_id AND mc1.type = 1
      LEFT JOIN meal_contents AS mc2 ON menu.id = mc2.menu_id AND mc2.type = 2
      LEFT JOIN meal_contents AS mc3 ON menu.id = mc3.menu_id AND mc3.type = 3
      LEFT JOIN meal_contents AS mc4 ON menu.id = mc4.menu_id AND mc4.type = 4
      WHERE menu.user_id = ?
      ORDER BY menu.date DESC, menu.type DESC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching past menus:', err.message);
        callback({ success: false, message: '過去のメニューの取得に失敗しました' });
        return;
      }

      const results = rows.map(row => [
        row.date,
        row.type,
        row.stapleFood,
        row.mainDish,
        row.sideDish,
        row.drink
      ]);

      callback({ success: true, data: results });
    });
  });
};
