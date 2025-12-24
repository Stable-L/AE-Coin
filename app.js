/* =========================================
   AE Coin (AEC) — SunSwap Buy
   TRONLINK ONLY (FINAL CLEAN)
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ========= CONFIG ========= */
  const AEC_CONTRACT   = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";
  const USDT_CONTRACT  = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const SUNSWAP_ROUTER = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax";

  const DECIMALS = 6;
  const UI_RATE_USDT = 0.272; // hanya tampilan

  let tronWeb;
  let userAddress;

  /* ========= CONNECT TRONLINK ========= */
  async function connectWallet() {
    if (!window.tronWeb || !window.tronWeb.isTronLink) {
      alert("Please install and open with TronLink Wallet");
      return;
    }

    try {
      await window.tronWeb.request({
        method: "tron_requestAccounts"
      });

      tronWeb = window.tronWeb;
      userAddress = tronWeb.defaultAddress.base58;

      document.getElementById("walletStatus").innerText = "Connected (TronLink)";
      document.getElementById("walletAddress").innerText = userAddress;

      loadAECBalance();

    } catch (err) {
      alert("Connection rejected in TronLink");
    }
  }

  /* ========= LOAD AEC BALANCE ========= */
  async function loadAECBalance() {
    try {
      const contract = await tronWeb.contract().at(AEC_CONTRACT);
      const bal = await contract.balanceOf(userAddress).call();

      document.getElementById("aecBalance").innerText =
        (Number(bal) / 10 ** DECIMALS).toLocaleString() + " AEC";

    } catch {
      document.getElementById("aecBalance").innerText = "-";
    }
  }

  /* ========= UI PRICE ========= */
  document.getElementById("buyAmount").addEventListener("input", e => {
    const aec = Number(e.target.value || 0);
    document.getElementById("usdtAmount").innerText =
      (aec * UI_RATE_USDT).toFixed(6);
  });

  /* ========= BUY VIA SUNSWAP ========= */
  document.getElementById("buyBtn").onclick = async () => {
    if (!tronWeb || !userAddress) {
      alert("Connect TronLink first");
      return;
    }

    const aec = Number(document.getElementById("buyAmount").value);
    if (aec <= 0) return;

    try {
      const usdtAmount = aec * UI_RATE_USDT;
      const amountIn = tronWeb.toSun(usdtAmount);

      const usdt   = await tronWeb.contract().at(USDT_CONTRACT);
      const router = await tronWeb.contract().at(SUNSWAP_ROUTER);

      document.getElementById("buyStatus").innerText = "Approving USDT...";
      await usdt.approve(SUNSWAP_ROUTER, amountIn).send();

      document.getElementById("buyStatus").innerText = "Swapping via SunSwap...";
      await router.swapExactTokensForTokens(
        amountIn,
        0,
        [USDT_CONTRACT, AEC_CONTRACT],
        userAddress,
        Math.floor(Date.now() / 1000) + 600
      ).send();

      document.getElementById("buyStatus").innerText = "✅ Swap successful";
      loadAECBalance();

    } catch (err) {
      console.error(err);
      document.getElementById("buyStatus").innerText = "❌ Transaction failed";
    }
  };

  /* ========= AUTO DETECT IF ALREADY CONNECTED ========= */
  setTimeout(() => {
    if (window.tronWeb && window.tronWeb.isTronLink && window.tronWeb.ready) {
      tronWeb = window.tronWeb;
      userAddress = tronWeb.defaultAddress.base58;
      document.getElementById("walletStatus").innerText = "Connected (TronLink)";
      document.getElementById("walletAddress").innerText = userAddress;
      loadAECBalance();
    }
  }, 500);

  /* ========= INIT ========= */
  document.getElementById("connectBtn").onclick = connectWallet;
  document.getElementById("year").innerText = new Date().getFullYear();
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





