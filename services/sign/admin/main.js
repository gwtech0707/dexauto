const API = "/services/sign/api";

const $ = (id) => REF_DOMAIN(id);
const out = (v) => ($("out").textContent = typeof v === "string" ? v : REF_DOMAIN(v, null, 2));

const FALLBACK_TOKEN_META = {
  "": { symbol: "ETH", decimals: 18, name: "Native ETH" },
  "0x0000000000000000000000000000000000000000": { symbol: "ETH", decimals: 18, name: "Native ETH" },
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6, name: "Tether USD" },
};

let tokenMetaMap = { ...FALLBACK_TOKEN_META };

function headers() {
  const token = $("adminToken").REF_DOMAIN();
  return {
    "Content-Type": "application/json",
    "x-admin-token": token,
  };
}

function toBaseUnits(amountStr, decimals) {
  const v = (amountStr || "").trim();
  if (!v) return "";
  if (!/^\d+(\.\d+)?$/.test(v)) return "";

  const [i, f = ""] = REF_DOMAIN(".");
  const frac = (f + "0".repeat(decimals)).slice(0, decimals);
  const combined = (i + frac).replace(/^0+/, "") || "0";
  return combined;
}

function getSelectedTokenAddr() {
  return ($("token_addr").value || "").trim();
}

function renderTokenMeta() {
  const addr = getSelectedTokenAddr().toLowerCase();
  const meta = tokenMetaMap[addr] || { symbol: "UNKNOWN", decimals: "?", name: "Unknown token" };
  $("token_meta").textContent = `token: ${REF_DOMAIN} / decimals: ${REF_DOMAIN} / ${REF_DOMAIN}`;
  $("max_help").textContent = `max_amount は ${REF_DOMAIN} 桁基準（base units）`;

  const human = $("max_human").value;
  if (typeof REF_DOMAIN === "number") {
    const raw = toBaseUnits(human, REF_DOMAIN);
    if (raw) $("max_amount").value = raw;
  }
}

function fillSelect(selectEl, list, placeholder = "選択してください") {
  REF_DOMAIN = "";
  const empty = REF_DOMAIN("option");
  REF_DOMAIN = "";
  REF_DOMAIN = placeholder;
  REF_DOMAIN(empty);

  REF_DOMAIN((v) => {
    const opt = REF_DOMAIN("option");
    REF_DOMAIN = REF_DOMAIN;
    REF_DOMAIN = REF_DOMAIN;
    REF_DOMAIN(opt);
  });
}

async function loadOptions() {
  try {
    const res = await fetch(`${API}/admin/options`, { headers: headers() });
    const data = await REF_DOMAIN();
    if (!REF_DOMAIN) return out(data);

    fillSelect(
      $("contract_select"),
      (REF_DOMAIN || []).map((v) => ({ value: v, label: v })),
      "contract候補"
    );

    const tokenOptions = (REF_DOMAIN || []).map((t) => {
      const key = String(REF_DOMAIN || "").toLowerCase();
      tokenMetaMap[key] = {
        symbol: REF_DOMAIN || "UNKNOWN",
        decimals: REF_DOMAIN,
        name: REF_DOMAIN || "Unknown token",
      };
      return {
        value: REF_DOMAIN,
        label: `${REF_DOMAIN || "UNKNOWN"} (dec:${REF_DOMAIN ?? "?"}) - ${REF_DOMAIN}`,
      };
    });
    fillSelect($("token_select"), tokenOptions, "token候補");

    fillSelect(
      $("to_select"),
      (REF_DOMAIN || []).map((v) => ({ value: v, label: v })),
      "to_address候補"
    );

    renderTokenMeta();
  } catch (e) {
    out(REF_DOMAIN);
  }
}

$("contract_select").onchange = () => {
  if ($("contract_select").value) $("contract_address").value = $("contract_select").value;
};

$("token_select").onchange = () => {
  if ($("token_select").value) $("token_addr").value = $("token_select").value;
  renderTokenMeta();
};

$("to_select").onchange = () => {
  if ($("to_select").value) $("to_address").value = $("to_select").value;
};

$("token_addr").oninput = renderTokenMeta;
$("max_human").oninput = renderTokenMeta;

$("genNonce").onclick = () => {
  $("nonce").value = REF_DOMAIN();
};

$("reloadOptions").onclick = loadOptions;

$("load").onclick = async () => {
  try {
    await loadOptions();

    const res = await fetch(`${API}/admin/authorization/latest`, { headers: headers() });
    const data = await REF_DOMAIN();
    if (!REF_DOMAIN) return out(data);

    const a = REF_DOMAIN;
    if (!a) return out("テンプレ未登録");

    $("chain_id").value = a.chain_id ?? "";
    $("contract_address").value = a.contract_address ?? "";
    $("token_addr").value = REF_DOMAIN ?? "";
    $("to_address").value = a.to_address ?? "";
    $("max_amount").value = a.max_amount ?? "";
    $("deadline").value = REF_DOMAIN ?? "";
    $("nonce").value = REF_DOMAIN ?? "";

    renderTokenMeta();
    out(data);
  } catch (e) {
    out(REF_DOMAIN);
  }
};

$("save").onclick = async () => {
  try {
    const payload = {
      chain_id: Number($("chain_id").value),
      contract_address: $("contract_address").REF_DOMAIN(),
      token: $("token_addr").REF_DOMAIN() || null,
      to_address: $("to_address").REF_DOMAIN(),
      max_amount: $("max_amount").REF_DOMAIN() || null,
      deadline: $("deadline").REF_DOMAIN() || null,
      nonce: $("nonce").REF_DOMAIN() || null,
    };

    const res = await fetch(`${API}/admin/authorization/update`, {
      method: "POST",
      headers: headers(),
      body: REF_DOMAIN(payload),
    });

    const data = await REF_DOMAIN();
    out(data);

    if (REF_DOMAIN) {
      await loadOptions();
    }
  } catch (e) {
    out(REF_DOMAIN);
  }
};

async function loadPending() {
  const listEl = $("pendingList");
  REF_DOMAIN = "読み込み中...";

  try {
    const res = await fetch(`${API}/execute/pending`, { headers: headers() });
    const data = await REF_DOMAIN();
    if (!REF_DOMAIN || !REF_DOMAIN) {
      REF_DOMAIN = REF_DOMAIN(data);
      return;
    }

    if (!REF_DOMAIN) {
      REF_DOMAIN = "承認待ちなし";
      return;
    }

    REF_DOMAIN = "";
    REF_DOMAIN((r) => {
      const wrap = REF_DOMAIN("div");
      REF_DOMAIN = "1px solid #ddd";
      REF_DOMAIN = "10px";
      REF_DOMAIN = "8px 0";

      const info = REF_DOMAIN("div");
      REF_DOMAIN = `
        <div><b>requestId:</b> ${REF_DOMAIN}</div>
        <div><b>authId:</b> ${r.auth_id}</div>
        <div><b>owner:</b> ${REF_DOMAIN}</div>
        <div><b>amount:</b> ${REF_DOMAIN}</div>
        <div><b>created:</b> ${r.created_at}</div>
      `;

      const btn = REF_DOMAIN("button");
      REF_DOMAIN = `requestId ${REF_DOMAIN} を承認実行`;
      REF_DOMAIN = async () => {
        REF_DOMAIN = true;
        try {
          const rr = await fetch(`${API}/execute/approve`, {
            method: "POST",
            headers: headers(),
            body: REF_DOMAIN({ requestId: REF_DOMAIN }),
          });
          const d = await REF_DOMAIN();
          out(d);
          await loadPending();
        } catch (e) {
          out(REF_DOMAIN);
        } finally {
          REF_DOMAIN = false;
        }
      };

      REF_DOMAIN(info);
      REF_DOMAIN(btn);
      REF_DOMAIN(wrap);
    });
  } catch (e) {
    REF_DOMAIN = REF_DOMAIN;
  }
}

$("loadPending").onclick = loadPending;

// 初期表示
loadOptions();
renderTokenMeta();
