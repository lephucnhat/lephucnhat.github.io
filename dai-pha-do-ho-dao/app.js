// Đại Phả Đồ Tông Tộc Đào & Nền Văn Hiến Việt Nam — Phiên Bản Quốc Bảo Toàn Diện (donghodao.vn)
(function () {
  const LS_SUBMISSIONS = "dao_gia_pha_submissions_v1";
  const LS_APPROVED = "dao_gia_pha_approved_v1";
  const LS_FONTSCALE = "dao_gia_pha_fontscale_v1";
  const LS_BOOKDARK = "dao_gia_pha_bookdark_v1";
  const LS_PRIVACY = "dao_gia_pha_privacy_v1";

  let membersById = {};
  let childrenById = {};
  let allMembers = [];
  let currentStyle = 1;
  let renderedStyles = {};
  let s3CurrentRawId = "d3_dao_truong";
  let toastTimer = null;
  let bookDark = localStorage.getItem(LS_BOOKDARK) === "1";
  let privacyMask = localStorage.getItem(LS_PRIVACY) === "1";

  function formatBirth(m) {
    if (!m || !m.birth) return "";
    if (privacyMask && !m.death && m.gen >= 23 && !isAdminUnlocked()) {
      const yr = String(m.birth).match(/\b(19\d\d|20\d\d)\b/);
      return yr ? `${yr[1]} (Ẩn ngày/tháng)` : m.birth;
    }
    return m.birth;
  }

  window.toggleBookDarkMode = function () {
    bookDark = !bookDark;
    localStorage.setItem(LS_BOOKDARK, bookDark ? "1" : "0");
    document.body.classList.toggle("book-dark", bookDark);
    const b1 = document.getElementById("bookDarkBtn");
    const b2 = document.getElementById("darkBtnMenu");
    const txt = bookDark ? "☀️ Chế độ Giấy Dó Sáng" : "🌙 Chế độ Đọc Ban Đêm";
    if (b1) b1.textContent = txt;
    if (b2) b2.textContent = txt;
    showToast(bookDark ? "🌙 Đã bật chế độ đọc ban đêm dịu mắt." : "☀️ Đã chuyển về nền giấy dó truyền thống.");
  };

  window.togglePrivacyMode = function () {
    privacyMask = !privacyMask;
    localStorage.setItem(LS_PRIVACY, privacyMask ? "1" : "0");
    const b = document.getElementById("privBtnMenu");
    if (b) b.textContent = privacyMask ? "👁 Hiện đầy đủ ngày sinh Đời 23+" : "🛡️ Bảo mật ngày sinh Đời 23+";
    refreshAllViews();
    showToast(privacyMask ? "🛡️ Đã bật ẩn ngày/tháng sinh chi tiết của Đời 23–25+." : "👁 Đã hiển thị đầy đủ ngày tháng sinh.");
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.showToast = function (msg) {
    const box = document.getElementById("toastBox");
    if (!box) return;
    box.textContent = msg;
    box.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove("show"), 3600);
  };

  function getSubmissions() {
    try { return JSON.parse(localStorage.getItem(LS_SUBMISSIONS) || "[]"); } catch { return []; }
  }
  function saveSubmissions(list) {
    localStorage.setItem(LS_SUBMISSIONS, JSON.stringify(list));
    updatePendingBadge();
  }
  function getApproved() {
    try { return JSON.parse(localStorage.getItem(LS_APPROVED) || "[]"); } catch { return []; }
  }
  function saveApproved(list) {
    localStorage.setItem(LS_APPROVED, JSON.stringify(list));
  }

  function rebuildIndexes() {
    const approved = getApproved();
    const pending = getSubmissions();
    const map = new Map();
    window.MEMBERS.forEach(m => map.set(m.id, { ...m }));

    const applyRecord = (item, isPending) => {
      if (!item || !item.member) return;
      if (item.action === "edit" && item.targetId && map.has(item.targetId)) {
        const cur = map.get(item.targetId);
        map.set(item.targetId, {
          ...cur,
          ...item.member,
          id: cur.id,
          parentId: item.member.parentId !== undefined ? item.member.parentId : cur.parentId,
          userAdded: true,
          isPending
        });
      } else if (item.action === "add") {
        map.set(item.member.id, { ...item.member, userAdded: true, isPending });
      }
    };

    approved.forEach(item => applyRecord(item, false));
    pending.forEach(item => applyRecord(item, true));

    allMembers = Array.from(map.values());
    membersById = {};
    childrenById = {};
    allMembers.forEach(m => {
      membersById[m.id] = m;
      childrenById[m.id] = [];
    });
    const rootId = (allMembers.find(m => !m.parentId) || allMembers[0]).id;
    allMembers.forEach(m => {
      if (m.id === rootId) return;
      const pid = m.parentId && childrenById[m.parentId] ? m.parentId : (childrenById["d3_dao_truong"] ? "d3_dao_truong" : rootId);
      if (childrenById[pid]) childrenById[pid].push(m);
    });
  }

  function updatePendingBadge() {
    const count = getSubmissions().length;
    ["pendingBadge", "pendingBadgeMenu"].forEach(id => {
      const badge = document.getElementById(id);
      if (!badge) return;
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-block" : "none";
    });
  }

  window.toggleMoreMenu = function (e) {
    e.stopPropagation();
    document.getElementById("moreMenu")?.classList.toggle("open");
  };
  window.closeMoreMenu = function () {
    document.getElementById("moreMenu")?.classList.remove("open");
  };

  function buildHierarchy() {
    const buildNode = (m) => ({
      ...m,
      children: (childrenById[m.id] || []).map(buildNode)
    });
    const rootMember = allMembers.find(m => !m.parentId) || allMembers[0];
    return buildNode(rootMember);
  }

  function refreshAllViews() {
    rebuildIndexes();
    renderedStyles = {};
    switchStyle(currentStyle);
  }

  // ----------------- CỠ CHỮ CAO NIÊN & TRÌNH CHIẾU -----------------
  const fontScales = [1, 1.15, 1.3];
  const fontLabels = ["A+ Cỡ chữ", "A++ Lớn", "A+++ Rất lớn"];
  let fontIdx = Number(localStorage.getItem(LS_FONTSCALE) || 0) % 3;
  function applyFontScale() {
    document.documentElement.style.setProperty("--font-scale", fontScales[fontIdx]);
    const btn = document.getElementById("fontBtn");
    if (btn) btn.textContent = fontLabels[fontIdx];
    requestAnimationFrame(syncTopbarHeight);
  }
  window.cycleFontSize = function () {
    fontIdx = (fontIdx + 1) % fontScales.length;
    localStorage.setItem(LS_FONTSCALE, String(fontIdx));
    applyFontScale();
    showToast(`Đã chỉnh cỡ chữ: ${fontLabels[fontIdx]}`);
  };
  window.toggleFullscreen = function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // ----------------- CHUYỂN ĐỔI 5 PHONG CÁCH -----------------
  window.switchStyle = function (styleNum) {
    currentStyle = Number(styleNum);
    document.body.setAttribute("data-style", String(currentStyle));
    document.querySelectorAll(".style-btn").forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.style) === currentStyle);
    });
    document.querySelectorAll(".style-view").forEach(v => {
      v.classList.toggle("active", Number(v.dataset.style) === currentStyle);
    });
    if (window.location.hash !== `#style=${currentStyle}`) {
      history.replaceState(null, "", `#style=${currentStyle}`);
    }
    if (!renderedStyles[currentStyle]) {
      renderedStyles[currentStyle] = true;
      if (currentStyle === 1) initStyle1Book();
      if (currentStyle === 2) initStyle2Tree();
      if (currentStyle === 3) initStyle3FamilyChart();
      if (currentStyle === 4) initStyle4Cosmic();
      if (currentStyle === 5) initStyle5Bento();
      if (currentStyle === 6) initStyle6RoyalSvg();
    }
  };

  // ----------------- PHONG CÁCH 1 (MẶC ĐỊNH): SÁCH GIA PHẢ & THƯ TỊCH PHẢ KÝ -----------------
  let isSpeaking = false;
  window.toggleReadAloud = function () {
    if (!("speechSynthesis" in window)) {
      showToast("Trình duyệt chưa hỗ trợ đọc giọng nói tự động.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      const b = document.getElementById("ttsBtn");
      if (b) b.textContent = "🔊 Nghe Đọc Phả Ký";
      return;
    }
    const meta = window.PHAM_PHO_META;
    const text = `${meta.title}. ${meta.couplet.top}. ${meta.couplet.bottom}. ${meta.foreword.join(" ")} Bài thơ khai khẩn của ${meta.poem.author}: ${meta.poem.lines.join(", ")}.`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "vi-VN";
    utter.rate = 0.95;
    utter.onend = () => {
      isSpeaking = false;
      const b = document.getElementById("ttsBtn");
      if (b) b.textContent = "🔊 Nghe Đọc Phả Ký";
    };
    isSpeaking = true;
    const b = document.getElementById("ttsBtn");
    if (b) b.textContent = "⏹ Dừng Đọc";
    window.speechSynthesis.speak(utter);
  };

  window.jumpToGen = function (gNum) {
    const target = document.getElementById(`gen-group-${gNum}`);
    if (!target) return;
    const body = target.querySelector(".book-gen-body");
    if (body) body.style.display = "grid";
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.toggleAllBookGens = function (open) {
    document.querySelectorAll(".book-gen-body").forEach(b => {
      b.style.display = open ? "grid" : "none";
    });
  };

  function initStyle1Book() {
    const el = document.getElementById("style1Book");
    const meta = window.PHAM_PHO_META;
    const gens = {};
    allMembers.forEach(m => {
      if (!gens[m.gen]) gens[m.gen] = [];
      gens[m.gen].push(m);
    });

    const genHtml = Object.keys(gens).sort((a, b) => Number(a) - Number(b)).map(gNum => {
      const list = gens[gNum];
      const cards = list.map(m => {
        const spText = m.spouses && m.spouses.length
          ? `<div style="font-size:0.82rem;color:#6e1414;margin-top:4px;">Phối ngẫu: ${m.spouses.map(s => esc(s.name) + (s.death ? ` (Mất: ${esc(s.death)})` : "")).join("; ")}</div>` : "";
        const srcText = m.sources && m.sources.length
          ? `<div style="font-size:0.74rem;color:#7c5a2b;margin-top:4px;">📚 Nguồn: ${m.sources.map(esc).join(" • ")}</div>` : "";
        const badge = m.userAdded ? `<span style="font-size:10px;background:#059669;color:#fff;padding:1px 6px;border-radius:99px;margin-left:6px;">${m.isPending ? "Chờ duyệt" : "Mới bổ sung"}</span>` : "";
        const bStr = formatBirth(m);
        return `<div class="book-person ${m.isMainLine ? "main-line" : ""} ${m.userAdded ? "user-added" : ""}" onclick="openMemberModal('${esc(m.id)}')">
          <div style="font-weight:700;font-size:0.95rem;">${esc(m.name)}${badge}</div>
          <div style="font-size:0.8rem;opacity:0.82;">${esc(m.branch || "Đào Tộc Văn Hiến")}${bStr ? " • Sinh: " + esc(bStr) : ""}${m.death ? " • Mất: " + esc(m.death) : ""}</div>
          ${spText}
          ${srcText}
        </div>`;
      }).join("");
      return `<div class="book-gen-group" id="gen-group-${gNum}">
        <div class="book-gen-head" onclick="if(event.target.tagName!=='BUTTON'){const b=this.nextElementSibling;b.style.display=b.style.display==='none'?'grid':'none';}">
          <span>${esc((window.GEN_LABELS && window.GEN_LABELS[gNum]) || ("Tầng thứ " + gNum))} (${list.length} mục)</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="book-add-inline" onclick="event.stopPropagation(); openContributeModal({gen:${gNum}})">+ Bổ sung Đời ${gNum}</button>
            <span>▾</span>
          </div>
        </div>
        <div class="book-gen-body">${cards}</div>
      </div>`;
    }).join("");

    el.innerHTML = `<div class="book-container">
      <div class="book-toolbar">
        <button class="book-tool-btn" style="background:#8B1E1E;color:#fef3c7;border-color:#D4AF37;" onclick="openTamThuModal()">💌 💌 Tâm Thư Đào Tộc Gửi Muôn Đời Con Cháu</button>
        <button id="ttsBtn" class="book-tool-btn" onclick="toggleReadAloud()">🔊 Nghe Đọc Phả Ký</button>
        <button id="bookDarkBtn" class="book-tool-btn" onclick="toggleBookDarkMode()">${bookDark ? "☀️ Chế độ Giấy Dó Sáng" : "🌙 Chế độ Đọc Ban Đêm"}</button>
        <button class="book-tool-btn" onclick="window.print()">🖨️ In Sách Gia Phả (A4)</button>
        <button class="book-tool-btn" onclick="openContributeModal()">✍️ Chi/Phái Đóng Góp</button>
        <button class="book-tool-btn" onclick="switchStyle(2)">🏮 Xem Cây Phả Đồ</button>
      </div>

      <div class="book-jump-bar">
        <span style="font-size:12px;font-weight:700;color:#6e1414;">Đi nhanh tới:</span>
        <button class="book-jump-pill" onclick="jumpToGen(2)">Phần I: Thập Bát Diệp (18 Vị)</button>
        <button class="book-jump-pill" onclick="jumpToGen(5)">Phần II: 7 Chặng Văn Lang (189 Vị)</button>
        <button class="book-jump-pill" onclick="jumpToGen(6)">Phần III: Âu Lạc • Nam Việt • Trưng Vương</button>
        <button class="book-jump-pill" onclick="toggleAllBookGens(true)">Mở tất cả</button>
        <button class="book-jump-pill" onclick="toggleAllBookGens(false)">Thu gọn</button>
      </div>

      <div class="book-cover">
        <div><div class="hoanh-phi-placa">❖ ${esc(meta.hoanhPhi || "ĐÀO TỘC VĂN HIẾN • THẬP BÁT DIỆP KHỞI NGUYÊN")} ❖</div></div>
        <div class="book-seal-big">TỘC PHẢ TRUYỀN ĐỜI • KHỞI LẬP GIA PHẢ SỐ: NGÀY VĂN HÓA VIỆT NAM 24/11/2026</div>
        <h1 class="book-title">${esc(meta.title)}</h1>
        <p class="book-sub">${esc(meta.subtitle)}</p>
        <div class="book-couplet">
          <span>“${esc(meta.couplet.top)}”</span>
          <span>“${esc(meta.couplet.bottom)}”</span>
        </div>
        <div style="margin-top:12px;font-size:0.84rem;color:#6e1414;font-style:italic;">
          Phụng lập & Số hóa từ Hệ thống Ngọc Phả, Thần Tích & Minh Văn Kim Sử bởi: <strong>Hội Đồng Gia Tộc Họ Đào Việt Nam (donghodao.vn)</strong> • <a href="javascript:void(0)" onclick="openTamThuModal()" style="color:#9e1b1b;font-weight:700;">Đọc Tâm Thư →</a>
        </div>
      </div>

      <div class="book-section">
        <h2 class="book-h2">Phần 1: Lời Nói Đầu & Đạo Hiếu</h2>
        ${meta.foreword.map(p => `<p class="book-p">${esc(p)}</p>`).join("")}
        <div class="book-poem">
          <div style="font-weight:700;margin-bottom:8px;color:#9e1b1b;">Bài thơ khai khẩn của ${esc(meta.poem.author)} (${esc(meta.poem.date)})</div>
          ${meta.poem.lines.map(l => `<div>${esc(l)}</div>`).join("")}
        </div>
      </div>

      <div class="book-section">
        <h2 class="book-h2">Phần 2: Cội Nguồn Khởi Nguyên & Hệ Quy Chiếu La Bàn Mặt Trời Cổ (Xoay 90°)</h2>
        <p class="book-p">${esc(meta.origin)}</p>
        <p class="book-p"><strong>Chìa khóa Phương vị Cổ đại (Định hướng theo Mặt Trời):</strong> ${esc(meta.turningPoint)}</p>
        <div style="margin-top:14px;">
          <div style="font-weight:700;color:#7c1212;font-size:0.96rem;margin-bottom:8px;">🏛️ Dấu Ấn Bát Cổ (古 = 十 Thập + 口 Khẩu — 10 Vị Chi Long Thống Nhất Hiệu Lệnh Xã Tắc Thời Lạc Thư):</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;">
            ${(window.BAT_CO_DATA || []).map(b => `<div class="book-person" style="cursor:default;border-left:3.5px solid #6a1b9a;background:#fcf8ff;">
              <div style="font-weight:700;color:#4a148c;font-size:0.9rem;">${b.idx}. ${esc(b.name)} <span style="color:#8b0000;">(${esc(b.hanzi)})</span></div>
              <div style="font-size:0.82rem;color:#332920;line-height:1.5;margin-top:3px;">${esc(b.desc)}</div>
            </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="book-section">
        <h2 class="book-h2">
          <span>Phần 3: Phả Đồ Truyền Thừa (Đời 1 – Đời 25+)</span>
          <button class="book-add-inline" onclick="openContributeModal({gen:25})">+ Ghi Danh Thế Hệ Đời 25+</button>
        </h2>
        <p class="book-p" style="font-size:0.86rem;opacity:0.82;">Nhấp vào tên từng vị để xem Bia Ký chi tiết, nguồn sử liệu đối chiếu hoặc bổ sung thông tin còn thiếu (ngày sinh, ngày giỗ, vợ/chồng, con cháu Đời 24–25+).</p>
        ${genHtml}
        <div class="book-gen-group" id="gen-group-25">
          <div class="book-gen-head">
            <span>Đời thứ 25+ (Thế hệ Hậu duệ tương lai tiếp nối)</span>
            <button class="book-add-inline" onclick="openContributeModal({gen:25})">+ Bổ sung Hậu duệ Đời 25+</button>
          </div>
        </div>
      </div>

      <div class="book-section">
        <h2 class="book-h2">Phần 4: Tộc Ước – Gia Huấn – Hương Ước Tông Tộc Đào Việt Nam</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">
          ${(meta.tocUoc || []).map(t => `<div class="book-person" style="cursor:default;border-left:3.5px solid #9e1b1b;background:#fffdf8;">
            <div style="font-weight:700;color:#7c1212;font-size:0.92rem;">📜 ${esc(t.title)}</div>
            <div style="font-size:0.84rem;color:#332920;line-height:1.55;margin-top:4px;">${esc(t.desc)}</div>
          </div>`).join("")}
        </div>
      </div>

      <div class="book-section">
        <h2 class="book-h2">Phần 5: Thư Mục Nguồn Sử Liệu & Tài Liệu Đối Chiếu</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">
          ${(window.HISTORICAL_SOURCES || []).map(s => `<div class="book-person" style="cursor:default;background:#fffaf0;">
            <div style="font-weight:700;color:#7c1212;font-size:0.9rem;">📚 ${esc(s.name)}</div>
            <div style="font-size:0.78rem;color:#6b5b4b;margin:2px 0 4px;">${esc(s.author)}</div>
            <div style="font-size:0.82rem;color:#332920;line-height:1.5;">${esc(s.note)}</div>
          </div>`).join("")}
        </div>
      </div>
    </div>`;
  }

  // ----------------- PHONG CÁCH 2: SƠN SON THIẾP VÀNG (D3 TREE) -----------------
  let s2Orientation = "vertical";
  let s2TreeFn = null;

  function initStyle2Tree() {
    const container = document.getElementById("style2Canvas");
    container.innerHTML = "";
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight - 64;

    const svg = d3.select("#style2Canvas").append("svg").attr("class", "s1-svg");
    const g = svg.append("g");
    const zoom = d3.zoom().scaleExtent([0.15, 2.5]).on("zoom", e => g.attr("transform", e.transform));
    svg.call(zoom);

    const root = d3.hierarchy(buildHierarchy());

    function update() {
      const isVert = s2Orientation === "vertical";
      const nodeSize = isVert ? [175, 115] : [64, 230];
      d3.tree().nodeSize(nodeSize)(root);

      const nodes = root.descendants();
      const links = root.links();

      const linkSel = g.selectAll("path.s1-link").data(links, d => d.target.data.id);
      const linkEnter = linkSel.enter().insert("path", "g")
        .attr("class", d => `s1-link ${d.target.data.isMainLine ? "main-line" : ""}`);

      linkEnter.merge(linkSel).transition().duration(350)
        .attr("d", d => isVert
          ? `M${d.source.x},${d.source.y + 26} C${d.source.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${d.target.y - 26}`
          : `M${d.source.y + 78},${d.source.x} C${(d.source.y + d.target.y) / 2},${d.source.x} ${(d.source.y + d.target.y) / 2},${d.target.x} ${d.target.y - 78},${d.target.x}`);
      linkSel.exit().remove();

      const nodeSel = g.selectAll("g.s1-node-card").data(nodes, d => d.data.id);
      const nodeEnter = nodeSel.enter().append("g")
        .attr("class", d => `s1-node-card ${d.data.isMainLine ? "main-line" : ""} ${d.data.userAdded ? "user-added" : ""}`)
        .on("click", (event, d) => { event.stopPropagation(); openMemberModal(d.data.id); });

      nodeEnter.append("rect").attr("class", "s1-node-rect")
        .attr("width", 156).attr("height", 52).attr("x", -78).attr("y", -26);
      nodeEnter.append("text").attr("class", "s1-node-gen")
        .attr("x", 0).attr("y", -8).attr("text-anchor", "middle")
        .text(d => `Đời ${d.data.gen}${d.data.userAdded ? " • Mới" : (d.data.isMainLine ? " • Trực Hệ" : "")}`);
      nodeEnter.append("text").attr("class", "s1-node-name")
        .attr("x", 0).attr("y", 11).attr("text-anchor", "middle")
        .text(d => d.data.name.length > 20 ? d.data.name.slice(0, 19) + "…" : d.data.name);

      const toggleBtn = nodeEnter.filter(d => (d.children || d._children))
        .append("g").attr("class", "s1-toggle")
        .attr("transform", isVert ? "translate(0, 26)" : "translate(78, 0)")
        .on("click", (event, d) => {
          event.stopPropagation();
          if (d.children) { d._children = d.children; d.children = null; }
          else { d.children = d._children; d._children = null; }
          update();
        });
      toggleBtn.append("circle").attr("r", 9).attr("class", "s1-node-badge");
      toggleBtn.append("text").attr("text-anchor", "middle").attr("dy", "0.35em")
        .attr("fill", "#f6d365").attr("font-size", "11px").attr("font-weight", "bold")
        .text(d => d.children ? "−" : "+");

      const nodeUpdate = nodeEnter.merge(nodeSel);
      nodeUpdate.transition().duration(350)
        .attr("transform", d => isVert ? `translate(${d.x},${d.y})` : `translate(${d.y},${d.x})`);
      nodeUpdate.select(".s1-toggle")
        .attr("transform", isVert ? "translate(0, 26)" : "translate(78, 0)")
        .select("text").text(d => d.children ? "−" : "+");
      nodeSel.exit().remove();
    }

    s2TreeFn = {
      update,
      resetZoom: () => {
        const t = s2Orientation === "vertical"
          ? d3.zoomIdentity.translate(width / 2, 70).scale(0.72)
          : d3.zoomIdentity.translate(120, height / 2).scale(0.75);
        svg.transition().duration(500).call(zoom.transform, t);
      },
      expandAll: () => {
        root.each(d => { if (d._children) { d.children = d._children; d._children = null; } });
        update();
      },
      focusId: (targetId) => {
        root.each(d => { if (d._children) { d.children = d._children; d._children = null; } });
        update();
        const found = root.descendants().find(d => d.data.id === targetId);
        if (found) {
          const isVert = s2Orientation === "vertical";
          const tx = width / 2 - (isVert ? found.x : found.y) * 1.05;
          const ty = height / 2 - (isVert ? found.y : found.x) * 1.05;
          svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(1.05));
        }
      },
      applyFilter: (mode) => {
        root.each(d => { if (d._children) { d.children = d._children; d._children = null; } });
        if (mode !== "ALL") {
          root.each(d => {
            const br = d.data.branch || "";
            if (mode === "MAIN" && !d.data.isMainLine && d.children) { d._children = d.children; d.children = null; }
            if (mode === "ROYAL" && d.data.id === "d2_dao_nghieu" && d.children) { d._children = d.children; d.children = null; }
            if (mode === "HUNGDAO" && d.data.id === "d2_dao_bot" && d.children) { d._children = d.children; d.children = null; }
          });
        }
        update();
        if (mode === "CHIHOA") s2TreeFn.focusId("d3_dao_truong");
        else if (mode === "HUNGDAO") s2TreeFn.focusId("d2_dao_nghieu");
        else if (mode === "ROYAL") s2TreeFn.focusId("d2_dao_bot");
        else s2TreeFn.resetZoom();
      }
    };
    update();
    s2TreeFn.resetZoom();
  }

  window.s2ToggleOrientation = function () {
    s2Orientation = s2Orientation === "vertical" ? "horizontal" : "vertical";
    document.getElementById("s2OrientBtn").textContent = s2Orientation === "vertical" ? "⇄ Chuyển Cây Ngang" : "⇅ Chuyển Cây Dọc";
    if (s2TreeFn) { s2TreeFn.update(); s2TreeFn.resetZoom(); }
  };
  window.s2Reset = () => s2TreeFn && s2TreeFn.resetZoom();
  window.s2ExpandAll = () => s2TreeFn && s2TreeFn.expandAll();
  window.s2ApplyFilter = () => {
    const val = document.getElementById("s2BranchFilter")?.value || "ALL";
    if (s2TreeFn) s2TreeFn.applyFilter(val);
  };
  window.focusOnTree = function (id) {
    closeModal();
    switchStyle(2);
    setTimeout(() => s2TreeFn && s2TreeFn.focusId(id), 120);
  };

  // ----------------- PHONG CÁCH 3: CÂY GIA ĐÌNH (DONATSO/FAMILY-CHART) -----------------
  let f3ChartInstance = null;
  async function initStyle3FamilyChart() {
    const container = document.getElementById("FamilyChartContainer");
    container.innerHTML = `<div style="padding:40px;text-align:center;opacity:0.8;">Đang khởi tạo thư viện mã nguồn mở donatso/family-chart...</div>`;
    let f3Lib = window.f3;
    if (!f3Lib) {
      try {
        f3Lib = await import("https://cdn.jsdelivr.net/npm/family-chart@0.9.0/+esm");
        window.f3 = f3Lib;
      } catch { f3Lib = null; }
    }
    container.innerHTML = "";
    if (!f3Lib) {
      container.innerHTML = `<div style="padding:40px;text-align:center;"><h3>Không tải được thư viện family-chart từ CDN</h3></div>`;
      return;
    }

    const nodes = {};
    const ensure = (id, data, rels = {}) => {
      nodes[id] = { id, data, rels: { parents: rels.parents || [], spouses: rels.spouses || [], children: rels.children || [] } };
    };
    allMembers.forEach(m => {
      ensure(m.id, {
        "full name": m.name,
        "gen": `Đời ${m.gen}`,
        "dates": [m.birth ? `Sinh: ${m.birth}` : "", m.death ? `Mất: ${m.death}` : ""].filter(Boolean).join(" • ") || (m.role || ""),
        "gender": m.gender || "M",
        "rawId": m.id
      });
    });
    allMembers.forEach(m => {
      const node = nodes[m.id];
      if (m.parentId && nodes[m.parentId]) {
        node.rels.parents.push(m.parentId);
        nodes[m.parentId].rels.children.push(m.id);
      }
      if (m.spouses && m.spouses.length) {
        m.spouses.forEach((sp, idx) => {
          const spId = `${m.id}_sp_${idx}`;
          ensure(spId, {
            "full name": sp.name,
            "gen": `Phối ngẫu Đời ${m.gen}`,
            "dates": [sp.birth ? `Sinh: ${sp.birth}` : "", sp.death ? `Mất: ${sp.death}` : ""].filter(Boolean).join(" • ") || (sp.note || "Phối ngẫu"),
            "gender": m.gender === "M" ? "F" : "M",
            "rawId": m.id
          }, { spouses: [m.id], children: [] });
          node.rels.spouses.push(spId);
        });
      }
    });
    allMembers.forEach(m => {
      if (m.parentId && nodes[m.parentId] && nodes[m.parentId].rels.spouses.length) {
        const sp0 = nodes[m.parentId].rels.spouses[0];
        nodes[m.id].rels.parents.push(sp0);
        nodes[sp0].rels.children.push(m.id);
      }
    });

    f3ChartInstance = f3Lib.createChart("#FamilyChartContainer", Object.values(nodes))
      .setTransitionTime(600).setCardXSpacing(245).setCardYSpacing(135);

    const f3Card = f3ChartInstance.setCard(f3Lib.CardHtml)
      .setCardDisplay([["full name"], ["gen"], ["dates"]])
      .setCardDim({ w: 215, h: 82 })
      .setOnCardClick((e, d) => {
        f3ChartInstance.updateMainId(d.data.id);
        f3ChartInstance.updateTree({});
        s3CurrentRawId = d.data.data.rawId || d.data.id;
        document.getElementById("s3FocusName").textContent = `${d.data.data["full name"]} (${d.data.data.gen})`;
      });

    if (typeof f3Card.setCardHtml === "function") {
      f3Card.setCardHtml(d => {
        const isFem = d.data.data.gender === "F";
        return `<div class="f3-jade-card ${isFem ? "female" : ""} ${d.data.main ? "main-focus" : ""}">
          <div class="f3-jade-gen">${esc(d.data.data.gen || "")}</div>
          <div class="f3-jade-name">${esc(d.data.data["full name"] || "")}</div>
          <div class="f3-jade-dates">${esc(d.data.data.dates || "")}</div>
        </div>`;
      });
    }
    s3CurrentRawId = "d3_dao_truong";
    f3ChartInstance.updateMainId("d3_dao_truong");
    f3ChartInstance.updateTree({ initial: true });
  }

  window.s3FocusMember = function (id) {
    if (!f3ChartInstance) return;
    s3CurrentRawId = id;
    f3ChartInstance.updateMainId(id);
    f3ChartInstance.updateTree({});
    const m = membersById[id];
    if (m) document.getElementById("s3FocusName").textContent = `${m.name} (Đời ${m.gen})`;
  };
  window.s3OpenCurrentDetail = function () {
    openMemberModal(s3CurrentRawId || "d3_dao_truong");
  };

  // ----------------- PHONG CÁCH 4: TINH TÚ NGÂN HÀ -----------------
  let s4Mode = "radial";
  function initStyle4Cosmic() {
    const canvas = document.getElementById("s3Starfield");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 190; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.7})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    renderStyle4Graph();
  }

  function renderStyle4Graph() {
    const container = document.getElementById("style4Canvas");
    container.innerHTML = "";
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight - 64;
    const svg = d3.select("#style4Canvas").append("svg").attr("class", "s3-svg");
    const g = svg.append("g");
    const zoom = d3.zoom().scaleExtent([0.2, 4]).on("zoom", e => g.attr("transform", e.transform));
    svg.call(zoom);

    const root = d3.hierarchy(buildHierarchy());
    if (s4Mode === "radial") {
      const radius = Math.min(width, height) * 0.44;
      d3.tree().size([2 * Math.PI, radius * 1.45]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)(root);
      for (let gen = 2; gen <= 24; gen += 3) {
        g.append("circle").attr("class", "s3-orbit").attr("r", (gen / 24) * radius * 1.45);
      }
      g.selectAll("path.s3-link").data(root.links()).enter().append("path")
        .attr("class", d => `s3-link ${d.target.data.isMainLine ? "main-line" : ""}`)
        .attr("d", d3.linkRadial().angle(d => d.x).radius(d => d.y));
      const node = g.selectAll("g.s3-star").data(root.descendants()).enter().append("g")
        .attr("class", "s3-star")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .on("click", (e, d) => openMemberModal(d.data.id));
      node.append("circle")
        .attr("r", d => d.data.isMainLine ? 6 : 4)
        .attr("fill", d => d.data.userAdded ? "#34d399" : (d.data.isMainLine ? "#fbbf24" : (d.data.gender === "F" ? "#f472b6" : "#60a5fa")));
      node.append("text").attr("class", "s3-label").attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI === !d.children ? 9 : -9)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => `${d.data.name} (Đ${d.data.gen})`);
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));
    } else {
      const nodes = root.descendants().map(d => ({ ...d.data }));
      const links = root.links().map(l => ({ source: l.source.data.id, target: l.target.data.id, isMain: l.target.data.isMainLine }));
      const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(55))
        .force("charge", d3.forceManyBody().strength(-160))
        .force("center", d3.forceCenter(width / 2, height / 2));
      const link = g.selectAll("line").data(links).enter().append("line").attr("class", d => `s3-link ${d.isMain ? "main-line" : ""}`);
      const node = g.selectAll("g.s3-star").data(nodes).enter().append("g").attr("class", "s3-star")
        .on("click", (e, d) => openMemberModal(d.id))
        .call(d3.drag()
          .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
      node.append("circle").attr("r", d => d.isMainLine ? 7 : 5)
        .attr("fill", d => d.userAdded ? "#34d399" : (d.isMainLine ? "#fbbf24" : (d.gender === "F" ? "#f472b6" : "#60a5fa")));
      node.append("text").attr("class", "s3-label").attr("x", 9).attr("dy", "0.35em").text(d => d.name);
      sim.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });
    }
  }
  window.s4ToggleMode = function () {
    s4Mode = s4Mode === "radial" ? "force" : "radial";
    document.getElementById("s4ModeBtn").textContent = s4Mode === "radial" ? "✦ Chuyển Mạng Lưới Trọng Lực" : "◎ Chuyển Quỹ Đạo Đồng Tâm";
    renderStyle4Graph();
  };

  // ----------------- PHONG CÁCH 5: BENTO DASHBOARD & TIMELINE -----------------
  let s5BranchFilter = "ALL";
  function initStyle5Bento() {
    const el = document.getElementById("style5Bento");
    const branches = ["ALL", ...new Set(allMembers.map(m => m.branch || "Chi Bổ Sung"))];
    const options = allMembers.map(m => `<option value="${esc(m.id)}">Đời ${m.gen} — ${esc(m.name)}</option>`).join("");

    el.innerHTML = `<div class="bento-wrap">
      <div class="bento-kpis">
        <div class="bento-card" onclick="switchStyle(6)" style="cursor:pointer;"><div class="kpi-val">18 Vị</div><div class="kpi-lbl">Thập Bát Diệp Khởi Nguyên (1 Đời I + 2 Đời II + 15 Đời III)</div></div>
        <div class="bento-card" onclick="openCompassLoshuModal()" style="cursor:pointer;"><div class="kpi-val">189 Vị</div><div class="kpi-lbl">Duệ Vương qua 7 Chặng Văn Lang (2.622 Năm • 7 × 27 Vị)</div></div>
        <div class="bento-card" onclick="openCompassLoshuModal()" style="cursor:pointer;"><div class="kpi-val">Bát Cổ (八古)</div><div class="kpi-lbl">10 Vị Chi Long hợp nhất Hà Đồ → Lạc Thư Xã Tắc</div></div>
        <div class="bento-card" onclick="openMemberModal('d8_dao_ky')" style="cursor:pointer;"><div class="kpi-val">65 Thành</div><div class="kpi-lbl">Âu Lạc (Cổ Loa) • Nam Việt • Trưng Nữ Vương Lĩnh Nam</div></div>
      </div>

      <div class="bento-card" style="border-color:rgba(212,175,55,0.45);background:linear-gradient(145deg,rgba(139,30,30,0.22),rgba(15,23,42,0.75));">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <h3 style="font-size:16.5px;color:#fcd34d;">👑 Bảng Vàng Danh Dự Thủy Tổ Thập Bát Diệp & Danh Tướng Họ Đào (Hall of Fame)</h3>
          <span style="font-size:12px;opacity:0.8;">Nhấp vào từng thẻ để xem Bia Ký & Nguồn sử liệu</span>
        </div>
        <div class="hof-grid">
          ${(window.HALL_OF_FAME || []).map(item => {
            const m = membersById[item.memberId];
            return `<div class="hof-card" onclick="openMemberModal('${esc(item.memberId)}')">
              <span class="hof-badge">${esc(item.category)} • ${esc(item.badge)}</span>
              <div style="font-family:var(--font-serif);font-weight:700;font-size:15px;color:#fff;margin-bottom:4px;">${esc(m ? m.name : item.badge)}</div>
              <div style="font-size:12.5px;opacity:0.86;line-height:1.5;">${esc(item.highlight)}</div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="bento-grid-2">
        <div class="bento-card" style="border-color:rgba(251,191,36,0.35);background:linear-gradient(145deg,rgba(120,53,15,0.28),rgba(30,41,59,0.65));">
          <h3 style="margin-bottom:12px;font-size:16px;color:#fcd34d;">🏆 Sổ Vàng Văn Hiến Đào Tộc — Minh Văn & Thiết Chế Bát Cổ</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${(window.GOLDEN_BOOK?.quotes || []).map(q => `<div class="meta-box" style="border-left:3px solid #fbbf24;">
              <div style="font-family:var(--font-serif);font-style:italic;font-size:14px;color:#fef3c7;">${esc(q.quote)}</div>
              <div style="font-size:11.5px;opacity:0.82;margin-top:4px;">— ${esc(q.author)} <span style="opacity:0.7;">(${esc(q.source)})</span></div>
            </div>`).join("")}
          </div>
        </div>

        <div class="bento-card">
          <h3 style="margin-bottom:12px;font-size:16px;">🏛️ Quần Thể Hành Cung, 36 Làng Đào Xá & Đền Thờ Tổ Họ Đào</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${(window.GOLDEN_BOOK?.heritages || []).map(h => `<div class="meta-box">
              <div style="font-weight:700;font-size:13.5px;color:#38bdf8;">${esc(h.place)}</div>
              <div style="font-size:12.5px;opacity:0.82;margin-top:3px;line-height:1.5;">${esc(h.desc)}</div>
            </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="bento-grid-2">
        <div class="bento-card">
          <h3 style="margin-bottom:12px;font-size:16px;">⚡ Tra Cứu Quan Hệ & Khoảng Cách Đời</h3>
          <div class="rel-calc">
            <div class="rel-selects">
              <select id="relA" class="rel-select" onchange="calcRelation()">${options}</select>
              <select id="relB" class="rel-select" onchange="calcRelation()">${options}</select>
            </div>
            <div id="relOutput" class="rel-output"></div>
          </div>
        </div>

        <div class="bento-card">
          <h3 style="margin-bottom:14px;font-size:16px;">⏳ Dòng Thời Gian Văn Hiến (Thập Bát Diệp → Văn Lang → Trưng Vương)</h3>
          <div class="timeline-list">
            ${window.TIMELINE_EVENTS.map(ev => `<div class="tl-item">
              <div class="tl-year">${esc(ev.year)}</div>
              <div class="tl-title">${esc(ev.title)}</div>
              <div class="tl-desc">${esc(ev.desc)}</div>
            </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="bento-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <h3 style="font-size:16px;">🌿 Danh Bạ Chi Nhánh & Thế Hệ</h3>
          <button class="btn-primary" onclick="openContributeModal()">+ Đóng góp thành viên mới</button>
        </div>
        <div class="branch-pills" id="s5Pills">
          ${branches.map(b => `<button class="branch-pill ${b === "ALL" ? "active" : ""}" onclick="filterS5Branch('${esc(b)}', this)">${b === "ALL" ? "Tất cả" : esc(b)}</button>`).join("")}
        </div>
        <div class="bento-members" id="s5Members"></div>
      </div>
    </div>`;

    document.getElementById("relA").value = "d1_dao_ngot";
    document.getElementById("relB").value = "d8_dao_ky";
    calcRelation();
    renderS5Members();
  }

  window.filterS5Branch = function (branch, btn) {
    s5BranchFilter = branch;
    document.querySelectorAll("#s5Pills .branch-pill").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    renderS5Members();
  };

  function renderS5Members() {
    const list = s5BranchFilter === "ALL" ? allMembers : allMembers.filter(m => (m.branch || "Chi Bổ Sung") === s5BranchFilter);
    document.getElementById("s5Members").innerHTML = list.map(m => `
      <div class="bento-member-item" onclick="openMemberModal('${esc(m.id)}')">
        <div style="font-size:11px;color:${m.userAdded ? "#34d399" : "#38bdf8"};font-weight:700;">Đời ${m.gen} • ${esc(m.branch || "Chi Bổ Sung")}</div>
        <div style="font-weight:700;font-size:14.5px;margin:3px 0;">${esc(m.name)}</div>
        <div style="font-size:12px;opacity:0.75;">${esc(m.location || m.role || (m.death ? "Mất: " + m.death : "Thành viên họ Đào"))}</div>
      </div>
    `).join("");
  }

  window.calcRelation = function () {
    const idA = document.getElementById("relA").value;
    const idB = document.getElementById("relB").value;
    const getAncestors = (id) => {
      const path = [];
      let cur = membersById[id];
      while (cur) { path.push(cur); cur = cur.parentId ? membersById[cur.parentId] : null; }
      return path;
    };
    const pathA = getAncestors(idA), pathB = getAncestors(idB);
    const setB = new Set(pathB.map(x => x.id));
    const lca = pathA.find(x => setB.has(x.id));
    const mA = membersById[idA], mB = membersById[idB];
    const diff = Math.abs(mA.gen - mB.gen);
    const elder = mA.gen <= mB.gen ? mA : mB;
    const younger = mA.gen <= mB.gen ? mB : mA;
    let roleHint = "";
    if (mA.id === mB.id) roleHint = "Cùng một vị trong gia phả";
    else if (diff === 0) roleHint = "Anh / Chị / Em đồng tông (cùng thế hệ)";
    else if (diff === 1) roleHint = `${elder.name} thuộc hàng Cha / Bác / Chú / Cô của ${younger.name}`;
    else if (diff === 2) roleHint = `${elder.name} thuộc hàng Ông / Bà của ${younger.name}`;
    else if (diff === 3) roleHint = `${elder.name} thuộc hàng Cụ (Cố) của ${younger.name} (Chắt)`;
    else if (diff === 4) roleHint = `${elder.name} thuộc hàng Kỵ (Sơ) của ${younger.name} (Chút)`;
    else roleHint = `${elder.name} là Tiên Tổ (cách ${diff} đời) của hậu duệ ${younger.name}`;

    document.getElementById("relOutput").innerHTML = `
      <div><strong>Tổ tiên chung gần nhất:</strong> ${lca ? `${esc(lca.name)} (Đời ${lca.gen})` : "Cùng dòng tộc họ Đào"}</div>
      <div><strong>Khoảng cách thế hệ:</strong> ${diff === 0 ? "Cùng thế hệ (Đồng bối)" : `Cách nhau ${diff} đời`}</div>
      <div style="color:#fcd34d;margin-top:2px;"><strong>Vai vế / Xưng hô:</strong> ${esc(roleHint)}</div>
      ${lca ? `<div style="font-size:12px;opacity:0.85;margin-top:4px;">• ${esc(mA.name)} (Đời ${mA.gen}) cách Tổ chung ${pathA.indexOf(lca)} đời.<br>• ${esc(mB.name)} (Đời ${mB.gen}) cách Tổ chung ${pathB.findIndex(x => x.id === lca.id)} đời.</div>
      <div style="font-size:11.5px;margin-top:6px;padding-top:6px;border-top:1px dashed rgba(56,189,248,0.3);color:#bae6fd;">
        <strong>Sơ đồ kết nối (Pathfinder):</strong> ${pathA.slice(0, pathA.indexOf(lca) + 1).map(x => `${esc(x.name)} (Đ${x.gen})`).join(" → ")} ${pathB.findIndex(x => x.id === lca.id) > 0 ? " → " + pathB.slice(0, pathB.findIndex(x => x.id === lca.id)).reverse().map(x => `${esc(x.name)} (Đ${x.gen})`).join(" → ") : ""}
      </div>` : ""}
    `;
  };

  // ----------------- FORM ĐÓNG GÓP / BỔ SUNG HỒ SƠ (CHO CÁC CHI, PHÁI) -----------------
  window.openContributeModal = function (opts = {}) {
    const isEdit = Boolean(opts.editId);
    const target = isEdit ? membersById[opts.editId] : null;
    const defaultGen = target ? target.gen : (opts.gen || 23);
    const parentOptions = [...allMembers]
      .sort((a, b) => a.gen - b.gen)
      .map(m => `<option value="${esc(m.id)}" ${(target && target.parentId === m.id) || opts.parentId === m.id ? "selected" : ""}>Đời ${m.gen} — ${esc(m.name)}</option>`)
      .join("");
    const spouseStr = target?.spouses?.length ? target.spouses.map(s => s.name).join("; ") : "";

    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">PHIẾU BỔ SUNG GIA PHẢ TÔNG TỘC ĐÀO</span>
      <h2 class="modal-title">${isEdit ? `Bổ sung / Sửa: ${esc(target.name)}` : "Điền Thêm Thông Tin Chi / Phái"}</h2>
      <p style="font-size:12.5px;opacity:0.82;line-height:1.5;">
        Đây là bản phả khởi nguyên. Bà con các chi, phái có thể điền thông tin còn thiếu tại đây để xem trước ngay và gửi về Admin tổng hợp lưu hồ sơ dòng họ.
      </p>
      <form id="contribForm" class="form-grid" onsubmit="submitContribution(event)">
        <input type="hidden" id="cfAction" value="${isEdit ? "edit" : "add"}" />
        <input type="hidden" id="cfTargetId" value="${target ? esc(target.id) : ""}" />
        <div>
          <label class="form-label">Đời thứ *</label>
          <input id="cfGen" class="form-input" type="number" min="1" max="35" value="${defaultGen}" required />
        </div>
        <div>
          <label class="form-label">Cha / Mẹ trực tiếp trong phả</label>
          <select id="cfParent" class="form-select">
            <option value="">-- Chọn Tiên Tổ / Nhánh kết nối (mặc định gắn Đệ Tam Đào Trường nếu để trống) --</option>
            ${parentOptions}
          </select>
        </div>
        <div>
          <label class="form-label">Họ và tên *</label>
          <input id="cfName" class="form-input" type="text" value="${target ? esc(target.name) : ""}" placeholder="VD: Đào Văn An" required />
        </div>
        <div>
          <label class="form-label">Giới tính</label>
          <select id="cfGender" class="form-select">
            <option value="M" ${!target || target.gender === "M" ? "selected" : ""}>Nam</option>
            <option value="F" ${target && target.gender === "F" ? "selected" : ""}>Nữ</option>
          </select>
        </div>
        <div>
          <label class="form-label">Ngày / Năm sinh</label>
          <input id="cfBirth" class="form-input" type="text" value="${esc(target?.birth || "")}" placeholder="VD: 1985 hoặc 12/05/1985" />
        </div>
        <div>
          <label class="form-label">Ngày mất / Ngày giỗ (ÂL/DL)</label>
          <input id="cfDeath" class="form-input" type="text" value="${esc(target?.death || "")}" placeholder="VD: 15/08 ÂL (nếu đã mất)" />
        </div>
        <div>
          <label class="form-label">Vợ / Chồng (cách nhau bằng dấu ; nếu nhiều)</label>
          <input id="cfSpouse" class="form-input" type="text" value="${esc(spouseStr)}" placeholder="VD: Nguyễn Thị Bình" />
        </div>
        <div>
          <label class="form-label">Chi / Nhánh & Nơi ở hiện nay</label>
          <input id="cfLocation" class="form-input" type="text" value="${esc(target?.location || "")}" placeholder="VD: Đồng Thái, Ninh Bình / Hà Nội" />
        </div>
        <div class="form-full">
          <label class="form-label">Ảnh chân dung / Di ảnh (tùy chọn — tự động nén nhẹ)</label>
          <input id="cfPhotoFile" class="form-input" type="file" accept="image/*" onchange="handlePhotoUpload(event)" />
          <input type="hidden" id="cfPhotoData" value="${esc(target?.photo || "")}" />
          <div id="cfPhotoPreview" style="margin-top:6px;">${target?.photo ? `<img src="${esc(target.photo)}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:1px solid #fcd34d;" />` : ""}</div>
        </div>
        <div class="form-full">
          <label class="form-label">Tiểu sử / Ghi chú bổ sung</label>
          <textarea id="cfNote" class="form-textarea" placeholder="Ghi thêm con cháu, nơi an táng, chức danh hoặc lời nhắn cho Admin...">${esc(target?.note || "")}</textarea>
        </div>
        <div class="form-full">
          <label class="form-label">Người gửi & SĐT/Zalo liên hệ (để Admin xác minh)</label>
          <input id="cfSender" class="form-input" type="text" placeholder="VD: Đào Văn Minh — Chi 3 — ĐT: 0912..." />
        </div>
        <div class="form-full btn-row">
          <button type="submit" class="btn-primary">💾 Lưu & Xem Trước Ngay</button>
          <button type="button" class="btn-secondary" onclick="copyContribForZalo()">📋 Sao chép gửi Zalo Admin</button>
          <button type="button" class="btn-secondary" onclick="sendContribToGithubIssue()">↗ Gửi GitHub Issue</button>
        </div>
      </form>
      <div id="contribStatus" style="margin-top:10px;font-size:12.5px;color:#34d399;"></div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  function collectFormPayload() {
    const action = document.getElementById("cfAction").value;
    const targetId = document.getElementById("cfTargetId").value;
    const gen = Number(document.getElementById("cfGen").value) || 23;
    const parentId = document.getElementById("cfParent").value || (action === "add" ? "d3_dao_truong" : null);
    const name = document.getElementById("cfName").value.trim();
    const gender = document.getElementById("cfGender").value;
    const birth = document.getElementById("cfBirth").value.trim();
    const death = document.getElementById("cfDeath").value.trim();
    const spouseRaw = document.getElementById("cfSpouse").value.trim();
    const location = document.getElementById("cfLocation").value.trim();
    const photo = document.getElementById("cfPhotoData")?.value || "";
    const note = document.getElementById("cfNote").value.trim();
    const sender = document.getElementById("cfSender").value.trim() || "Thành viên dòng họ";

    const existing = action === "edit" && targetId ? membersById[targetId] : null;
    const spouses = spouseRaw
      ? spouseRaw.split(";").map((s, i) => {
          const prev = existing?.spouses?.[i];
          return { ...(prev || {}), name: s.trim() };
        }).filter(s => s.name)
      : [];

    const id = existing ? existing.id : `d${gen}_u_${Date.now().toString(36)}`;
    return {
      subId: `sub_${Date.now()}`,
      createdAt: new Date().toLocaleString("vi-VN"),
      action,
      targetId,
      sender,
      member: {
        id,
        name,
        gen,
        parentId,
        gender,
        birth,
        death,
        location,
        photo,
        branch: existing?.branch || (location ? `Chi bổ sung (${location})` : "Chi Bổ Sung"),
        spouses,
        note
      }
    };
  }

  window.handlePhotoUpload = function (e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 120;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
        document.getElementById("cfPhotoData").value = dataUrl;
        document.getElementById("cfPhotoPreview").innerHTML = `<img src="${dataUrl}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:1px solid #fcd34d;" /> <span style="font-size:11.5px;color:#34d399;">✓ Đã nén ảnh</span>`;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  window.submitContribution = function (e) {
    e.preventDefault();
    const payload = collectFormPayload();
    if (!payload.member.name) return;
    const subs = getSubmissions();
    subs.unshift(payload);
    saveSubmissions(subs);
    document.getElementById("contribStatus").innerHTML = "✅ Đã lưu hồ sơ vào Kho Chờ Duyệt & hiển thị ngay trên cây gia phả! Bạn có thể bấm <b>Sao chép gửi Zalo Admin</b> hoặc <b>Gửi GitHub Issue</b>.";
    showToast(`Đã lưu hồ sơ: ${payload.member.name}`);
    refreshAllViews();
  };

  function formatPayloadText(p) {
    const m = p.member;
    return [
      `[BỔ SUNG GIA PHẢ TÔNG TỘC ĐÀO VIỆT NAM]`,
      `- Loại: ${p.action === "edit" ? "Chỉnh sửa/Bổ sung" : "Thêm thành viên mới"}`,
      `- Đời thứ: ${m.gen}`,
      `- Họ tên: ${m.name} (${m.gender === "F" ? "Nữ" : "Nam"})`,
      m.parentId && membersById[m.parentId] ? `- Cha/Mẹ: ${membersById[m.parentId].name} (Đời ${membersById[m.parentId].gen})` : "",
      m.birth ? `- Sinh: ${m.birth}` : "",
      m.death ? `- Mất/Giỗ: ${m.death}` : "",
      m.spouses?.length ? `- Phối ngẫu: ${m.spouses.map(s => s.name).join("; ")}` : "",
      m.location ? `- Nơi ở/An táng: ${m.location}` : "",
      m.note ? `- Ghi chú: ${m.note}` : "",
      `- Người gửi: ${p.sender}`
    ].filter(Boolean).join("\n");
  }

  window.copyContribForZalo = function () {
    const p = collectFormPayload();
    if (!p.member.name) { showToast("Vui lòng nhập Họ và tên trước khi sao chép."); return; }
    navigator.clipboard?.writeText(formatPayloadText(p)).then(() => {
      document.getElementById("contribStatus").textContent = "📋 Đã sao chép nội dung! Hãy dán vào nhóm Zalo hoặc tin nhắn cho Admin.";
      showToast("Đã sao chép tin nhắn gửi Zalo Admin!");
    });
  };

  window.sendContribToGithubIssue = function () {
    const p = collectFormPayload();
    if (!p.member.name) { showToast("Vui lòng nhập Họ và tên trước khi gửi."); return; }
    const title = encodeURIComponent(`[Gia Phả Họ Đào] ${p.action === "edit" ? "Sửa" : "Thêm"}: ${p.member.name} (Đời ${p.member.gen})`);
    const body = encodeURIComponent(formatPayloadText(p) + "\n\n```json\n" + JSON.stringify(p.member, null, 2) + "\n```");
    window.open(`https://donghodao.vn/??title=${title}&body=${body}`, "_blank", "noopener");
  };

  // ----------------- BẢNG QUẢN TRỊ ADMIN & NHẬP/XUẤT DỮ LIỆU -----------------
  const ADMIN_KEY = "DAOTOC2026";
  const SS_ADMIN_AUTH = "dao_gia_pha_admin_unlocked_v1";

  function isAdminUnlocked() {
    return sessionStorage.getItem(SS_ADMIN_AUTH) === "1";
  }

  window.unlockAdmin = function (e) {
    e.preventDefault();
    const val = (document.getElementById("adminPassInput")?.value || "").trim();
    if (val === ADMIN_KEY) {
      sessionStorage.setItem(SS_ADMIN_AUTH, "1");
      showToast("🔓 Đã mở khóa Quản Trị Admin!");
      openAdminModal();
    } else {
      const err = document.getElementById("adminPassErr");
      if (err) err.textContent = "❌ Mã khóa chưa đúng. Vui lòng kiểm tra lại!";
    }
  };

  window.lockAdmin = function () {
    sessionStorage.removeItem(SS_ADMIN_AUTH);
    showToast("🔒 Đã khóa lại quyền Admin.");
    openAdminModal();
  };

  window.openAdminModal = function () {
    if (!isAdminUnlocked()) {
      document.getElementById("modalContent").innerHTML = `
        <span class="modal-tag">BẢO VỆ QUẢN TRỊ VIÊN</span>
        <h2 class="modal-title">🔒 Mở Khóa Admin Hub</h2>
        <p style="font-size:13px;opacity:0.85;margin-bottom:14px;line-height:1.5;">
          Khu vực này dành riêng cho Admin duyệt hồ sơ từ các chi/phái, nhập/xuất dữ liệu và khôi phục bản gốc. Bà con vẫn có thể đóng góp thông tin tự do qua nút <b>"✍️ Bổ Sung Hồ Sơ"</b>.
        </p>
        <form onsubmit="unlockAdmin(event)" style="display:flex;flex-direction:column;gap:10px;">
          <label class="form-label">Nhập mã khóa Admin</label>
          <input id="adminPassInput" class="form-input" type="password" placeholder="Nhập mã khóa..." autocomplete="off" autofocus required />
          <div id="adminPassErr" style="font-size:12.5px;color:#f87171;min-height:18px;"></div>
          <div class="btn-row" style="margin-top:4px;">
            <button type="submit" class="btn-primary">🔓 Mở Khóa Quản Trị</button>
            <button type="button" class="btn-secondary" onclick="const inp=document.getElementById('adminPassInput');inp.type=inp.type==='password'?'text':'password';">👁 Hiện / Ẩn mã</button>
          </div>
        </form>
      `;
      document.getElementById("globalModal").classList.add("open");
      return;
    }

    const subs = getSubmissions();
    const listHtml = subs.length
      ? subs.map((s, idx) => `<div class="meta-box" style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div>
              <strong>${esc(s.member.name)}</strong> <span style="font-size:11px;color:#fcd34d;">(Đời ${s.member.gen} • ${s.action === "edit" ? "Sửa" : "Thêm mới"})</span>
              <div style="font-size:12px;opacity:0.8;margin-top:2px;">Người gửi: ${esc(s.sender)} • ${esc(s.createdAt)}</div>
              ${s.member.note ? `<div style="font-size:12px;opacity:0.85;margin-top:4px;">Ghi chú: ${esc(s.member.note)}</div>` : ""}
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
              <button class="btn-primary" style="padding:5px 10px;font-size:11.5px;" onclick="approveSubmission(${idx})">✓ Duyệt</button>
              <button class="btn-danger" onclick="rejectSubmission(${idx})">✕</button>
            </div>
          </div>
        </div>`).join("")
      : `<div class="meta-box" style="opacity:0.75;">Chưa có hồ sơ mới nào đang chờ duyệt. Các chi, phái có thể bấm nút <b>"✍️ Bổ Sung Hồ Sơ"</b> để gửi thông tin.</div>`;

    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">ADMIN HUB • TỔNG HỢP & LƯU HỒ SƠ</span>
      <h2 class="modal-title">Quản Trị Gia Phả Số (${allMembers.length} vị)</h2>
      <p style="font-size:12.5px;opacity:0.82;margin-bottom:12px;">
        Duyệt hồ sơ từ các chi/phái gửi về và xuất/nhập dữ liệu chuẩn hóa (JSON, CSV Excel, GEDCOM) để lưu trữ vĩnh viễn.
      </p>
      <div style="margin-bottom:16px;">
        <div style="font-weight:700;font-size:13.5px;margin-bottom:8px;">📥 Hồ sơ chờ Admin duyệt (${subs.length})</div>
        ${listHtml}
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.14);padding-top:14px;">
        <div style="font-weight:700;font-size:13.5px;margin-bottom:8px;">📤 Xuất & Nhập dữ liệu (Dành cho Admin / Lập trình viên)</div>
        <div class="btn-row">
          <button class="btn-secondary" onclick="exportData('json')">⬇ Tải JSON (.json)</button>
          <button class="btn-secondary" onclick="exportData('csv')">⬇ Tải Excel (.csv)</button>
          <button class="btn-secondary" onclick="exportData('ged')">⬇ Tải GEDCOM (.ged)</button>
          <label class="btn-secondary" style="cursor:pointer;">📥 Nhập/Gộp JSON <input type="file" accept=".json" style="display:none;" onchange="importDataJson(event)" /></label>
          <button class="btn-danger" onclick="resetLocalChanges()">↺ Khôi phục bản gốc</button>
          <button class="btn-secondary" onclick="lockAdmin()">🔒 Khóa lại Admin</button>
        </div>
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.importDataJson = function (e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(reader.result);
        if (!Array.isArray(arr)) throw new Error("File JSON phải là mảng thành viên.");
        const baseIds = new Set(window.MEMBERS.map(m => m.id));
        const approved = getApproved();
        let added = 0;
        arr.forEach(m => {
          if (m && m.id && m.name && m.gen) {
            approved.push({
              action: baseIds.has(m.id) ? "edit" : "add",
              targetId: baseIds.has(m.id) ? m.id : null,
              member: m
            });
            added++;
          }
        });
        saveApproved(approved);
        refreshAllViews();
        openAdminModal();
        showToast(`Đã nhập & gộp ${added} hồ sơ từ file JSON!`);
      } catch (err) {
        showToast("Lỗi đọc file JSON: " + err.message);
      }
    };
    reader.readAsText(file, "utf-8");
  };

  window.approveSubmission = function (idx) {
    const subs = getSubmissions();
    const item = subs.splice(idx, 1)[0];
    if (!item) return;
    const approved = getApproved();
    approved.push(item);
    saveApproved(approved);
    saveSubmissions(subs);
    refreshAllViews();
    openAdminModal();
    showToast(`Đã duyệt hồ sơ: ${item.member.name}`);
  };

  window.rejectSubmission = function (idx) {
    const subs = getSubmissions();
    const removed = subs.splice(idx, 1)[0];
    saveSubmissions(subs);
    refreshAllViews();
    openAdminModal();
    if (removed) showToast(`Đã xóa hồ sơ chờ: ${removed.member.name}`);
  };

  window.resetLocalChanges = function () {
    if (!confirm("Bạn có chắc muốn xóa các hồ sơ lưu tạm trên trình duyệt và quay về bản gốc?")) return;
    localStorage.removeItem(LS_APPROVED);
    localStorage.removeItem(LS_SUBMISSIONS);
    updatePendingBadge();
    refreshAllViews();
    openAdminModal();
    showToast("Đã khôi phục dữ liệu gia phả gốc.");
  };

  window.exportData = function (fmt) {
    let content = "", filename = "dai-pha-do-ho-dao", mime = "text/plain;charset=utf-8";
    if (fmt === "json") {
      content = JSON.stringify(allMembers, null, 2);
      filename += ".json"; mime = "application/json;charset=utf-8";
    } else if (fmt === "csv") {
      const header = ["ID", "Doi", "HoTen", "GioiTinh", "ChaMeID", "ChiNhanh", "Sinh", "Mat", "NoiO", "GhiChu"];
      const rows = allMembers.map(m => [m.id, m.gen, m.name, m.gender, m.parentId || "", m.branch || "", m.birth || "", m.death || "", m.location || "", m.note || ""]
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
      content = "\uFEFF" + [header.join(","), ...rows].join("\n");
      filename += ".csv"; mime = "text/csv;charset=utf-8";
    } else if (fmt === "ged") {
      const lines = ["0 HEAD", "1 GEDC", "2 VERS 7.0", "1 CHAR UTF-8"];
      allMembers.forEach(m => {
        lines.push(`0 @${m.id}@ INDI`, `1 NAME ${m.name}`, `1 SEX ${m.gender === "F" ? "F" : "M"}`);
        if (m.birth) lines.push("1 BIRT", `2 DATE ${m.birth}`);
        if (m.death) lines.push("1 DEAT", `2 DATE ${m.death}`);
        if (m.note) lines.push(`1 NOTE Đời ${m.gen}. ${m.note}`);
      });
      lines.push("0 TRLR");
      content = lines.join("\n");
      filename += ".ged";
    }
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    showToast(`Đang tải xuống ${filename}`);
  };

  // ----------------- TÌM KIẾM KHÔNG DẤU & MODAL CHI TIẾT -----------------
  function normVi(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  }

  const searchInput = document.getElementById("globalSearch");
  const searchResults = document.getElementById("searchResults");

  searchInput.addEventListener("input", () => {
    const tokens = normVi(searchInput.value.trim()).split(/\s+/).filter(Boolean);
    if (!tokens.length) { searchResults.classList.remove("open"); return; }
    const hits = allMembers.filter(m => {
      const hay = normVi([
        m.name, m.role, m.location, m.branch,
        ...(m.spouses ? m.spouses.map(s => s.name) : [])
      ].filter(Boolean).join(" "));
      return tokens.every(t => hay.includes(t));
    }).slice(0, 12);

    searchResults.innerHTML = hits.length
      ? hits.map(m => `<div class="search-item" onclick="selectSearchHit('${esc(m.id)}')">
          <span class="search-item-name">${esc(m.name)}</span>
          <span class="search-item-gen">Đời ${m.gen}</span>
        </div>`).join("")
      : `<div style="padding:10px;font-size:12.5px;opacity:0.7;">Không tìm thấy kết quả phù hợp.</div>`;
    searchResults.classList.add("open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("globalModal").classList.remove("open");
      searchResults.classList.remove("open");
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) searchResults.classList.remove("open");
    if (!e.target.closest(".menu-wrap")) closeMoreMenu();
  });

  window.selectSearchHit = function (id) {
    searchResults.classList.remove("open");
    openMemberModal(id);
    if (currentStyle === 3) s3FocusMember(id);
  };

  window.shareMember = function (id) {
    const m = membersById[id];
    const url = `${window.location.origin}${window.location.pathname}#style=${currentStyle}&member=${id}`;
    navigator.clipboard?.writeText(url).then(() => {
      showToast(`Đã sao chép đường dẫn của ${m ? m.name : "thành viên"}!`);
    });
  };

  window.openMemberModal = function (id) {
    const m = membersById[id];
    if (!m) return;
    const parent = m.parentId ? membersById[m.parentId] : null;
    const kids = childrenById[m.id] || [];
    const spousesHtml = m.spouses && m.spouses.length
      ? m.spouses.map(s => `<div>• <strong>${esc(s.name)}</strong>${s.birth ? ` (Sinh: ${esc(s.birth)})` : ""}${s.death ? ` — Mất: ${esc(s.death)}` : ""}${s.note ? ` (${esc(s.note)})` : ""}</div>`).join("")
      : "Chưa ghi nhận trong phả";

    // Chuỗi Mạch Nguồn Huyết Thống từ Đời 1 -> vị hiện tại (Pedigree Breadcrumb)
    const lineageChain = [];
    let curNode = m;
    while (curNode) {
      lineageChain.unshift(curNode);
      curNode = curNode.parentId ? membersById[curNode.parentId] : null;
    }
    const chainHtml = lineageChain.map(node =>
      `<span class="lineage-step" onclick="openMemberModal('${esc(node.id)}')">Đ${node.gen}: ${esc(node.gen === 1 ? "Đức Thượng Tổ" : node.name)}</span>`
    ).join(`<span style="opacity:0.5;">→</span>`);

    document.getElementById("modalContent").innerHTML = `
      ${m.photo ? `<img class="member-avatar" src="${esc(m.photo)}" alt="${esc(m.name)}" />` : ""}
      <span class="modal-tag">ĐỜI THỨ ${m.gen} • ${esc(m.branch || "Đào Tộc Văn Hiến")}</span>
      <h2 class="modal-title">${esc(m.name)}</h2>
      <p style="font-size:13.5px;opacity:0.85;margin-bottom:10px;">${esc(m.role || (m.isMainLine ? "Trực hệ truyền thừa Tông Tộc Đào Việt Nam" : "Thành viên Phả Chi Họ Đào"))}</p>
      <div class="lineage-path-bar">
        <strong style="color:#fcd34d;margin-right:4px;">🌿 Mạch truyền thừa:</strong> ${chainHtml}
      </div>
      <div class="modal-meta">
        <div class="meta-box"><div class="meta-lbl">Năm sinh / Năm mất</div><div class="meta-val">${formatBirth(m) ? "Sinh: " + esc(formatBirth(m)) : "—"} ${m.death ? "• Mất: " + esc(m.death) : ""} ${m.age ? "(" + esc(m.age) + ")" : ""}</div></div>
        <div class="meta-box"><div class="meta-lbl">Địa bàn / Lăng tẩm</div><div class="meta-val">${esc(m.location || "Đất Tổ Phú Thọ & Châu Thổ Bắc Bộ")}</div></div>
      </div>
      <div class="meta-box" style="margin-bottom:12px;">
        <div class="meta-lbl">Phối ngẫu (Vợ / Chồng)</div>
        <div style="font-size:13px;line-height:1.6;margin-top:4px;">${spousesHtml}</div>
      </div>
      ${m.note ? `<div class="meta-box" style="margin-bottom:12px;"><div class="meta-lbl">Ghi chú phả ký & Sử liệu</div><div style="font-size:13px;line-height:1.6;margin-top:4px;">${esc(m.note)}</div></div>` : ""}
      ${m.sources && m.sources.length ? `<div class="meta-box" style="margin-bottom:12px;border-color:rgba(251,191,36,0.35);"><div class="meta-lbl">📚 Nguồn sử liệu tham khảo</div><div style="font-size:12.5px;line-height:1.6;margin-top:4px;color:#fcd34d;">${m.sources.map(s => `• ${esc(s)}`).join("<br/>")}</div></div>` : ""}
      <div style="margin-top:12px;">
        <div class="meta-lbl">Thân phụ / Thân mẫu:</div>
        <div class="lineage-chips">
          ${parent ? `<span class="lineage-chip" onclick="openMemberModal('${esc(parent.id)}')">↑ ${esc(parent.name)} (Đời ${parent.gen})</span>` : `<span class="lineage-chip">Thủy Tổ Đời 1</span>`}
        </div>
      </div>
      ${kids.length ? `<div style="margin-top:12px;">
        <div class="meta-lbl">Con cái (${kids.length}):</div>
        <div class="lineage-chips">${kids.map(k => `<span class="lineage-chip" onclick="openMemberModal('${esc(k.id)}')">↓ ${esc(k.name)}</span>`).join("")}</div>
      </div>` : ""}
      <div class="btn-row" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;">
        <button class="btn-primary" onclick="openContributeModal({editId:'${esc(m.id)}'})">✏️ Bổ sung / Sửa thông tin</button>
        <button class="btn-secondary" onclick="openContributeModal({parentId:'${esc(m.id)}', gen:${m.gen + 1}})">+ Thêm con (Đời ${m.gen + 1})</button>
        <button class="btn-secondary" onclick="focusOnTree('${esc(m.id)}')">🎯 Định vị trên Cây Phả Đồ</button>
        <button class="btn-secondary" onclick="shareMember('${esc(m.id)}')">🔗 Chia sẻ</button>
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.openMemorialModal = function () {
    const items = [];
    const parseMonth = (str) => {
      const m = String(str).match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
      return m ? Number(m[2]) * 100 + Number(m[1]) : 9999;
    };
    allMembers.forEach(m => {
      if (m.death) items.push({ name: m.name, gen: `Đời ${m.gen}`, date: m.death, extra: m.age || "", sortKey: parseMonth(m.death) });
      if (m.spouses) {
        m.spouses.forEach(s => {
          if (s.death) items.push({ name: s.name, gen: `Phối ngẫu Đời ${m.gen}`, date: s.death, extra: s.note || "", sortKey: parseMonth(s.death) });
        });
      }
    });
    items.sort((a, b) => a.sortKey - b.sortKey);
    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">LỊCH GIỖ TỔ TIÊN TÔNG TỘC ĐÀO (SẮP XẾP THEO THÁNG)</span>
      <h2 class="modal-title">Ngày Giỗ & Kỷ Niệm Âm Lịch</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
        ${items.map(it => `<div class="meta-box" style="display:flex;justify-content:space-between;align-items:center;">
          <div><strong>${esc(it.name)}</strong><div style="font-size:11.5px;opacity:0.75;">${esc(it.gen)} ${it.extra ? "• " + esc(it.extra) : ""}</div></div>
          <span style="color:#fcd34d;font-weight:700;font-size:13px;">${esc(it.date)}</span>
        </div>`).join("")}
      </div>
      <div class="btn-row">
        <button class="btn-primary" onclick="openContributeModal()">+ Bổ sung ngày giỗ còn thiếu</button>
        <button class="btn-secondary" onclick="window.print()">🖨️ In Lịch Giỗ</button>
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.openIncenseModal = function () {
    const count = Number(localStorage.getItem("dao_gia_pha_incense_v1") || 108);
    let notes = [];
    try { notes = JSON.parse(localStorage.getItem("dao_gia_pha_guestbook_v1") || "[]"); } catch {}
    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">TỪ ĐƯỜNG SỐ TÔNG TỘC ĐÀO VIỆT NAM</span>
      <h2 class="modal-title">Thắp Hương Tưởng Nhớ & Sổ Lưu Bút</h2>
      <div class="incense-altar">
        <div id="incenseSticks" class="incense-sticks">🕯️ 🥢 🕯️</div>
        <div style="font-size:13.5px;margin:8px 0;">Đã có <strong id="incenseCount" style="color:#fcd34d;">${count}</strong> nén hương thành kính dâng lên Tiên Tổ</div>
        <button class="btn-primary" onclick="lightIncense()">🙏 Thắp Hương Thành Kính</button>
      </div>
      <form onsubmit="addGuestbookEntry(event)" class="form-grid" style="margin-bottom:14px;">
        <div><input id="gbName" class="form-input" placeholder="Họ tên con cháu *" required /></div>
        <div><input id="gbBranch" class="form-input" placeholder="Chi / Nơi ở (VD: Ninh Bình)" /></div>
        <div class="form-full"><textarea id="gbMsg" class="form-textarea" placeholder="Lời tri ân, cầu chúc bình an hoặc nhắn nhủ tới dòng họ... *" required></textarea></div>
        <div class="form-full"><button type="submit" class="btn-secondary">✍️ Ghi Vào Sổ Lưu Bút</button></div>
      </form>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${notes.length ? notes.map(n => `<div class="meta-box">
          <div style="display:flex;justify-content:space-between;font-size:12px;"><strong style="color:#fcd34d;">${esc(n.name)}</strong><span style="opacity:0.7;">${esc(n.branch)} • ${esc(n.date)}</span></div>
          <div style="font-size:13px;margin-top:4px;line-height:1.5;">${esc(n.msg)}</div>
        </div>`).join("") : `<div class="meta-box" style="opacity:0.75;">Hãy là người đầu tiên ghi lời tri ân vào Sổ Lưu Bút dòng họ!</div>`}
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.lightIncense = function () {
    const next = Number(localStorage.getItem("dao_gia_pha_incense_v1") || 108) + 1;
    localStorage.setItem("dao_gia_pha_incense_v1", String(next));
    const el = document.getElementById("incenseCount");
    const sticks = document.getElementById("incenseSticks");
    if (el) el.textContent = next;
    if (sticks) sticks.classList.add("lit");
    showToast("🙏 Đã dâng hương thành kính lên Tổ Tiên Họ Đào!");
  };

  window.addGuestbookEntry = function (e) {
    e.preventDefault();
    const name = document.getElementById("gbName").value.trim();
    const branch = document.getElementById("gbBranch").value.trim() || "Con cháu họ Đào";
    const msg = document.getElementById("gbMsg").value.trim();
    if (!name || !msg) return;
    let notes = [];
    try { notes = JSON.parse(localStorage.getItem("dao_gia_pha_guestbook_v1") || "[]"); } catch {}
    notes.unshift({ name, branch, msg, date: new Date().toLocaleDateString("vi-VN") });
    localStorage.setItem("dao_gia_pha_guestbook_v1", JSON.stringify(notes));
    showToast("Đã ghi lời tri ân vào Sổ Lưu Bút!");
    openIncenseModal();
  };

  window.openTamThuModal = function () {
    const tt = window.PHAM_PHO_META.tamThu;
    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">NGÀY VĂN HÓA VIỆT NAM • 24/11/2026</span>
      <h2 class="modal-title">${esc(tt.title)}</h2>
      <p style="font-size:12.5px;color:#fcd34d;margin-bottom:8px;">${esc(tt.occasion)}</p>
      <div class="tamthu-paper">
        <p style="font-weight:700;color:#7c1212;">${esc(tt.salutation)}</p>
        ${tt.paragraphs.map(p => `<p>${esc(p)}</p>`).join("")}
        <div style="text-align:right;margin-top:16px;font-style:italic;color:#6e1414;">
          <div>${esc(tt.signature)}</div>
          <div style="font-weight:800;font-style:normal;margin-top:4px;font-size:15px;">${esc(tt.author)}</div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn-primary" onclick="openContributeModal()">✍️ Bổ Sung Hồ Sơ Chi/Phái Ngay</button>
        <button class="btn-secondary" onclick="readTamThuAloud()">🔊 Nghe Đọc Tâm Thư</button>
        <button class="btn-secondary" onclick="openIncenseModal()">🙏 Thắp Hương & Lưu Bút</button>
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.readTamThuAloud = function () {
    if (!("speechSynthesis" in window)) {
      showToast("Trình duyệt chưa hỗ trợ đọc giọng nói tự động.");
      return;
    }
    window.speechSynthesis.cancel();
    const tt = window.PHAM_PHO_META.tamThu;
    const text = `${tt.title}. ${tt.occasion}. ${tt.salutation} ${tt.paragraphs.join(" ")} ${tt.signature}. ${tt.author}.`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "vi-VN";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
    showToast("🔊 Đang đọc Tâm Thư Tông Tộc Đào Việt Nam...");
  };

  window.openGuideModal = function () {
    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">HƯỚNG DẪN SỬ DỤNG 30 GIÂY</span>
      <h2 class="modal-title">Dành Cho Mọi Thế Hệ Trong Dòng Họ</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
        <div class="meta-box"><strong>👴 Ông Bà / Lão Niên:</strong> Bấm <b>"A+ Cỡ chữ"</b> ở góc trên để phóng to chữ. Bấm <b>"🔊 Nghe Đọc Phả Ký"</b> để máy tự đọc thành tiếng, hoặc <b>"🖨️ In Sách Gia Phả"</b> để in ra giấy A4.</div>
        <div class="meta-box"><strong>👨‍👩‍👧‍👦 Các Chi / Phái Bổ Sung Thông Tin:</strong> Bấm nút cam <b>"✍️ Bổ Sung Hồ Sơ"</b> (hoặc bấm vào tên một cụ bất kỳ -> <b>Sửa / Thêm con</b>). Sau đó có thể lưu xem trước và bấm <b>"📋 Sao chép gửi Zalo Admin"</b>.</div>
        <div class="meta-box"><strong>🎤 Diễn Giả / Họp Họ:</strong> Chuyển đổi 5 giao diện ở thanh trên cùng, bấm <b>"⛶"</b> để phóng to toàn màn hình khi thuyết trình trên TV / máy chiếu.</div>
        <div class="meta-box"><strong>💻 Admin / Lập Trình Viên:</strong> Mở <b>"🛡️ Admin"</b> để duyệt hồ sơ mới, nhập/gộp JSON hoặc xuất dữ liệu chuẩn <b>JSON, Excel CSV, GEDCOM 7.0</b>.</div>
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.openChangelogModal = function () {
    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">NHẬT KÝ HỆ THỐNG & KIỂM CHỨNG SỬ LIỆU</span>
      <h2 class="modal-title">📋 Nhật Ký Nâng Cấp (Changelog)</h2>
      <p style="font-size:13px;opacity:0.85;margin-bottom:14px;">Mọi dữ liệu lịch sử và cải tiến giao diện đều được lưu vết minh bạch và đối chiếu chéo từ tối thiểu 2–3 nguồn chính sử:</p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${(window.CHANGELOG_HISTORY || []).map(c => `<div class="meta-box">
          <div style="font-weight:700;color:#fcd34d;font-size:14px;margin-bottom:6px;">${esc(c.version)}</div>
          <ul style="padding-left:18px;font-size:12.5px;line-height:1.6;opacity:0.9;">
            ${c.items.map(it => `<li>${esc(it)}</li>`).join("")}
          </ul>
        </div>`).join("")}
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.openOpenSourceModal = function () {
    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">MÃ NGUỒN MỞ GITHUB TÍCH HỢP</span>
      <h2 class="modal-title">Kiến Trúc & Thư Viện Tham Chiếu</h2>
      <p style="font-size:13px;opacity:0.85;margin-bottom:14px;">Hệ thống Đại Phả Đồ Tông Tộc Đào Việt Nam (donghodao.vn) ứng dụng kiến trúc đồ họa phả hệ tương tác chuẩn quốc tế:</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${window.OPEN_SOURCE_REFS.map(r => `<div class="meta-box">
          <a href="${esc(r.url)}" target="_blank" rel="noopener" style="color:#38bdf8;font-weight:700;text-decoration:none;font-size:14px;">↗ ${esc(r.name)}</a>
          <div style="font-size:12.5px;opacity:0.85;margin-top:4px;line-height:1.5;">${esc(r.role)}</div>
        </div>`).join("")}
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.closeModal = function (e) {
    if (!e || e.target.id === "globalModal" || e.target.classList.contains("modal-close")) {
      document.getElementById("globalModal").classList.remove("open");
    }
  };

  // Đồng bộ chiều cao Topbar động trên mọi kích thước màn hình (Desktop / Tablet / Mobile)
  function syncTopbarHeight() {
    const tb = document.querySelector(".topbar");
    if (tb) document.documentElement.style.setProperty("--top-bar-h", `${tb.offsetHeight}px`);
  }
  window.addEventListener("resize", syncTopbarHeight);

  // Khởi tạo hệ thống + hỗ trợ deep-link #style=X&member=ID
  const initialHash = window.location.hash;
  const styleMatch = initialHash.match(/style=(\d)/);
  const memberMatch = initialHash.match(/member=([^&]+)/);
  document.body.classList.toggle("book-dark", bookDark);
  applyFontScale();
  syncTopbarHeight();
  rebuildIndexes();
  updatePendingBadge();
  const initialStyle = styleMatch ? Number(styleMatch[1]) : 1;
  switchStyle(initialStyle >= 1 && initialStyle <= 6 ? initialStyle : 6);
  if (memberMatch && membersById[memberMatch[1]]) {
    setTimeout(() => openMemberModal(memberMatch[1]), 150);
  }

  // ----------------- PHONG CÁCH 6: ĐẠI PHẢ ĐỒ VECTOR 4K & LA BÀN LẠC THƯ -----------------
  const NODE_TO_MEMBER = {
    "mau-au-co": "d0_au_co",
    "dao-ngot": "d1_dao_ngot",
    "dao-bot": "d2_dao_bot",
    "dao-nghieu": "d2_dao_nghieu",
    "chi-long-1": "d3_dao_cu",
    "chi-long-2": "d3_dao_hong",
    "chi-long-3": "d3_dao_truong",
    "chi-long-4": "d3_dao_thach_khanh",
    "chi-long-5": "d3_dao_quy_lan",
    "chi-long-6": "d3_de_luc",
    "chi-long-7": "d3_de_that",
    "chi-long-8": "d3_de_bat",
    "chi-long-9": "d3_de_cuu",
    "chi-long-10": "d3_de_thap",
    "nam-vi-sau": "d3_nam_vi_sau",
    "trung-cung-1": "d3_dao_quy_lan",
    "trung-cung-2": "d3_de_thap",
    "trang-tong-chat": "d3_dao_truong",
    "chang-1": "d4_chang_1",
    "chang-2": "d4_chang_2",
    "chang-3": "d4_chang_3",
    "chang-4": "d4_chang_4",
    "chang-5": "d4_chang_5",
    "chang-6": "d4_chang_6",
    "chang-7": "d4_chang_7",
    "cuong-vuc-van-lang": "d4_chang_7",
    "thoi-thuc-vuong": "d6_dao_noi",
    "nha-trieu": "d7_dao_thi_hoan",
    "thoi-trung-vuong": "d8_dao_ky",
    "header-overview": "d1_dao_ngot",
    "pillar-1": "d1_dao_ngot",
    "pillar-2": "d2_dao_bot",
    "pillar-3": "d2_dao_nghieu",
    "colophon-footer": "d3_de_thap"
  };

  let s6Zoom = null;
  let s6SvgSel = null;

  function initStyle6RoyalSvg() {
    const svgEl = document.getElementById("royalDaoSvg");
    if (!svgEl) return;
    const wrap = document.getElementById("s6SvgWrap");
    const w = wrap.clientWidth || window.innerWidth;
    const h = wrap.clientHeight || (window.innerHeight - 64);

    // Sử dụng d3.zoom trực tiếp trên thẻ #royalDaoSvg để vừa khít khung màn hình 100%
    svgEl.setAttribute("width", "100%");
    svgEl.setAttribute("height", "100%");
    s6SvgSel = d3.select("#royalDaoSvg");

    // Bọc nội dung trong 1 group #s6ZoomGroup nếu chưa có
    let zoomG = svgEl.querySelector("#s6ZoomGroup");
    if (!zoomG) {
      zoomG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      zoomG.setAttribute("id", "s6ZoomGroup");
      const children = Array.from(svgEl.childNodes);
      children.forEach(ch => {
        if (ch.nodeName !== "defs") zoomG.appendChild(ch);
      });
      svgEl.appendChild(zoomG);
    }
    const gSel = d3.select(zoomG);
    s6Zoom = d3.zoom().scaleExtent([0.15, 3.2]).on("zoom", (e) => {
      gSel.attr("transform", e.transform);
    });
    s6SvgSel.call(s6Zoom);

    // Gắn sự kiện click trên từng ô của Đại Phả Đồ để mở Bia Ký Chi Tiết
    svgEl.querySelectorAll(".interactive-node").forEach(node => {
      node.addEventListener("click", (e) => {
        e.stopPropagation();
        const nid = node.getAttribute("data-node-id");
        const mid = NODE_TO_MEMBER[nid] || "d1_dao_ngot";
        openMemberModal(mid);
      });
    });

    s6FitScreen();
  }

  window.s6FitScreen = function () {
    if (!s6SvgSel || !s6Zoom) return;
    const wrap = document.getElementById("s6SvgWrap");
    const w = wrap.clientWidth || window.innerWidth;
    const h = wrap.clientHeight || (window.innerHeight - 64);
    const scale = Math.min((w - 30) / 2400, (h - 30) / 3420);
    const tx = (w - 2400 * scale) / 2;
    const ty = (h - 3420 * scale) / 2;
    s6SvgSel.transition().duration(450).call(s6Zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  };

  window.s6FocusPart = function (part) {
    if (!s6SvgSel || !s6Zoom) return;
    const wrap = document.getElementById("s6SvgWrap");
    const w = wrap.clientWidth || window.innerWidth;
    const scale = Math.min((w - 40) / 2400, 0.72);
    const tx = (w - 2400 * scale) / 2;
    let targetY = 0;
    if (part === 1) targetY = 20;
    if (part === 2) targetY = -1890 * scale + 30;
    if (part === 3) targetY = -2750 * scale + 40;
    s6SvgSel.transition().duration(500).call(s6Zoom.transform, d3.zoomIdentity.translate(tx, targetY).scale(scale));
  };

  window.exportDaoPng4K = function () {
    showToast("🖼️ Đang kết xuất Đại Phả Đồ PNG 4K (2400×3420px)...");
    fetch("van_lang_trung_vuong.svg")
      .then(r => r.text())
      .then(svgText => {
        const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 2400;
          canvas.height = 3420;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#f4efe6";
          ctx.fillRect(0, 0, 2400, 3420);
          ctx.drawImage(img, 0, 0, 2400, 3420);
          URL.revokeObjectURL(url);
          const a = document.createElement("a");
          a.download = "Dai_Pha_Do_Tong_Toc_Dao_4K.png";
          a.href = canvas.toDataURL("image/png");
          a.click();
          showToast("✅ Đã tải xuống ảnh Đại Phả Đồ PNG 4K sắc nét!");
        };
        img.src = url;
      });
  };

  window.openCompassLoshuModal = function () {
    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">CHÌA KHÓA THIÊN VĂN CỔ & DỊCH HỌC ĐÀO TỘC</span>
      <h2 class="modal-title">🧭 La Bàn Mặt Trời Cổ (Xoay 90°) & Cửu Cung Lạc Thư</h2>
      <p style="font-size:12.5px;opacity:0.86;line-height:1.55;margin-bottom:12px;">
        Thời thượng cổ chưa dùng la bàn từ trường mà định hướng theo Mặt Trời, nên <b>Phương cổ xoay 90° thuận chiều kim đồng hồ = Hướng la bàn ngày nay</b>. Nhờ đó giải mã chính xác vị trí 7 Hành Cung Văn Lang (189 Duệ Vương) và 8 thiết chế <b>Bát Cổ (古 = 十 + 口)</b>:
      </p>
      <div style="display:flex;flex-direction:column;align-items:center;background:rgba(0,0,0,0.28);padding:14px;border-radius:12px;border:1px solid rgba(212,175,55,0.35);margin-bottom:14px;">
        <svg viewBox="0 0 320 320" width="230" height="230">
          <circle cx="160" cy="160" r="148" fill="#1d0808" stroke="#d4af37" stroke-width="3"/>
          <text x="160" y="24" font-size="12" font-weight="bold" fill="#38bdf8" text-anchor="middle">BẮC (NAY) • Chặng 5</text>
          <text x="292" y="164" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">ĐÔNG (NAY)</text>
          <text x="160" y="306" font-size="12" font-weight="bold" fill="#38bdf8" text-anchor="middle">NAM (NAY) • Chặng 1</text>
          <text x="28" y="164" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">TÂY (NAY)</text>
          <g id="modalAncientRing" style="transform-origin:160px 160px;transition:transform 0.6s ease;transform:rotate(90deg);">
            <circle cx="160" cy="160" r="92" fill="#7a0c0c" stroke="#ffd700" stroke-width="2.5"/>
            <text x="160" y="90" font-size="11" font-weight="bold" fill="#ffd700" text-anchor="middle">BẮC (CỔ) • Số 1 Tứ Kỳ</text>
            <text x="218" y="164" font-size="11" font-weight="bold" fill="#ffd700" text-anchor="middle">ĐÔNG (CỔ)</text>
            <text x="160" y="236" font-size="11" font-weight="bold" fill="#ffd700" text-anchor="middle">NAM (CỔ) • Số 9 Hoài Đức</text>
            <text x="102" y="164" font-size="11" font-weight="bold" fill="#ffd700" text-anchor="middle">TÂY (CỔ)</text>
            <circle cx="160" cy="160" r="22" fill="#ffd700"/>
            <text x="160" y="166" font-size="15" font-weight="bold" fill="#7a0c0c" text-anchor="middle">陶</text>
          </g>
        </svg>
        <div class="btn-row" style="justify-content:center;margin-top:8px;">
          <button class="btn-primary" onclick="document.getElementById('modalAncientRing').style.transform='rotate(90deg)'">🔄 Xoay +90° (Khớp Hướng Nay)</button>
          <button class="btn-secondary" onclick="document.getElementById('modalAncientRing').style.transform='rotate(0deg)'">☀️ Gốc Phương Cổ (0°)</button>
        </div>
      </div>
      <div style="font-weight:700;font-size:13.5px;color:#fcd34d;margin-bottom:6px;">☯️ Bàn Cờ Cửu Cung Lạc Thư — 7 Chặng Văn Lang (Bấm vào để xem Bia Ký):</div>
      <div class="loshu-mini-grid">
        <div class="loshu-mini-cell" onclick="openMemberModal('d4_chang_3')"><strong style="color:#fcd34d;">Số 4 • Quẻ Tốn</strong><div style="font-size:11px;">Chặng 3 (Vị 55–81)<br>Hành cung Thanh Liệt</div></div>
        <div class="loshu-mini-cell" onclick="openMemberModal('d4_chang_4')"><strong style="color:#fcd34d;">Số 9 • Quẻ Ly</strong><div style="font-size:11px;">Chặng 4 (Vị 82–108)<br>Hành cung Hoài Đức</div></div>
        <div class="loshu-mini-cell" onclick="openMemberModal('d4_chang_7')"><strong style="color:#fcd34d;">Số 2 • Quẻ Khôn</strong><div style="font-size:11px;">Chặng 7 (Vị 163–189)<br>Hành cung Phú Lương</div></div>
        <div class="loshu-mini-cell" onclick="openMemberModal('d4_chang_1')"><strong style="color:#fcd34d;">Số 3 • Quẻ Chấn</strong><div style="font-size:11px;">Chặng 1 (Vị 1–27)<br>Hành cung Phủ Lý</div></div>
        <div class="loshu-mini-cell" onclick="openMemberModal('d3_de_thap')"><strong style="color:#c084fc;">Số 5 • Trung Cung</strong><div style="font-size:11px;">Đức Đệ Thập Cải Chi<br>Tây Hồ & Bát Cổ</div></div>
        <div class="loshu-mini-cell" onclick="openMemberModal('d4_chang_5')"><strong style="color:#fcd34d;">Số 7 • Quẻ Đoài</strong><div style="font-size:11px;">Chặng 5 (Vị 109–135)<br>Hành cung Thuận Thành</div></div>
        <div class="loshu-mini-cell" onclick="openMemberModal('d4_chang_2')"><strong style="color:#fcd34d;">Số 8 • Quẻ Cấn</strong><div style="font-size:11px;">Chặng 2 (Vị 28–54)<br>Hành cung Thủy Đường</div></div>
        <div class="loshu-mini-cell" onclick="openMemberModal('d4_chang_6')"><strong style="color:#fcd34d;">Số 1 • Quẻ Khảm</strong><div style="font-size:11px;">Chặng 6 (Vị 136–162)<br>Hành cung Tứ Kỳ</div></div>
        <div class="loshu-mini-cell" onclick="openMemberModal('d3_de_luc')"><strong style="color:#38bdf8;">Số 6 • Quẻ Càn</strong><div style="font-size:11px;">Khai Canh Tứ Cận<br>& Chuyển Vận Âu Lạc</div></div>
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

})();
