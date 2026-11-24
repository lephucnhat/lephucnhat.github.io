// Gia Phả Số Họ Trần Lãng Nam — Phiên Bản Hoàn Thiện Toàn Diện (lephucnhat.vn)
(function () {
  const LS_SUBMISSIONS = "tran_gia_pha_submissions_v1";
  const LS_APPROVED = "tran_gia_pha_approved_v1";
  const LS_FONTSCALE = "tran_gia_pha_fontscale_v1";
  const LS_BOOKDARK = "tran_gia_pha_bookdark_v1";
  const LS_PRIVACY = "tran_gia_pha_privacy_v1";

  let membersById = {};
  let childrenById = {};
  let allMembers = [];
  let currentStyle = 1;
  let renderedStyles = {};
  let s3CurrentRawId = "d20_chi_hoa";
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
      const pid = m.parentId && childrenById[m.parentId] ? m.parentId : (childrenById["d20_chi_hoa"] ? "d20_chi_hoa" : rootId);
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
          <div style="font-size:0.8rem;opacity:0.82;">${esc(m.branch || "Chi Lãng Nam")}${bStr ? " • Sinh: " + esc(bStr) : ""}${m.death ? " • Mất: " + esc(m.death) : ""}</div>
          ${spText}
          ${srcText}
        </div>`;
      }).join("");
      return `<div class="book-gen-group" id="gen-group-${gNum}">
        <div class="book-gen-head" onclick="if(event.target.tagName!=='BUTTON'){const b=this.nextElementSibling;b.style.display=b.style.display==='none'?'grid':'none';}">
          <span>Đời thứ ${gNum} (${list.length} vị)</span>
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
        <button class="book-tool-btn" style="background:#8B1E1E;color:#fef3c7;border-color:#D4AF37;" onclick="openTamThuModal()">💌 Tâm Thư Đời 23 (24/11/2026)</button>
        <button id="ttsBtn" class="book-tool-btn" onclick="toggleReadAloud()">🔊 Nghe Đọc Phả Ký</button>
        <button id="bookDarkBtn" class="book-tool-btn" onclick="toggleBookDarkMode()">${bookDark ? "☀️ Chế độ Giấy Dó Sáng" : "🌙 Chế độ Đọc Ban Đêm"}</button>
        <button class="book-tool-btn" onclick="window.print()">🖨️ In Sách Gia Phả (A4)</button>
        <button class="book-tool-btn" onclick="openContributeModal()">✍️ Chi/Phái Đóng Góp</button>
        <button class="book-tool-btn" onclick="switchStyle(2)">🏮 Xem Cây Phả Đồ</button>
      </div>

      <div class="book-jump-bar">
        <span style="font-size:12px;font-weight:700;color:#6e1414;">Đi nhanh tới:</span>
        <button class="book-jump-pill" onclick="jumpToGen(1)">Giai đoạn 1: Thủy Tổ (Đời 1–7)</button>
        <button class="book-jump-pill" onclick="jumpToGen(8)">Giai đoạn 2: Trực Hệ (Đời 8–19)</button>
        <button class="book-jump-pill" onclick="jumpToGen(20)">Giai đoạn 3: Chi Cụ Chí Hòa (Đời 20–24)</button>
        <button class="book-jump-pill" onclick="toggleAllBookGens(true)">Mở tất cả</button>
        <button class="book-jump-pill" onclick="toggleAllBookGens(false)">Thu gọn</button>
      </div>

      <div class="book-cover">
        <div><div class="hoanh-phi-placa">❖ ${esc(meta.hoanhPhi || "ĐÔNG A VẠN ĐẠI • ĐỨC LƯU QUANG")} ❖</div></div>
        <div class="book-seal-big">TỘC PHẢ TRUYỀN ĐỜI • KHỞI LẬP GIA PHẢ SỐ: NGÀY VĂN HÓA VIỆT NAM 24/11/2026</div>
        <h1 class="book-title">${esc(meta.title)}</h1>
        <p class="book-sub">${esc(meta.subtitle)}</p>
        <div class="book-couplet">
          <span>“${esc(meta.couplet.top)}”</span>
          <span>“${esc(meta.couplet.bottom)}”</span>
        </div>
        <div style="margin-top:12px;font-size:0.84rem;color:#6e1414;font-style:italic;">
          Số hóa từ Gia Phả Giấy bởi hậu duệ Đời thứ 23: <strong>Trần Văn Thuần</strong> • <a href="javascript:void(0)" onclick="openTamThuModal()" style="color:#9e1b1b;font-weight:700;">Đọc Tâm Thư →</a>
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
        <h2 class="book-h2">Phần 2: Nguồn Gốc & Bước Ngoặt Lịch Sử</h2>
        <p class="book-p">${esc(meta.origin)}</p>
        <p class="book-p"><strong>Bước ngoặt đổi họ (Đời 7 → Đời 8):</strong> ${esc(meta.turningPoint)}</p>
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
        <h2 class="book-h2">Phần 4: Tộc Ước – Gia Huấn – Hương Ước Họ Trần Lãng Nam</h2>
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
    // Thu gọn nhẹ các nhánh phụ Hoàng Triều khi mới mở để cây cân đối, chữ to rõ dễ đọc ngay
    root.each(d => {
      if (d.depth >= 4 && d.depth <= 11 && !d.data.isMainLine && d.children) {
        d._children = d.children;
        d.children = null;
      }
    });

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
          ? d3.zoomIdentity.translate(width / 2, 65).scale(0.92)
          : d3.zoomIdentity.translate(110, height / 2).scale(0.92);
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
            if (mode === "ROYAL" && d.depth >= 3 && !br.includes("Vua") && !br.includes("Hoàng") && d.children) { d._children = d.children; d.children = null; }
            if (mode === "HUNGDAO" && d.depth >= 4 && !br.includes("Trần Liễu") && !br.includes("Trần Trí") && d.children) { d._children = d.children; d.children = null; }
          });
        }
        update();
        if (mode === "CHIHOA") s2TreeFn.focusId("d20_chi_hoa");
        else if (mode === "HUNGDAO") s2TreeFn.focusId("d5_tran_lieu");
        else if (mode === "ROYAL") s2TreeFn.focusId("d5_tran_canh");
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
      const spNames = m.spouses && m.spouses.length ? `Vợ/Chồng: ${m.spouses.map(s => s.name).join(", ")}` : "";
      const dateStr = [m.birth ? `S: ${formatBirth(m)}` : "", m.death ? `M: ${m.death}` : ""].filter(Boolean).join(" • ");
      ensure(m.id, {
        "full name": m.name,
        "gen": `Đời ${m.gen}${m.isMainLine ? " • Trực Hệ" : ""}`,
        "dates": [dateStr, spNames || m.role || ""].filter(Boolean).join(" | "),
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
    });

    f3ChartInstance = f3Lib.createChart("#FamilyChartContainer", Object.values(nodes))
      .setTransitionTime(500).setCardXSpacing(235).setCardYSpacing(135);

    if (typeof f3ChartInstance.setSingleParentEmptyCard === "function") f3ChartInstance.setSingleParentEmptyCard(false);
    if (typeof f3ChartInstance.setAncestryDepth === "function") f3ChartInstance.setAncestryDepth(2);
    if (typeof f3ChartInstance.setProgenyDepth === "function") f3ChartInstance.setProgenyDepth(2);

    const f3Card = f3ChartInstance.setCard(f3Lib.CardHtml)
      .setCardDisplay([["full name"], ["gen"], ["dates"]])
      .setCardDim({ w: 205, h: 82 })
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
    s3CurrentRawId = "d20_chi_hoa";
    f3ChartInstance.updateMainId("d20_chi_hoa");
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
    openMemberModal(s3CurrentRawId || "d20_chi_hoa");
  };

  // ----------------- PHONG CÁCH 4: TINH TÚ ĐÔNG A (CHỐNG ĐÈ CHỮ 100%) -----------------
  let s4Mode = "radial";
  let s4Filter = "ALL";
  let s4ZoomReset = null;

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

    // Lọc danh sách thành viên theo bộ lọc Chòm Sao
    const filtered = allMembers.filter(m => {
      if (s4Filter === "MAIN") return m.isMainLine;
      if (s4Filter === "PHASE1") return m.gen <= 12;
      if (s4Filter === "PHASE3") return m.gen >= 19 || m.id === "d1_tran_kinh";
      return true;
    });
    const fMap = new Map(filtered.map(m => [m.id, { ...m }]));
    const links = [];
    filtered.forEach(m => {
      if (m.parentId && fMap.has(m.parentId)) {
        links.push({ source: fMap.get(m.parentId), target: fMap.get(m.id), isMain: m.isMainLine });
      }
    });

    if (s4Mode === "radial") {
      const ringStep = 44;
      const byGen = {};
      fMap.forEach(node => {
        if (!byGen[node.gen]) byGen[node.gen] = [];
        byGen[node.gen].push(node);
      });
      const gens = Object.keys(byGen).map(Number).sort((a, b) => a - b);

      // Phân bổ đều 360 độ trên từng vòng đời, sắp xếp theo góc của Cha/Mẹ để đường nối mượt mà không cắt chéo
      gens.forEach((gNum, gIdx) => {
        const list = byGen[gNum];
        if (gNum === 1 || list.length === 1 && gIdx === 0) {
          list[0].angle = 0;
          list[0].radius = 0;
          list[0].gx = 0;
          list[0].gy = 0;
          return;
        }
        list.sort((a, b) => {
          const pa = a.parentId && fMap.has(a.parentId) ? (fMap.get(a.parentId).angle || 0) : 0;
          const pb = b.parentId && fMap.has(b.parentId) ? (fMap.get(b.parentId).angle || 0) : 0;
          if (Math.abs(pa - pb) > 0.001) return pa - pb;
          return (b.isMainLine ? 1 : 0) - (a.isMainLine ? 1 : 0);
        });
        const rBase = (gIdx) * ringStep;
        g.append("circle").attr("class", "s3-orbit").attr("r", rBase);

        const count = list.length;
        const startOffset = count === 1 ? (gIdx * 1.15) : ((gIdx * 0.43) % (Math.PI * 2));
        list.forEach((node, idx) => {
          const ang = startOffset + (idx / count) * Math.PI * 2;
          // So le bán kính nhẹ nếu vòng đời có nhiều người (> 8 vị) để nhãn chữ không bao giờ chạm nhau
          const stagger = count > 8 ? ((idx % 2 === 0 ? -1 : 1) * 12) : 0;
          const r = rBase + stagger;
          node.angle = ang;
          node.radius = r;
          node.gx = Math.cos(ang - Math.PI / 2) * r;
          node.gy = Math.sin(ang - Math.PI / 2) * r;
        });
      });

      g.selectAll("path.s3-link").data(links).enter().append("path")
        .attr("class", d => `s3-link ${d.isMain ? "main-line" : ""}`)
        .attr("d", d => {
          const mx = (d.source.gx + d.target.gx) / 2;
          const my = (d.source.gy + d.target.gy) / 2;
          return `M${d.source.gx},${d.source.gy} Q${mx * 0.85},${my * 0.85} ${d.target.gx},${d.target.gy}`;
        });

      const nodesArr = Array.from(fMap.values());
      const node = g.selectAll("g.s3-star").data(nodesArr).enter().append("g")
        .attr("class", "s3-star")
        .attr("transform", d => `translate(${d.gx},${d.gy})`)
        .on("click", (e, d) => openMemberModal(d.id));

      node.append("circle")
        .attr("r", d => d.gen === 1 ? 8 : (d.isMainLine ? 6 : 4.5))
        .attr("fill", d => d.userAdded ? "#34d399" : (d.isMainLine ? "#fbbf24" : (d.gender === "F" ? "#f472b6" : "#60a5fa")));

      // Thuật toán chống đè chữ (Screen-Space AABB Collision Avoidance):
      // Ưu tiên hiển thị nhãn Trực hệ & nhân vật chính, kiểm tra khung bao 2D của từng nhãn để đảm bảo 0% chồng lấn!
      const shortName = (str) => str.replace(/\s*\([^)]*\)/g, "").trim();
      node.append("text").attr("class", "s3-label")
        .attr("dy", d => d.gen === 1 ? "-12px" : "0.32em")
        .attr("x", d => d.gen === 1 ? 0 : (d.gx >= 0 ? 9 : -9))
        .attr("text-anchor", d => d.gen === 1 ? "middle" : (d.gx >= 0 ? "start" : "end"))
        .text(d => `${shortName(d.name)} (Đ${d.gen})`);

      function updateLabelVisibility(scaleK) {
        const boxes = [];
        // Ưu tiên xét các nút Trực hệ và Thủy tổ trước
        const ordered = [];
        node.each(function (d) { ordered.push({ el: this, d }); });
        ordered.sort((a, b) => (b.d.isMainLine ? 1 : 0) - (a.d.isMainLine ? 1 : 0) || a.d.gen - b.d.gen);

        ordered.forEach(({ el, d }) => {
          const txtEl = el.querySelector(".s3-label");
          if (!txtEl) return;
          const labelLen = (shortName(d.name).length + 5) * 6.4 / Math.sqrt(scaleK);
          const labelH = 14 / Math.sqrt(scaleK);
          const x1 = d.gx >= 0 ? d.gx + 8 : d.gx - 8 - labelLen;
          const y1 = d.gy - labelH / 2;
          const box = { x1, y1, x2: x1 + labelLen, y2: y1 + labelH };
          const hit = boxes.some(b => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2));
          if (!hit) {
            boxes.push(box);
            txtEl.style.opacity = "1";
          } else {
            txtEl.style.opacity = "0";
          }
        });
      }

      const zoom = d3.zoom().scaleExtent([0.25, 4.5]).on("zoom", e => {
        g.attr("transform", e.transform);
        updateLabelVisibility(e.transform.k);
      });
      svg.call(zoom);

      const maxGenIdx = Math.max(1, gens.length - 1);
      const fitScale = Math.min(1.0, Math.min(width, height - 70) * 0.41 / (maxGenIdx * ringStep || 200));
      s4ZoomReset = () => {
        svg.transition().duration(500).call(
          zoom.transform,
          d3.zoomIdentity.translate(width / 2, (height - 36) / 2).scale(Math.max(0.48, fitScale))
        );
      };
      s4ZoomReset();
      updateLabelVisibility(Math.max(0.48, fitScale));
    } else {
      // Mạng Lưới Trọng Lực (Force Graph) với lực đẩy chống chồng chữ (forceCollide)
      const nodes = Array.from(fMap.values());
      const fLinks = links.map(l => ({ source: l.source.id, target: l.target.id, isMain: l.isMain }));
      const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(fLinks).id(d => d.id).distance(72))
        .force("charge", d3.forceManyBody().strength(-260))
        .force("collide", d3.forceCollide().radius(42).iterations(2))
        .force("radial", d3.forceRadial(d => (d.gen - 1) * 32, width / 2, height / 2).strength(0.55))
        .force("center", d3.forceCenter(width / 2, height / 2));

      const zoom = d3.zoom().scaleExtent([0.25, 4]).on("zoom", e => g.attr("transform", e.transform));
      svg.call(zoom);

      const link = g.selectAll("line").data(fLinks).enter().append("line").attr("class", d => `s3-link ${d.isMain ? "main-line" : ""}`);
      const node = g.selectAll("g.s3-star").data(nodes).enter().append("g").attr("class", "s3-star")
        .on("click", (e, d) => openMemberModal(d.id))
        .call(d3.drag()
          .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
      node.append("circle").attr("r", d => d.isMainLine ? 7 : 5)
        .attr("fill", d => d.userAdded ? "#34d399" : (d.isMainLine ? "#fbbf24" : (d.gender === "F" ? "#f472b6" : "#60a5fa")));
      node.append("text").attr("class", "s3-label").attr("x", 9).attr("dy", "0.35em")
        .text(d => d.name.replace(/\s*\([^)]*\)/g, ""));

      sim.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });
      s4ZoomReset = () => svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
    }
  }
  window.s4ToggleMode = function () {
    s4Mode = s4Mode === "radial" ? "force" : "radial";
    document.getElementById("s4ModeBtn").textContent = s4Mode === "radial" ? "✦ Chuyển Mạng Lưới Trọng Lực" : "◎ Chuyển Quỹ Đạo Đồng Tâm";
    renderStyle4Graph();
  };
  window.s4ApplyFilter = function () {
    s4Filter = document.getElementById("s4FilterSelect")?.value || "ALL";
    renderStyle4Graph();
  };
  window.s4ResetZoom = () => s4ZoomReset && s4ZoomReset();

  // ----------------- PHONG CÁCH 5: BENTO DASHBOARD & TIMELINE -----------------
  let s5BranchFilter = "ALL";
  function initStyle5Bento() {
    const el = document.getElementById("style5Bento");
    const branches = ["ALL", ...new Set(allMembers.map(m => m.branch || "Chi Bổ Sung"))];
    const options = allMembers.map(m => `<option value="${esc(m.id)}">Đời ${m.gen} — ${esc(m.name)}</option>`).join("");

    el.innerHTML = `<div class="bento-wrap">
      <div class="bento-kpis">
        <div class="bento-card"><div class="kpi-val">${allMembers.length}</div><div class="kpi-lbl">Thành viên được ghi danh trong phả đồ</div></div>
        <div class="bento-card"><div class="kpi-val">${Math.max(...allMembers.map(m => m.gen))} Đời</div><div class="kpi-lbl">Từ Đức Thượng Tổ (1009) đến 2026</div></div>
        <div class="bento-card"><div class="kpi-val">${getSubmissions().length} Hồ Sơ</div><div class="kpi-lbl">Đóng góp mới từ các chi/phái chờ Admin tổng hợp</div></div>
        <div class="bento-card"><div class="kpi-val">3 Tỉnh/TP</div><div class="kpi-lbl">Ninh Bình • Hà Nội • Bảo Lộc (Lâm Đồng)</div></div>
      </div>

      <div class="bento-card" style="border-color:rgba(212,175,55,0.45);background:linear-gradient(145deg,rgba(139,30,30,0.22),rgba(15,23,42,0.75));">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <h3 style="font-size:16.5px;color:#fcd34d;">👑 Bảng Vàng Danh Dự Hoàng Tộc & Danh Tướng Nhà Trần (Hall of Fame)</h3>
          <span style="font-size:12px;opacity:0.8;">Nhấp vào từng thẻ để xem Bia Ký & Nguồn sử liệu</span>
        </div>
        <div class="hof-grid">
          ${(window.HALL_OF_FAME || []).map(item => {
            const m = membersById[item.memberId];
            return `<div class="hof-card" onclick="openMemberModal('${esc(item.memberId)}')">
              <div class="hof-badges-row">
                <span class="hof-badge">${esc(item.badge)}</span>
                <span class="hof-badge secondary">${esc(item.category)}</span>
              </div>
              <div style="font-family:var(--font-serif);font-weight:700;font-size:15px;color:#fff;margin-bottom:4px;">${esc(m ? m.name : item.badge)}</div>
              <div style="font-size:12.5px;opacity:0.86;line-height:1.5;">${esc(item.highlight)}</div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="bento-grid-2">
        <div class="bento-card" style="border-color:rgba(251,191,36,0.35);background:linear-gradient(145deg,rgba(120,53,15,0.28),rgba(30,41,59,0.65));">
          <h3 style="margin-bottom:12px;font-size:16px;color:#fcd34d;">🏆 Sổ Vàng Hào Khí Đông A — Danh Ngôn Bất Hủ</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${(window.GOLDEN_BOOK?.quotes || []).map(q => `<div class="meta-box" style="border-left:3px solid #fbbf24;">
              <div style="font-family:var(--font-serif);font-style:italic;font-size:14px;color:#fef3c7;">${esc(q.quote)}</div>
              <div style="font-size:11.5px;opacity:0.82;margin-top:4px;">— ${esc(q.author)} <span style="opacity:0.7;">(${esc(q.source)})</span></div>
            </div>`).join("")}
          </div>
        </div>

        <div class="bento-card">
          <h3 style="margin-bottom:12px;font-size:16px;">🏛️ Quần Thể Di Sản & Đền Thờ Nhà Trần</h3>
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
          <h3 style="margin-bottom:14px;font-size:16px;">⏳ Dòng Thời Gian Lịch Sử (1009 – 2026)</h3>
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

    document.getElementById("relA").value = "d1_tran_kinh";
    document.getElementById("relB").value = "d24_ngoc_anh";
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
        <div style="font-size:12px;opacity:0.75;">${esc(m.location || m.role || (m.death ? "Mất: " + m.death : "Thành viên họ Trần"))}</div>
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
      <div><strong>Tổ tiên chung gần nhất:</strong> ${lca ? `${esc(lca.name)} (Đời ${lca.gen})` : "Cùng dòng tộc họ Trần"}</div>
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
      <span class="modal-tag">PHIẾU BỔ SUNG GIA PHẢ HỌ TRẦN</span>
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
            <option value="">-- Chọn Cha/Mẹ (hoặc để trống) --</option>
            ${parentOptions}
          </select>
        </div>
        <div>
          <label class="form-label">Họ và tên *</label>
          <input id="cfName" class="form-input" type="text" value="${target ? esc(target.name) : ""}" placeholder="VD: Trần Văn An" required />
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
          <input id="cfSender" class="form-input" type="text" placeholder="VD: Trần Văn Minh — Chi 3 — ĐT: 0912..." />
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
    const parentId = document.getElementById("cfParent").value || (action === "add" ? "d20_chi_hoa" : null);
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
      `[BỔ SUNG GIA PHẢ HỌ TRẦN LÃNG NAM]`,
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
    const title = encodeURIComponent(`[Gia Phả Họ Trần] ${p.action === "edit" ? "Sửa" : "Thêm"}: ${p.member.name} (Đời ${p.member.gen})`);
    const body = encodeURIComponent(formatPayloadText(p) + "\n\n```json\n" + JSON.stringify(p.member, null, 2) + "\n```");
    window.open(`https://github.com/lephucnhat/lephucnhat.github.io/issues/new?title=${title}&body=${body}`, "_blank", "noopener");
  };

  // ----------------- BẢNG QUẢN TRỊ ADMIN & NHẬP/XUẤT DỮ LIỆU -----------------
  const ADMIN_KEY = "TRANTHUAN23";
  const SS_ADMIN_AUTH = "tran_gia_pha_admin_unlocked_v1";

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
    let content = "", filename = "gia-pha-ho-tran", mime = "text/plain;charset=utf-8";
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

    // Chuỗi Mạch Nguồn Huyết Thống từ Đời 1 -> vị hiện tại (Tự động rút gọn nếu > 7 đời để không chiếm chỗ nút bấm)
    const lineageChain = [];
    let curNode = m;
    while (curNode) {
      lineageChain.unshift(curNode);
      curNode = curNode.parentId ? membersById[curNode.parentId] : null;
    }
    const renderStep = node => `<span class="lineage-step" onclick="openMemberModal('${esc(node.id)}')">Đ${node.gen}: ${esc(node.gen === 1 ? "Đức Thượng Tổ" : node.name.replace(/\s*\([^)]*\)/g, ""))}</span>`;
    let chainHtml = "";
    if (lineageChain.length <= 7) {
      chainHtml = lineageChain.map(renderStep).join(`<span style="opacity:0.5;">→</span>`);
    } else {
      const head = lineageChain.slice(0, 2).map(renderStep).join(`<span style="opacity:0.5;">→</span>`);
      const tail = lineageChain.slice(-3).map(renderStep).join(`<span style="opacity:0.5;">→</span>`);
      const full = lineageChain.map(renderStep).join(`<span style="opacity:0.5;">→</span>`);
      chainHtml = `<span id="shortChain">${head} <span class="lineage-step" style="background:rgba(212,175,55,0.22);" onclick="document.getElementById('shortChain').style.display='none';document.getElementById('fullChain').style.display='inline';">… Xem đủ ${lineageChain.length} đời …</span> ${tail}</span><span id="fullChain" style="display:none;">${full}</span>`;
    }

    document.getElementById("modalContent").innerHTML = `
      ${m.photo ? `<img class="member-avatar" src="${esc(m.photo)}" alt="${esc(m.name)}" />` : ""}
      <span class="modal-tag">ĐỜI THỨ ${m.gen} • ${esc(m.branch || "Chi Lãng Nam")}</span>
      <h2 class="modal-title">${esc(m.name)}</h2>
      <p style="font-size:13.5px;opacity:0.85;margin-bottom:10px;">${esc(m.role || (m.isMainLine ? "Trực hệ truyền thừa chi Lãng Nam" : "Thành viên Phả Chi Họ Trần"))}</p>
      <div class="lineage-path-bar">
        <strong style="color:#fcd34d;margin-right:4px;">🌿 Mạch truyền thừa:</strong> ${chainHtml}
      </div>
      <div class="modal-meta">
        <div class="meta-box"><div class="meta-lbl">Năm sinh / Năm mất</div><div class="meta-val">${formatBirth(m) ? "Sinh: " + esc(formatBirth(m)) : "—"} ${m.death ? "• Mất: " + esc(m.death) : ""} ${m.age ? "(" + esc(m.age) + ")" : ""}</div></div>
        <div class="meta-box"><div class="meta-lbl">Địa bàn / Lăng tẩm</div><div class="meta-val">${esc(m.location || "Làng Lãng Nam (Đồng Thái, Ninh Cường)")}</div></div>
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
    const clanItems = [];
    const royalItems = [];
    const parseLunarSort = (str) => {
      const s = String(str);
      // Ưu tiên bắt "18 tháng Giêng" hoặc "dd/mm ÂL" trước
      if (/tháng\s*Giêng/i.test(s)) {
        const dMatch = s.match(/(\d{1,2})\s*tháng\s*Giêng/i);
        return 100 + (dMatch ? Number(dMatch[1]) : 1);
      }
      const alMatch = s.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*(?:\/19\d\d|\/20\d\d)?\s*\(?ÂL/i);
      if (alMatch) return Number(alMatch[2]) * 100 + Number(alMatch[1]);
      const m = s.match(/^(\d{1,2})\s*\/\s*(\d{1,2})(?!\s*\/\s*1[23]\d\d)/);
      if (m) return Number(m[2]) * 100 + Number(m[1]);
      return 9999;
    };

    allMembers.forEach(m => {
      const isRoyal = m.gen <= 12;
      if (m.death) {
        const sk = parseLunarSort(m.death);
        const rec = { name: m.name, gen: `Đời ${m.gen}`, date: m.death, extra: m.age || m.role || "", sortKey: sk };
        if (isRoyal) {
          if (/ÂL|tháng\s*Giêng/i.test(m.death) && sk < 9999) royalItems.push(rec);
        } else {
          clanItems.push(rec);
        }
      }
      if (m.spouses) {
        m.spouses.forEach(s => {
          if (s.death) {
            const sk = parseLunarSort(s.death);
            clanItems.push({ name: s.name, gen: `Phối ngẫu Đời ${m.gen}`, date: s.death, extra: s.note || "", sortKey: sk });
          }
        });
      }
    });
    clanItems.sort((a, b) => a.sortKey - b.sortKey);
    royalItems.sort((a, b) => a.sortKey - b.sortKey);

    const renderList = (arr) => arr.map(it => `<div class="meta-box" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <div><strong>${esc(it.name)}</strong><div style="font-size:11.5px;opacity:0.75;">${esc(it.gen)} ${it.extra ? "• " + esc(it.extra) : ""}</div></div>
      <span style="color:#fcd34d;font-weight:700;font-size:13px;white-space:nowrap;">${esc(it.date)}</span>
    </div>`).join("");

    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">SỔ VÀNG GIỖ CHẠP & NGÀY KỴ ÂM LỊCH</span>
      <h2 class="modal-title">Lịch Giỗ Tổ Tiên Họ Trần (Tháng Giêng → Tháng Chạp)</h2>
      <div style="font-weight:700;font-size:13.5px;color:#fcd34d;margin:12px 0 8px;">🕯️ I. Lịch Giỗ Chạp Gia Tộc Họ Trần Lãng Nam (Đời 19 – Đời 24)</div>
      <div style="display:flex;flex-direction:column;gap:7px;">${renderList(clanItems)}</div>
      <div style="font-weight:700;font-size:13.5px;color:#38bdf8;margin:16px 0 8px;">👑 II. Ngày Kỵ Âm Lịch Các Bậc Tiên Đế & Danh Tướng Hoàng Triều</div>
      <div style="display:flex;flex-direction:column;gap:7px;">${renderList(royalItems)}</div>
      <div class="btn-row">
        <button class="btn-primary" onclick="openContributeModal()">+ Bổ sung ngày giỗ còn thiếu</button>
        <button class="btn-secondary" onclick="window.print()">🖨️ In Lịch Giỗ</button>
      </div>
    `;
    document.getElementById("globalModal").classList.add("open");
  };

  window.openIncenseModal = function () {
    const count = Number(localStorage.getItem("tran_gia_pha_incense_v1") || 108);
    let notes = [];
    try { notes = JSON.parse(localStorage.getItem("tran_gia_pha_guestbook_v1") || "[]"); } catch {}
    document.getElementById("modalContent").innerHTML = `
      <span class="modal-tag">TỪ ĐƯỜNG SỐ HỌ TRẦN LÃNG NAM</span>
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
    const next = Number(localStorage.getItem("tran_gia_pha_incense_v1") || 108) + 1;
    localStorage.setItem("tran_gia_pha_incense_v1", String(next));
    const el = document.getElementById("incenseCount");
    const sticks = document.getElementById("incenseSticks");
    if (el) el.textContent = next;
    if (sticks) sticks.classList.add("lit");
    showToast("🙏 Đã dâng hương thành kính lên Tổ Tiên Họ Trần!");
  };

  window.addGuestbookEntry = function (e) {
    e.preventDefault();
    const name = document.getElementById("gbName").value.trim();
    const branch = document.getElementById("gbBranch").value.trim() || "Con cháu họ Trần";
    const msg = document.getElementById("gbMsg").value.trim();
    if (!name || !msg) return;
    let notes = [];
    try { notes = JSON.parse(localStorage.getItem("tran_gia_pha_guestbook_v1") || "[]"); } catch {}
    notes.unshift({ name, branch, msg, date: new Date().toLocaleDateString("vi-VN") });
    localStorage.setItem("tran_gia_pha_guestbook_v1", JSON.stringify(notes));
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
    showToast("🔊 Đang đọc Tâm Thư của hậu duệ Trần Văn Thuần...");
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
      <p style="font-size:13px;opacity:0.85;margin-bottom:14px;">Website Gia Phả Số Họ Trần Lãng Nam kế thừa tinh hoa từ các dự án mã nguồn mở phả hệ trên GitHub & chuẩn UX từ lephucnhat.vn:</p>
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
  switchStyle(initialStyle >= 1 && initialStyle <= 5 ? initialStyle : 1);
  if (memberMatch && membersById[memberMatch[1]]) {
    setTimeout(() => openMemberModal(memberMatch[1]), 150);
  }
})();
