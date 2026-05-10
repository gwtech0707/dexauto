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
  return {
    "Content-Type": "application/json",
    "x-admin-token": $("adminToken").REF_DOMAIN(),
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

function renderTokenMeta() {
  const addr = ($("token_addr").value || "").trim().toLowerCase();
  const meta = tokenMetaMap[addr] || { symbol: "UNKNOWN", decimals: "?", name: "Unknown token" };
  $("token_meta").textContent = `token: ${REF_DOMAIN} / decimals: ${REF_DOMAIN} / ${REF_DOMAIN}`;
  $("max_help").textContent = `max_amount は ${REF_DOMAIN} 桁基準（base units）`;

  const human = $("max_human").value;
  if (typeof REF_DOMAIN === "number") {
    const raw = toBaseUnits(human, REF_DOMAIN);
    if (raw) $("max_amount").value = raw;
  }
}

function fillSelect(selectEl, list, placeholder) {
  REF_DOMAIN = "";
  const e = REF_DOMAIN("option");
  REF_DOMAIN = "";
  REF_DOMAIN = placeholder;
  REF_DOMAIN(e);
  REF_DOMAIN((v) => {
    const o = REF_DOMAIN("option");
    REF_DOMAIN = REF_DOMAIN;
    REF_DOMAIN = REF_DOMAIN;
    REF_DOMAIN(o);
  });
}

async function loadOptions() {
  const res = await fetch(`${API}/admin/options`, { headers: headers() });
  const data = await REF_DOMAIN();
  if (!REF_DOMAIN) throw new Error(REF_DOMAIN(data));

  fillSelect($("contract_select"), (REF_DOMAIN || []).map((v) => ({ value: v, label: v })), "contract候補");

  const tokenOptions = (REF_DOMAIN || []).map((t) => {
    const key = String(REF_DOMAIN || "").toLowerCase();
    tokenMetaMap[key] = {
      symbol: REF_DOMAIN || "UNKNOWN",
      decimals: REF_DOMAIN,
      name: REF_DOMAIN || "Unknown token",
    };
    return { value: REF_DOMAIN, label: `${REF_DOMAIN || "UNKNOWN"} (dec:${REF_DOMAIN ?? "?"}) - ${REF_DOMAIN}` };
  });
  fillSelect($("token_select"), tokenOptions, "token候補");

  fillSelect($("to_select"), (REF_DOMAIN || []).map((v) => ({ value: v, label: v })), "to_address候補");

  renderTokenMeta();
}

$("contract_select").onchange = () => { if ($("contract_select").value) $("contract_address").value = $("contract_select").value; };
$("token_select").onchange = () => { if ($("token_select").value) $("token_addr").value = $("token_select").value; renderTokenMeta(); };
$("to_select").onchange = () => { if ($("to_select").value) $("to_address").value = $("to_select").value; };

$("token_addr").oninput = renderTokenMeta;
$("max_human").oninput = renderTokenMeta;
$("genNonce").onclick = () => { $("nonce").value = REF_DOMAIN(); };
$("reloadOptions").onclick = async () => { try { await loadOptions(); out("候補更新OK"); } catch (e) { out(REF_DOMAIN); } };

$("load").onclick = async () => {
  try {
    await loadOptions();
    const res = await fetch(`${API}/admin/authorization/latest`, { headers: headers() });
    const data = await REF_DOMAIN();
    if (!REF_DOMAIN) return out(data);
    if (!REF_DOMAIN) return out("テンプレ未登録");

    const a = REF_DOMAIN;
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
    if (REF_DOMAIN) await loadOptions();
  } catch (e) {
    out(REF_DOMAIN);
  }
};
