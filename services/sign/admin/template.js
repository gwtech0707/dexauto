const API = "/services/sign/api";

const $ = (id) => document.getElementById(id);
const out = (v) => ($("out").textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2));

const FALLBACK_TOKEN_META = {
  "": { symbol: "ETH", decimals: 18, name: "Native ETH" },
  "0x0000000000000000000000000000000000000000": { symbol: "ETH", decimals: 18, name: "Native ETH" },
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6, name: "Tether USD" },
};

let tokenMetaMap = { ...FALLBACK_TOKEN_META };

function headers() {
  return {
    "Content-Type": "application/json",
    "x-admin-token": $("adminToken").value.trim(),
  };
}

function toBaseUnits(amountStr, decimals) {
  const v = (amountStr || "").trim();
  if (!v) return "";
  if (!/^\d+(\.\d+)?$/.test(v)) return "";
  const [i, f = ""] = v.split(".");
  const frac = (f + "0".repeat(decimals)).slice(0, decimals);
  const combined = (i + frac).replace(/^0+/, "") || "0";
  return combined;
}

function renderTokenMeta() {
  const addr = ($("token_addr").value || "").trim().toLowerCase();
  const meta = tokenMetaMap[addr] || { symbol: "UNKNOWN", decimals: "?", name: "Unknown token" };
  $("token_meta").textContent = `token: ${meta.symbol} / decimals: ${meta.decimals} / ${meta.name}`;
  $("max_help").textContent = `max_amount は ${meta.decimals} 桁基準（base units）`;

  const human = $("max_human").value;
  if (typeof meta.decimals === "number") {
    const raw = toBaseUnits(human, meta.decimals);
    if (raw) $("max_amount").value = raw;
  }
}

function fillSelect(selectEl, list, placeholder) {
  selectEl.innerHTML = "";
  const e = document.createElement("option");
  e.value = "";
  e.textContent = placeholder;
  selectEl.appendChild(e);
  list.forEach((v) => {
    const o = document.createElement("option");
    o.value = v.value;
    o.textContent = v.label;
    selectEl.appendChild(o);
  });
}

async function loadOptions() {
  const res = await fetch(`${API}/admin/options`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));

  fillSelect($("contract_select"), (data.contracts || []).map((v) => ({ value: v, label: v })), "contract候補");

  const tokenOptions = (data.tokens || []).map((t) => {
    const key = String(t.address || "").toLowerCase();
    tokenMetaMap[key] = {
      symbol: t.symbol || "UNKNOWN",
      decimals: t.decimals,
      name: t.name || "Unknown token",
    };
    return { value: t.address, label: `${t.symbol || "UNKNOWN"} (dec:${t.decimals ?? "?"}) - ${t.address}` };
  });
  fillSelect($("token_select"), tokenOptions, "token候補");

  fillSelect($("to_select"), (data.toAddresses || []).map((v) => ({ value: v, label: v })), "to_address候補");

  renderTokenMeta();
}

$("contract_select").onchange = () => { if ($("contract_select").value) $("contract_address").value = $("contract_select").value; };
$("token_select").onchange = () => { if ($("token_select").value) $("token_addr").value = $("token_select").value; renderTokenMeta(); };
$("to_select").onchange = () => { if ($("to_select").value) $("to_address").value = $("to_select").value; };

$("token_addr").oninput = renderTokenMeta;
$("max_human").oninput = renderTokenMeta;
$("genNonce").onclick = () => { $("nonce").value = Date.now(); };
$("reloadOptions").onclick = async () => { try { await loadOptions(); out("候補更新OK"); } catch (e) { out(e.message); } };

$("load").onclick = async () => {
  try {
    await loadOptions();
    const res = await fetch(`${API}/admin/authorization/latest`, { headers: headers() });
    const data = await res.json();
    if (!res.ok) return out(data);
    if (!data.data) return out("テンプレ未登録");

    const a = data.data;
    $("chain_id").value = a.chain_id ?? "";
    $("contract_address").value = a.contract_address ?? "";
    $("token_addr").value = a.token ?? "";
    $("to_address").value = a.to_address ?? "";
    $("max_amount").value = a.max_amount ?? "";
    $("deadline").value = a.deadline ?? "";
    $("nonce").value = a.nonce ?? "";

    renderTokenMeta();
    out(data);
  } catch (e) {
    out(e.message);
  }
};

$("save").onclick = async () => {
  try {
    const payload = {
      chain_id: Number($("chain_id").value),
      contract_address: $("contract_address").value.trim(),
      token: $("token_addr").value.trim() || null,
      to_address: $("to_address").value.trim(),
      max_amount: $("max_amount").value.trim() || null,
      deadline: $("deadline").value.trim() || null,
      nonce: $("nonce").value.trim() || null,
    };

    const res = await fetch(`${API}/admin/authorization/update`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    out(data);
    if (data.success) await loadOptions();
  } catch (e) {
    out(e.message);
  }
};
