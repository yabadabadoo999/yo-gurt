const axios = require('axios');
const fs = require('fs');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const TIKTOK_USERS = process.env.TIKTOK_USERS ? process.env.TIKTOK_USERS.split(',') : [];

async function checkLive() {
  if (TIKTOK_USERS.length === 0) return console.log("Daftar user kosong!");

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
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/110.0.0.0' },
        timeout: 10000
      });
      
      const html = response.data;
      const isLiveNow = html.includes('"status":2') || html.includes('"room_status":2');

      if (isLiveNow) {
        if (!lastStatus[user]) { // Jika sebelumnya tidak live
          await sendTelegram(`🔴 ${user} SEDANG LIVE!\nhttps://www.tiktok.com/@${user}/live`);
        }
        currentStatus[user] = true;
      } else {
        currentStatus[user] = false;
      }
    } catch (e) {
      console.log(`Gagal cek ${user}`);
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
  } catch (e) { console.log("Gagal kirim tele"); }
}

checkLive();
