const axios = require('axios');
const fs = require('fs');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const RAW_USERS = process.env.TIKTOK_USERS;

async function checkLive() {
  if (!RAW_USERS) return console.log("❌ TIKTOK_USERS kosong!");
  const TIKTOK_USERS = RAW_USERS.split(',');

  let lastStatus = {};
  if (fs.existsSync('status.json')) {
    lastStatus = JSON.parse(fs.readFileSync('status.json', 'utf8'));
  }

  let currentStatus = { ...lastStatus };

  for (const username of TIKTOK_USERS) {
    const user = username.trim();
    const url = `https://www.tiktok.com/@${user}/live`;
    
    try {
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/'
        },
        timeout: 15000
      });
      
      const html = response.data;
      // TikTok kadang pakai "status":2 atau "room_status":2 atau "live_status":2
      const isLiveNow = html.includes('"status":2') || html.includes('"room_status":2') || html.includes('"live_status":2');

      if (isLiveNow) {
        if (!lastStatus[user]) {
          await sendTelegram(`🔴 ${user} SEDANG LIVE!\nhttps://www.tiktok.com/@${user}/live`);
        }
        currentStatus[user] = true;
      } else {
        currentStatus[user] = false;
      }
      console.log(`${user}: ${isLiveNow ? "🔴 LIVE" : "⚪ Offline"}`);
    } catch (e) {
      console.log(`${user}: ❌ Error (${e.message})`);
    }
  }
  fs.writeFileSync('status.json', JSON.stringify(currentStatus, null, 2));
}

async function sendTelegram(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: text
    });
  } catch (e) {}
}

checkLive();
