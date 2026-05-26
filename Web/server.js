const http = require("http");
const Ticket = require("../Database/Models/Ticket/ticket");

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const PALETTE = ["#5865f2","#3ba55c","#faa61a","#eb459e","#9c59b6","#1abc9c","#e67e22","#e91e63"];

function avatarColor(tag) {
  const n = [...String(tag)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[n % PALETTE.length];
}

function fmtTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function fmtDateDivider(ts) {
  return new Date(ts).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function sameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function renderMsgBody(m) {
  const body = esc(m.content).replace(/\n/g, "<br>");
  const files = m.attachments
    .map((u) => {
      const clean = u.split("?")[0];
      const ext = clean.split(".").pop().toLowerCase();
      return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
        ? `<img src="${esc(u)}" class="img-att" loading="lazy">`
        : `<div class="file-att"><span>&#128206;</span><a href="${esc(u)}" target="_blank">${esc(clean.split("/").pop())}</a></div>`;
    })
    .join("");
  return (body ? `<div class="text">${body}</div>` : "") + (files ? `<div class="files">${files}</div>` : "");
}

function renderPage(ticket) {
  // Group consecutive messages from same author within 7 minutes
  const groups = [];
  for (const msg of ticket.messages) {
    const last = groups[groups.length - 1];
    const gap = last ? new Date(msg.timestamp) - new Date(last.msgs[last.msgs.length - 1].timestamp) : Infinity;
    if (last && last.authorId === msg.authorId && gap < 7 * 60 * 1000) {
      last.msgs.push(msg);
    } else {
      groups.push({ authorId: msg.authorId, authorTag: msg.authorTag, msgs: [msg] });
    }
  }

  let lastDayTs = null;
  const bodyHtml = groups
    .map((g) => {
      const color = avatarColor(g.authorTag);
      const initial = String(g.authorTag).charAt(0).toUpperCase();
      const firstTs = g.msgs[0].timestamp;

      let divider = "";
      if (!lastDayTs || !sameDay(lastDayTs, firstTs)) {
        divider = `<div class="date-div"><span>${fmtDateDivider(firstTs)}</span></div>`;
        lastDayTs = firstTs;
      }

      const continuations = g.msgs.slice(1).map((m) => {
        const hoverTs = fmtTimestamp(m.timestamp);
        return `<div class="cont" data-ts="${esc(hoverTs)}">${renderMsgBody(m)}</div>`;
      }).join("");

      return `${divider}<div class="group">
  <div class="av" style="background:${color}" title="${esc(g.authorTag)}">${initial}</div>
  <div class="gbody">
    <div class="ghdr">
      <span class="uname" style="color:${color}">${esc(g.authorTag)}</span>
      <span class="gts">${fmtTimestamp(firstTs)}</span>
    </div>
    ${renderMsgBody(g.msgs[0])}
    ${continuations}
  </div>
</div>`;
    })
    .join("\n");

  const openedBy = esc(ticket.openedByTag);
  const openedOn = fmtDateDivider(ticket.createdAt);
  const closedBy = ticket.closedByTag ? ` &bull; Closed by <strong>${esc(ticket.closedByTag)}</strong>` : "";
  const msgCount = ticket.messages.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(ticket.channelName)} — Transcript</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"gg sans","Noto Sans","Helvetica Neue",Helvetica,Arial,sans-serif;background:#313338;color:#dbdee1;font-size:16px;line-height:1.375;min-height:100vh}
    a{color:#00a8fc;text-decoration:none}
    a:hover{text-decoration:underline}

    /* Sticky top bar */
    .topbar{position:sticky;top:0;z-index:20;background:#2b2d31;border-bottom:1px solid #1e1f22;display:flex;align-items:center;gap:10px;padding:0 16px;height:48px}
    .topbar-hash{color:#80848e;font-size:1.4rem;font-weight:700;line-height:1}
    .topbar-name{color:#f2f3f5;font-weight:600;font-size:.95rem}
    .topbar-pill{margin-left:auto;background:#1e1f22;border-radius:999px;padding:3px 10px;font-size:.75rem;color:#80848e}

    /* Channel intro */
    .ch-intro{padding:24px 16px 16px;border-bottom:1px solid #3f4147;margin-bottom:8px}
    .ch-badge{width:64px;height:64px;background:#5865f2;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;margin-bottom:12px}
    .ch-title{color:#f2f3f5;font-size:1.5rem;font-weight:700;margin-bottom:4px}
    .ch-sub{color:#80848e;font-size:.875rem}

    /* Messages */
    .msgs{padding:0 0 60px}
    .group{display:flex;gap:16px;padding:2px 16px;border-radius:0;position:relative}
    .group:hover{background:#2e3035}
    .av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;color:#fff;flex-shrink:0;margin-top:2px;user-select:none;cursor:default}
    .gbody{flex:1;min-width:0;padding:2px 0}
    .ghdr{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px;margin-bottom:2px}
    .uname{font-weight:500;font-size:.9375rem}
    .gts{color:#80848e;font-size:.75rem}
    .text{color:#dbdee1;word-break:break-word;white-space:pre-wrap;font-size:.9375rem}
    .files{margin-top:4px;display:flex;flex-direction:column;gap:4px}
    .img-att{max-width:400px;max-height:300px;border-radius:4px;display:block}
    .file-att{display:inline-flex;align-items:center;gap:8px;background:#2b2d31;border:1px solid #3f4147;border-radius:4px;padding:10px 12px;font-size:.875rem;max-width:400px}
    .file-att a{color:#00a8fc}
    /* Continuation lines (same group, no header) */
    .cont{padding-left:0;position:relative}
    .cont:hover::before{content:attr(data-ts);position:absolute;left:-60px;top:0;color:#80848e;font-size:.65rem;white-space:nowrap;pointer-events:none}

    /* Date divider */
    .date-div{display:flex;align-items:center;gap:0;padding:24px 16px 8px;color:#80848e;font-size:.75rem;font-weight:600;letter-spacing:.02em}
    .date-div::before,.date-div::after{content:"";flex:1;height:1px;background:#3f4147}
    .date-div span{padding:0 12px;white-space:nowrap}

    /* Empty state */
    .empty{text-align:center;padding:60px 20px;color:#80848e;font-style:italic}
  </style>
</head>
<body>
<div class="topbar">
  <span class="topbar-hash">#</span>
  <span class="topbar-name">${esc(ticket.channelName)}</span>
  <span class="topbar-pill">${msgCount} message${msgCount !== 1 ? "s" : ""}</span>
</div>
<div class="ch-intro">
  <div class="ch-badge">#</div>
  <div class="ch-title">${esc(ticket.channelName)}</div>
  <div class="ch-sub">Opened by <strong>${openedBy}</strong> on ${openedOn}${closedBy}</div>
</div>
<div class="msgs">
  ${bodyHtml || `<div class="empty">No messages recorded.</div>`}
</div>
</body>
</html>`;
}

function startTranscriptServer(port) {
  const server = http.createServer(async (req, res) => {
    const match = req.url?.match(/^\/transcript\/([a-f0-9]{12})$/);
    if (!match) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }

    try {
      const ticket = await Ticket.findOne({ ticketId: match[1] });
      if (!ticket) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Transcript not found");
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage(ticket));
    } catch {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
    }
  });

  server.listen(port);
  return server;
}

module.exports = startTranscriptServer;
