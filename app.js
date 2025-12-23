/* =========================================
   AE Coin (AEC) — Web3 Wallet & Buy USDT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* -------- CONFIG -------- */
  const CONTRACT = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL"; // AEC token
  const DECIMALS = 6;

  const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // USDT TRC20
  const TREASURY = "TTZyeQR1fBpmhn2Y4Pcrj2Nw3WpioRtScU";       // Wallet Anda
  const RATE_USDT = 0.272; // 1 AEC = 1 AED ≈ 0.272 USDT

  let tronWeb, user;

  /* -------- WAIT TRONLINK INJECT -------- */
  async function waitForTronWeb() {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (window.tronWeb && window.tronWeb.ready) {
          clearInterval(interval);
          resolve(window.tronWeb);
        }
      }, 300);
    });
  }

  /* -------- CONNECT WALLET -------- */
  async function connectWallet() {
  try {
    tronWeb = await waitForTronWeb();

    // 🔐 MINTA IZIN WALLET (PENTING!)
    await tronWeb.request({ method: "tron_requestAccounts" });

    // 📌 AMBIL ADDRESS SETELAH DISETUJUI
    user = tronWeb.defaultAddress.base58;

    document.getElementById("walletStatus").innerText = "Connected";
    document.getElementById("walletAddress").innerText = user;

    // 🔄 LOAD SALDO AEC
    loadBalance();

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

  /* -------- LOAD AEC BALANCE (FIXED) -------- */
async function loadBalance() {
  const balanceEl = document.getElementById("aecBalance");
  if (!balanceEl) return;

  try {
    // Pastikan TronLink siap
    if (!window.tronWeb || !tronWeb.ready) {
      balanceEl.innerText = "Connect wallet";
      return;
    }

    const address = tronWeb.defaultAddress.base58;
    if (!address) {
      balanceEl.innerText = "Connect wallet";
      return;
    }

    const contract = await tronWeb.contract().at(CONTRACT);

    // balanceOf biasanya string / BigNumber
    const bal = await contract.balanceOf(address).call();
    const amount = Number(bal) / Math.pow(10, DECIMALS);

    balanceEl.innerText = amount.toLocaleString("en-US") + " AEC";

  } catch (err) {
    console.error("Load balance error:", err);
    balanceEl.innerText = "Error";
  }
}

  /* -------- SEND AEC TOKEN -------- */
  async function sendToken() {
    const to = document.getElementById("sendTo").value.trim();
    const amt = Number(document.getElementById("sendAmount").value);

    if (!to || amt <= 0) {
      alert("Invalid address or amount");
      return;
    }

    try {
      const contract = await tronWeb.contract().at(CONTRACT);
      await contract.transfer(to, amt * (10 ** DECIMALS)).send();

      document.getElementById("txStatus").innerText =
        "✅ Transaction sent!";
      loadBalance();
    } catch (err) {
      console.error(err);
      document.getElementById("txStatus").innerText =
        "❌ Transaction failed";
    }
  }

  /* -------- BUY AE COIN WITH USDT -------- */
  document.getElementById("buyAmount").addEventListener("input", () => {
    const aec = Number(document.getElementById("buyAmount").value || 0);
    document.getElementById("usdtAmount").innerText =
      (aec * RATE_USDT).toFixed(6);
  });

  document.getElementById("buyBtn").onclick = async () => {
    if (!tronWeb || !user) {
      alert("Connect wallet first");
      return;
    }

    const aec = Number(document.getElementById("buyAmount").value);
    if (aec <= 0) return alert("Invalid amount");

    const totalUSDT = aec * RATE_USDT;

    try {
      document.getElementById("buyStatus").innerText = "Waiting for confirmation...";

      const usdt = await tronWeb.contract().at(USDT_CONTRACT);

      // TRC20 USDT = 6 decimals
      await usdt.transfer(TREASURY, Math.round(totalUSDT * 1e6)).send();

      document.getElementById("buyStatus").innerText =
        "✅ Purchase successful! USDT sent to treasury.";

      // Optional: Load balance AEC
      loadBalance();

    } catch (err) {
      console.error(err);
      document.getElementById("buyStatus").innerText =
        "❌ Transaction failed or cancelled.";
    }
  };

  /* -------- INIT -------- */
  document.getElementById("connectBtn").onclick = connectWallet;
  document.getElementById("sendBtn").onclick = sendToken;
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

/* -------- CRYPTO NEWS -------- */
const CRYPTO_PANIC_KEY = "4ac30ccdd5191b14583c96f41499d04698bb57e8";

async function loadCryptoNews() {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  try {
    const res = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${CRYPTO_PANIC_KEY}&public=true`
    );

    const data = await res.json();
    container.innerHTML = "";

    data.results.slice(0, 6).forEach(item => {
      const img =
        item.thumbnail ||
        "https://cryptopanic.com/static/images/news_placeholder.png";

      container.innerHTML += `
        <div class="card">
          <img src="${img}" style="width:100%;border-radius:12px">
          <h4 style="margin-top:10px">${item.title}</h4>
          <a href="${item.url}" target="_blank" class="btn btn-outline" style="margin-top:8px;display:inline-block">
            Read More
          </a>
        </div>
      `;
    });

  } catch (err) {
    console.error("Crypto news error:", err);
    container.innerHTML = "Failed to load crypto news";
  }
}

window.addEventListener("load", () => {
  loadCryptoNews();
});

const music = document.getElementById("bgMusic");

function toggleMusic() {
  if (music.paused) {
    music.volume = 0.25;
    music.play();
  } else {
    music.pause();
  }
}

