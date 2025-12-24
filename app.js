/* =========================================
   AE Coin (AEC) — SunSwap Buy
   TRONLINK ONLY (FINAL CLEAN)
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ========= CONFIG ========= */
  const AEC_CONTRACT  = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";
  const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const TREASURY     = "TTZyeQR1fBpmhn2Y4Pcrj2Nw3WpioRtScU";

  const DECIMALS = 6;
  const RATE_USDT = 0.272;

  let tronWeb;
  let userAddress = null;

  /* ========= WAIT TRONLINK ========= */
  function waitForTronLink() {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const timer = setInterval(() => {
        if (window.tronWeb && window.tronWeb.isTronLink) {
          clearInterval(timer);
          resolve(window.tronWeb);
        }
        if (++tries > 20) {
          clearInterval(timer);
          reject("TronLink not found");
        }
      }, 500);
    });
  }

  /* ========= CONNECT WALLET ========= */
  async function connectWallet() {
    try {
      tronWeb = await waitForTronLink();

      // minta izin user
      await tronWeb.request({ method: "tron_requestAccounts" });

      userAddress = tronWeb.defaultAddress.base58;
      if (!userAddress) throw "No address";

      document.getElementById("walletStatus").innerText = "Connected";
      document.getElementById("walletAddress").innerText = userAddress;

      loadAECBalance();

    } catch (err) {
      console.error(err);
      alert("Please install & unlock TronLink Wallet");
    }
  }

  /* ========= LOAD AEC BALANCE ========= */
  async function loadAECBalance() {
    try {
      if (!tronWeb || !userAddress) return;

      const contract = await tronWeb.contract().at(AEC_CONTRACT);
      const bal = await contract.balanceOf(userAddress).call();

      document.getElementById("aecBalance").innerText =
        (Number(bal) / 10 ** DECIMALS).toLocaleString() + " AEC";

    } catch {
      document.getElementById("aecBalance").innerText = "-";
    }
  }

  /* ========= PRICE UI ========= */
  document.getElementById("buyAmount").addEventListener("input", e => {
    const aec = Number(e.target.value || 0);
    document.getElementById("usdtAmount").innerText =
      (aec * RATE_USDT).toFixed(6);
  });

  /* ========= BUY (MANUAL SALE) ========= */
  document.getElementById("buyBtn").onclick = async () => {
    if (!tronWeb || !userAddress) {
      alert("Connect TronLink first");
      return;
    }

    const aec = Number(document.getElementById("buyAmount").value);
    if (aec <= 0) return alert("Invalid amount");

    try {
      const usdtAmount = Math.round(aec * RATE_USDT * 1e6);

      const usdt = await tronWeb.contract().at(USDT_CONTRACT);

      document.getElementById("buyStatus").innerText =
        "Confirm USDT transfer in TronLink...";

      await usdt.transfer(TREASURY, usdtAmount).send();

      document.getElementById("buyStatus").innerText =
        "✅ USDT sent successfully";

      loadAECBalance();

    } catch (err) {
      console.error(err);
      document.getElementById("buyStatus").innerText =
        "❌ Transaction cancelled or failed";
    }
  };

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


/* ========= SUNSWAP SWAP BOX ========= */

const SUNSWAP_ROUTER = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax";
const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const AEC  = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";

async function getAmountsOut(amountIn, path) {
  const router = await tronWeb.contract().at(SUNSWAP_ROUTER);
  return await router.getAmountsOut(amountIn, path).call();
}

document.getElementById("swapFromAmount").addEventListener("input", async () => {
  if (!tronWeb || !userAddress) return;

  const amt = Number(document.getElementById("swapFromAmount").value);
  if (amt <= 0) return;

  const from = document.getElementById("swapFromToken").value;
  const to   = document.getElementById("swapToToken").value;

  const path =
    from === "USDT" ? [USDT, AEC] : [AEC, USDT];

  const decimals = from === "USDT" ? 6 : 6;
  const amountIn = Math.floor(amt * 10 ** decimals);

  try {
    const amounts = await getAmountsOut(amountIn, path);
    const out = amounts[1] / 10 ** decimals;
    document.getElementById("swapToAmount").value =
      out.toFixed(6);
  } catch {
    document.getElementById("swapToAmount").value = "-";
  }
});

/* ========= EXECUTE SWAP ========= */
document.getElementById("swapBtn").onclick = async () => {
  if (!tronWeb || !userAddress) {
    alert("Connect TronLink first");
    return;
  }

  const amt = Number(document.getElementById("swapFromAmount").value);
  if (amt <= 0) return;

  const from = document.getElementById("swapFromToken").value;
  const path =
    from === "USDT" ? [USDT, AEC] : [AEC, USDT];

  const tokenIn = await tronWeb.contract().at(path[0]);
  const router  = await tronWeb.contract().at(SUNSWAP_ROUTER);

  const amountIn = Math.floor(amt * 1e6);

  try {
    document.getElementById("swapStatus").innerText = "Approving...";

    await tokenIn.approve(SUNSWAP_ROUTER, amountIn).send();

    document.getElementById("swapStatus").innerText = "Swapping...";

    await router.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      userAddress,
      Math.floor(Date.now() / 1000) + 600
    ).send();

    document.getElementById("swapStatus").innerText = "✅ Swap successful";

  } catch (err) {
    console.error(err);
    document.getElementById("swapStatus").innerText =
      "❌ Swap failed or cancelled";
  }
};





