import db from '../db.js'; // db.jsからインポート

export const handleMealSubmission = (data, callback) => {
  const { mealTime, stapleFood, mainDish, sideDish, drink } = data;
  const userId = 1; // ここで適切なユーザーIDを取得する方法を実装してください
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
      console.log(menuId);
    
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
};
