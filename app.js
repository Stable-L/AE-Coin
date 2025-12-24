/* =========================================
   AE Coin (AEC) — Web3 Wallet & Buy USDT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* -------- CONFIG -------- */
  const CONTRACT = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";
  const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const TREASURY = "TTZyeQR1fBpmhn2Y4Pcrj2Nw3WpioRtScU";
  const DECIMALS = 6;
  const RATE_USDT = 0.272;

  let tronWeb;
  let user;

  /* -------- WAIT TRONLINK -------- */
  async function waitForTronWeb() {
    return new Promise((resolve, reject) => {
      let i = 0;
      const timer = setInterval(() => {
        if (window.tronWeb && window.tronWeb.ready) {
          clearInterval(timer);
          resolve(window.tronWeb);
        }
        if (++i > 20) {
          clearInterval(timer);
          reject();
        }
      }, 300);
    });
  }

  /* -------- CONNECT WALLET -------- */
  async function connectWallet() {
    try {
      tronWeb = await waitForTronWeb();
      await tronWeb.request({ method: "tron_requestAccounts" });

      user = tronWeb.defaultAddress.base58;

      document.getElementById("walletStatus").innerText = "Connected";
      document.getElementById("walletAddress").innerText = user;

      loadBalance();
    } catch {
      alert("Wallet connection failed");
    }
  }

  /* -------- LOAD AEC BALANCE -------- */
  async function loadBalance() {
    try {
      const contract = await tronWeb.contract().at(CONTRACT);
      const bal = await contract.balanceOf(user).call();
      const amount = Number(bal) / 10 ** DECIMALS;

      document.getElementById("aecBalance").innerText =
        amount.toLocaleString() + " AEC";
    } catch {
      document.getElementById("aecBalance").innerText = "-";
    }
  }

  /* -------- SEND AEC -------- */
  async function sendToken() {
    const to = document.getElementById("sendTo").value.trim();
    const amt = Number(document.getElementById("sendAmount").value);

    if (!to || amt <= 0) return alert("Invalid input");

    try {
      const contract = await tronWeb.contract().at(CONTRACT);
      await contract.transfer(to, amt * 10 ** DECIMALS).send();

      document.getElementById("txStatus").innerText = "✅ Sent";
      loadBalance();
    } catch {
      document.getElementById("txStatus").innerText = "❌ Failed";
    }
  }

  /* -------- BUY (UI + TRANSFER USDT) -------- */
  document.getElementById("buyAmount").addEventListener("input", () => {
    const aec = Number(buyAmount.value || 0);
    usdtAmount.innerText = (aec * RATE_USDT).toFixed(6);
  });

  document.getElementById("buyBtn").onclick = async () => {
    if (!tronWeb || !user) return alert("Connect wallet first");

    const aec = Number(buyAmount.value);
    if (aec <= 0) return;

    try {
      const usdt = await tronWeb.contract().at(USDT_CONTRACT);
      const total = Math.round(aec * RATE_USDT * 1e6);

      document.getElementById("buyStatus").innerText = "Processing...";
      await usdt.transfer(TREASURY, total).send();

      document.getElementById("buyStatus").innerText = "✅ USDT sent";
    } catch {
      document.getElementById("buyStatus").innerText = "❌ Failed";
    }
  };

  /* -------- INIT -------- */
  connectBtn.onclick = connectWallet;
  sendBtn.onclick = sendToken;
  year.innerText = new Date().getFullYear();
});


/* =========================================
   COINGECKO TOP 100 ALTCOIN TICKER
   ========================================= */

async function loadTopCoinsTicker() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
    );

    const coins = await res.json();
    const ticker = document.getElementById("tickerContent");

    ticker.innerHTML = ""; // kosongkan dulu

    coins.forEach(c => {
      const item = document.createElement("div");
      item.className = "ticker-item";
      item.innerHTML = `
        <img src="${c.image}" alt="${c.symbol}">
        ${c.symbol.toUpperCase()}
        <span>$${c.current_price.toLocaleString()}</span>
      `;
      ticker.appendChild(item);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("tickerContent").innerText =
      "Failed to load market data";
  }
}

/* LOAD SAAT PAGE DIBUKA */
loadTopCoinsTicker();

/* REFRESH SETIAP 2 MENIT (AMAN API) */
setInterval(loadTopCoinsTicker, 120000);


/* ===========================
   BACKGROUND MUSIC (FIXED)
=========================== */

document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicBtn");

  if (!music || !btn) {
    console.warn("Music element not found");
    return;
  }

  // setting awal
  music.volume = 0.25;
  music.muted = true;

  // 🔥 PAKSA PLAY (muted = boleh oleh browser)
  const tryPlay = () => {
    music.play().then(() => {
      console.log("Music autoplay success");
    }).catch(err => {
      console.warn("Autoplay blocked, waiting user interaction");
    });
  };

  tryPlay();

  // toggle mute / unmute
  btn.innerText = "🔇";
  btn.addEventListener("click", () => {
    music.muted = !music.muted;
    btn.innerText = music.muted ? "🔇" : "🔊";

    // pastikan play saat unmute
    if (!music.muted && music.paused) {
      music.play().catch(() => {});
    }
  });

  // fallback keras: klik apa saja di body
  document.body.addEventListener(
    "click",
    () => {
      if (music.paused) {
        music.play().catch(() => {});
      }
    },
    { once: true }
  );
});
document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bgMusic");
  const gate = document.getElementById("soundGate");
  const btn = document.getElementById("musicBtn");

  if (!music) return;

  music.volume = 0.25;
  music.muted = true;

  // play muted (izin browser)
  music.play().catch(() => {});

  // enable sound setelah klik
  if (gate) {
    gate.addEventListener("click", () => {
      music.muted = false;
      music.play().catch(() => {});
      gate.remove();
      if (btn) btn.innerText = "🔊";
    });
  }

  if (btn) {
    btn.addEventListener("click", () => {
      music.muted = !music.muted;
      btn.innerText = music.muted ? "🔇" : "🔊";
    });
  }
});

async function loadCryptoNews() {
  try {
    const res = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/"
    );
    const data = await res.json();

    const container = document.getElementById("newsContainer");
    container.innerHTML = "";

    data.items.slice(0, 6).forEach(item => {
      container.innerHTML += `
        <div class="news-card">
          <h4>${item.title}</h4>
          <a href="${item.link}" target="_blank">Read more →</a>
        </div>
      `;
    });

  } catch (err) {
    console.error("News error:", err);
    document.getElementById("newsContainer").innerText =
      "Failed to load crypto news";
  }
}

/* LOAD SAAT PAGE DIBUKA */
loadCryptoNews();

/* AUTO REFRESH SETIAP 5 MENIT */
setInterval(loadCryptoNews, 300000);



