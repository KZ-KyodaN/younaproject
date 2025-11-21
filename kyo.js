(function() {
  const prefix = "KYO1:";

  function utf8Bytes(str) {
    return new TextEncoder().encode(str);
  }

  function bytesToBase64(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin);
  }

  function base64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i);
    }
    return out;
  }

  async function deriveAesKey(password, iterations, salt, appId) {
    const appIdBytes = utf8Bytes(appId || "");
    const merge = new Uint8Array(salt.length + appIdBytes.length);
    merge.set(salt, 0);
    merge.set(appIdBytes, salt.length);

    const pepperedSaltBuf = await crypto.subtle.digest("SHA-256", merge);
    const pepperedSalt = new Uint8Array(pepperedSaltBuf);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      utf8Bytes(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: pepperedSalt,
        iterations: iterations,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return aesKey;
  }

  async function kyoEncrypt(password, plaintext, cfg) {
    if (!password) throw new Error("Пароль пустой");
    if (!cfg.appId) throw new Error("App ID (pepper) пустой");

    const iterations = cfg.iterations || 120000;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    const aesKey = await deriveAesKey(password, iterations, salt, cfg.appId);

    const magic = utf8Bytes("KYO");
    const version = 1;
    const kdfId = 1;
    const aeadId = 1;

    const header = new Uint8Array(3 + 1 + 1 + 1 + 4 + 16 + 12);
    let off = 0;
    header.set(magic, off); off += 3;
    header[off++] = version;
    header[off++] = kdfId;
    header[off++] = aeadId;
    header[off++] = (iterations >>> 24) & 0xff;
    header[off++] = (iterations >>> 16) & 0xff;
    header[off++] = (iterations >>> 8) & 0xff;
    header[off++] = iterations & 0xff;
    header.set(salt, off);  off += salt.length;
    header.set(nonce, off); off += nonce.length;

    const cipherBuf = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        additionalData: header,
        tagLength: 128
      },
      aesKey,
      utf8Bytes(plaintext)
    );

    const cipher = new Uint8Array(cipherBuf);
    const out = new Uint8Array(header.length + cipher.length);
    out.set(header, 0);
    out.set(cipher, header.length);

    return prefix + bytesToBase64(out);
  }

  async function kyoDecrypt(password, wrapped, cfg) {
    if (!wrapped.startsWith(prefix)) {
      throw new Error("Строка не начинается с KYO1:");
    }
    if (!password) throw new Error("Пароль пустой");
    if (!cfg.appId) throw new Error("App ID (pepper) пустой");

    const b64 = wrapped.slice(prefix.length);
    const all = base64ToBytes(b64);

    if (all.length < 3 + 1 + 1 + 1 + 4 + 16 + 12) {
      throw new Error("Данные повреждены или слишком короткие");
    }

    let off = 0;
    const magic = String.fromCharCode(all[0], all[1], all[2]);
    off += 3;
    if (magic !== "KYO") throw new Error("Неверный формат (magic)");

    const version = all[off++];
    const kdfId = all[off++];
    const aeadId = all[off++];

    if (version !== 1) throw new Error("Неподдерживаемая версия");
    if (kdfId !== 1 || aeadId !== 1) {
      throw new Error("Неподдерживаемый KDF/AEAD");
    }

    const iterations =
      (all[off++] << 24) |
      (all[off++] << 16) |
      (all[off++] << 8) |
      (all[off++]);

    const salt = all.slice(off, off + 16);
    off += 16;
    const nonce = all.slice(off, off + 12);
    off += 12;

    const cipher = all.slice(off);
    const header = all.slice(0, off);

    const aesKey = await deriveAesKey(password, iterations, salt, cfg.appId);

    const plainBuf = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        additionalData: header,
        tagLength: 128
      },
      aesKey,
      cipher
    );

    return new TextDecoder().decode(plainBuf);
  }

  function getConfigFromUI() {
    const appIdInput = document.getElementById("kyo-appid");
    const iterInput = document.getElementById("kyo-iter");

    let appId = (appIdInput.value || "").trim();
    let iterations = parseInt(iterInput.value, 10);

    if (!Number.isFinite(iterations) || iterations < 50000) iterations = 50000;
    if (iterations > 500000) iterations = 500000;

    iterInput.value = iterations;

    return { appId, iterations };
  }

  function randomHex(len) {
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    const hex = [];
    for (let b of bytes) {
      hex.push(b.toString(16).padStart(2, "0"));
    }
    return hex.join("");
  }

  function setupUI() {
    const btnEncrypt = document.getElementById("kyo-encrypt");
    const btnDecrypt = document.getElementById("kyo-decrypt");
    const btnRandom  = document.getElementById("kyo-random-config");

    const inputEl  = document.getElementById("kyo-input");
    const outputEl = document.getElementById("kyo-output");
    const passEl   = document.getElementById("kyo-password");
    const appIdEl  = document.getElementById("kyo-appid");
    const iterEl   = document.getElementById("kyo-iter");

    const btnAbout       = document.getElementById("kyo-about");
    const aboutBackdrop  = document.getElementById("kyo-about-backdrop");
    const aboutClose     = document.getElementById("kyo-about-close");

    btnRandom.addEventListener("click", () => {
      const randAppId = "KYO-" + randomHex(16).toUpperCase();
      const randIter = 80000 + Math.floor(Math.random() * 150000); // 80k..230k

      appIdEl.value = randAppId;
      iterEl.value = randIter;
      alert(
        "Новый config:\nApp ID:\n" + randAppId +
        "\n\nIterations: " + randIter +
        "\n\nСОХРАНИ ЭТИ ДАННЫЕИНАЧЕ НЕ РАСШИФРУЕШЬ"
      );
    });

    btnEncrypt.addEventListener("click", async () => {
      outputEl.value = "";
      const plain = inputEl.value;
      const password = passEl.value;
      const cfg = getConfigFromUI();

      try {
        const enc = await kyoEncrypt(password, plain, cfg);
        outputEl.value = enc;
      } catch (err) {
        console.error(err);
        outputEl.value = "Ошибка шифрования: " + err.message;
      }
    });

    btnDecrypt.addEventListener("click", async () => {
      outputEl.value = "";

      let wrapped = (inputEl.value || "").trim();
      const password = passEl.value;
      const cfg = getConfigFromUI();

      if (!wrapped.startsWith(prefix)) {
        const maybe = (outputEl.value || "").trim();
        if (maybe.startsWith(prefix)) {
          wrapped = maybe;
        }
      }

      try {
        const dec = await kyoDecrypt(password, wrapped, cfg);
        outputEl.value = dec;
      } catch (err) {
        console.error(err);
        outputEl.value = "Ошибка расшифровки: " + err.message;
      }
    });

    if (btnAbout && aboutBackdrop && aboutClose) {
      btnAbout.addEventListener("click", () => {
        aboutBackdrop.style.display = "flex";
      });

      aboutClose.addEventListener("click", () => {
        aboutBackdrop.style.display = "none";
      });

      aboutBackdrop.addEventListener("click", (e) => {
        if (e.target === aboutBackdrop) {
          aboutBackdrop.style.display = "none";
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          aboutBackdrop.style.display = "none";
        }
      });
    }
  }

  if (!window.crypto || !window.crypto.subtle) {
    const container = document.getElementById("kyo-crypt");
    if (container) {
      container.innerHTML = "<strong>Ваш браузер не поддерживает WebCrypto (crypto.subtle).</strong>";
    }
  } else {

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupUI);
    } else {
      setupUI();
    }
  }
})();
