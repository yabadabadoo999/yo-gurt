const axios = require('axios');
const fs = require('fs');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const RAW_USERS = process.env.TIKTOK_USERS;

async function debugCheck() {
  console.log("=== DEBUG START ===");
  
  if (!BOT_TOKEN) console.log("❌ BOT_TOKEN tidak terbaca!");
  if (!CHAT_ID) console.log("❌ CHAT_ID tidak terbaca!");
  
  if (!RAW_USERS) {
    console.log("❌ TIKTOK_USERS tidak terbaca! Pastikan sudah input di Secrets.");
    return;
  }

  const TIKTOK_USERS = RAW_USERS.split(',');
  console.log(`✅ Berhasil memuat ${TIKTOK_USERS.length} user.`);

  // TEST TELEGRAM LANGSUNG
  console.log("Testing Telegram...");
  await sendTelegram("Test Bot: Mencoba koneksi...");

  for (const username of TIKTOK_USERS) {
    const user = username.trim();
    const url = `https://www.tiktok.com/@${user}/live`;
    
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
      });
      const isLive = response.data.includes('"status":2') || response.data.includes('"room_status":2');
      console.log(`- ${user}: ${isLive ? "🔴 LIVE" : "⚪ Offline"}`);
    } catch (e) {
      console.log(`- ${user}: ❌ Error (${e.message})`);
    }
  }
  console.log("=== DEBUG END ===");
}

async function sendTelegram(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: text
    });
    console.log("✅ Pesan Telegram terkirim!");
  } catch (e) {
    console.log("❌ Gagal kirim Telegram: " + e.message);
  }
}

debugCheck();
