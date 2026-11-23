/**
 * LIÊN HOA CHAY — TRỢ LÝ ẨM THỰC CHAY & TRẠM QUẢN TRỊ KHÓA AI BẢO MẬT (CÁCH A)
 * ==============================================================================
 * - Bảo mật 100%: KHÔNG nhúng khóa API công khai trong mã nguồn GitHub Pages.
 * - Khách vãng lai: Dùng Bộ Tri Thức Ẩm Thực Liên Hoa (miễn phí, phản hồi tức thì).
 * - Quản trị viên: Mở bằng URL `?admin=1` hoặc nhấn `Ctrl + Shift + A` (hoặc chạm 3 lần
 *   vào dòng bản quyền ở cuối trang) để nhập khóa DeepSeek/Gemini vào localStorage riêng.
 */
(() => {
  "use strict";

  const STORAGE_AI_KEY = "lienhoa_ai_config_v1";
  let aiConfig = {
    provider: "auto",
    deepseekKey: "",
    geminiKey: ""
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_AI_KEY) || "null");
    if (saved && typeof saved === "object") {
      aiConfig = {
        provider: saved.provider || "auto",
        deepseekKey: (saved.deepseekKey || "").trim(),
        geminiKey: (saved.geminiKey || "").trim()
      };
    }
  } catch {
    /* ignore */
  }

  const isAdminMode = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("admin") === "1" || Boolean(aiConfig.deepseekKey || aiConfig.geminiKey);
  };

  function saveAiConfig() {
    try {
      localStorage.setItem(STORAGE_AI_KEY, JSON.stringify(aiConfig));
    } catch {
      /* ignore */
    }
    updateAiBadges();
  }

  function clearAiConfig() {
    aiConfig = { provider: "auto", deepseekKey: "", geminiKey: "" };
    try {
      localStorage.removeItem(STORAGE_AI_KEY);
    } catch {
      /* ignore */
    }
    updateAiBadges();
  }

  function updateAiBadges() {
    const btn = document.getElementById("btnOpenAiKeyModal");
    const badge = document.getElementById("headerAiStatusText");
    const modalStatus = document.getElementById("aiModalStatusBanner");
    const hasD = Boolean(aiConfig.deepseekKey);
    const hasG = Boolean(aiConfig.geminiKey);

    if (btn) {
      btn.style.display = isAdminMode() ? "inline-flex" : "none";
    }
    if (badge) {
      badge.textContent = hasD || hasG ? "Admin AI" : "Khóa AI";
    }
    if (modalStatus) {
      if (hasD && hasG) {
        modalStatus.innerHTML = "⚡ <strong>Chế độ Quản Trị Viên:</strong> Đang kết nối <strong>Dual-AI (DeepSeek + Gemini)</strong> từ trình duyệt của bạn.";
      } else if (hasD) {
        modalStatus.innerHTML = "⚡ <strong>Chế độ Quản Trị Viên:</strong> Đang kết nối <strong>DeepSeek AI</strong> từ trình duyệt của bạn.";
      } else if (hasG) {
        modalStatus.innerHTML = "⚡ <strong>Chế độ Quản Trị Viên:</strong> Đang kết nối <strong>Google Gemini AI</strong> từ trình duyệt của bạn.";
      } else {
        modalStatus.innerHTML = "🔒 <strong>Bảo mật an toàn:</strong> Chưa lưu khóa API. Trang web đang dùng Bộ Tri Thức Liên Hoa nội bộ (không lộ khóa).";
      }
    }
  }

  function buildSystemPrompt() {
    const d = window.LIENHOA_DATA;
    const menuLines = (d?.menu || [])
      .map((m) => `- ${m.name}: ${m.price.toLocaleString("vi-VN")}đ (${m.desc})`)
      .join("\n");
    const setLines = (d?.cateringSets || [])
      .map((s) => `- ${s.name} (${s.guests}): ${s.price.toLocaleString("vi-VN")}đ (${s.desc})`)
      .join("\n");

    return `Bạn là Trợ Lý Ẩm Thực Chay AI của NHÀ HÀNG CHAY LIÊN HOA (Hải Dương).
Slogan: "Ăn an lành - Sống hạnh phúc".
Địa chỉ: Lô 94.7 Đường Trường Chinh (Đối diện Hoàng Quốc Việt), P. Tứ Minh, TP. Hải Dương.
Giờ đón khách: 11:00 – 13:30 & 18:00 – 20:30.
Hotline: 0933.286.133 (Ms. Thạo) - 090.418.4986 | Zalo đặt bàn: 0904.184.986.

Thực đơn:
${menuLines}

Mâm cỗ chay:
${setLines}

Trả lời ngắn gọn, ấm áp, đúng món và giá. Nếu khách hỏi bằng tiếng Trung, hãy trả lời bằng tiếng Trung kèm tên món song ngữ.`;
  }

  function localSmartKnowledge(question) {
    const q = (question || "").toLowerCase();
    const isZh = /[\u4e00-\u9fa5]/.test(question);

    if (isZh) {
      return `🪷 <strong>海阳莲花素食顾问为您推荐：</strong><br>
• <strong>莲花雪耳嫩豆腐 (Tàu Hũ Liên Hoa Sốt Nấm Tuyết)</strong> — 65.000đ（招牌必点，嫩滑清润）<br>
• <strong>莲花珍菌养生火锅 (Lẩu Nấm Liên Hoa Thập Cẩm Quý)</strong> — 249.000đ（8小时蔬果慢熬高汤，适合3-4人）<br>
• <strong>鲜荷叶莲子蒸饭 (Cơm Hạt Sen Gói Lá Sen Tươi)</strong> — 85.000đ（清香安神）<br>
• <strong>莲花草本梅子冰茶 (Trà Mận Thảo Mộc)</strong> × 4 — 156.000đ<br>
💰 <strong>预计总计：555.000đ</strong>（4人聚餐人均约 139.000đ）。<br>
⏰ 营业时间：11:00 – 13:30 & 18:00 – 20:30 | 📞 热线：0933.286.133 • Zalo: 0904.184.986`;
    }

    if (q.includes("cỗ") || q.includes("rằm") || q.includes("giỗ") || q.includes("tiệc")) {
      return `🪷 <strong>Gợi ý Mâm Cỗ Chay Trang Nghiêm tại Liên Hoa Chay:</strong><br>
• <strong>Mâm Cỗ Chay An Lạc (4–6 người): 500.000đ</strong> — Gọn gàng, thanh tịnh (6–7 món).<br>
• <strong>Mâm Cỗ Chay Cúng Rằm Truyền Thống (6–8 người): 650.000đ</strong> — Trọn gói 8 món bày biện trang nghiêm.<br>
• <strong>Mâm Cỗ Chay Hưng Thịnh (8–10 người): 800.000đ</strong> — Đầy đặn món ký danh kèm lẩu nấm/canh bát bảo.<br>
• <strong>Mâm Cỗ Chay Đại Cát Thượng Hạng (10 người): 1.000.000đ</strong> — Hội tụ nấm quý.<br>
🌿 Giao nóng tận nơi đúng giờ cúng lễ tại TP. Hải Dương. Nhắn Zalo <strong>0904.184.986</strong> hoặc gọi <strong>0933.286.133 (Ms. Thạo)</strong> để đặt trước!`;
    }

    if (q.includes("lớn tuổi") || q.includes("dưỡng sinh") || q.includes("nhạt") || q.includes("bố mẹ") || q.includes("ông bà")) {
      return `🌿 <strong>Thực đơn Dưỡng Sinh Thanh Đạm cho Người Lớn Tuổi:</strong><br>
• <strong>Tàu Hũ Liên Hoa Sốt Nấm Tuyết (65.000đ):</strong> Đậu hũ non mềm mịn, giàu đạm thực vật dễ tiêu.<br>
• <strong>Cơm Hạt Sen Gói Lá Sen Tươi (85.000đ):</strong> Hạt sen giúp an thần, ngủ ngon.<br>
• <strong>Đậu Hũ Non Sốt Nấm Đông Cô (68.000đ):</strong> Mềm mượt, ấm bụng.<br>
• <strong>Canh Dưỡng Sinh Củ Sen & Nấm Tươi (65.000đ):</strong> Ngọt thanh tự nhiên không mì chính.<br>
• <strong>Ấm Trà Hoa Cúc Mật Ong Thảo Mộc (45.000đ):</strong> Thư giãn nhẹ nhàng.<br>
💰 <strong>Tổng combo dưỡng sinh: 328.000đ</strong> (Phù hợp 3–4 người).`;
    }

    if (q.includes("buffet") || q.includes("rẻ") || q.includes("bao nhiêu")) {
      return `🍱 <strong>Suất Buffet Chay Liên Hoa Hàng Ngày chỉ 119.000đ/người lớn:</strong><br>
• Hơn <strong>35+ món chay thanh tịnh</strong> thay đổi theo ngày (khai vị, gỏi, món kho, xào, cơm sen, bún/mì, canh dưỡng sinh) kèm quầy chè và tráng miệng miễn phí.<br>
⏰ Giờ đón khách: <strong>11:00 – 13:30 & 18:00 – 20:30</strong> | Zalo: <strong>0904.184.986</strong> • Hotline: <strong>0933.286.133</strong>.`;
    }

    return `🪷 <strong>Combo Gia Đình Sum Vầy 4 Người Bán Chạy Nhất Tại Liên Hoa Chay:</strong><br>
• <strong>Lẩu Nấm Liên Hoa Thập Cẩm Quý (249.000đ):</strong> Nước dùng ninh 8 tiếng từ củ sen, ngô ngọt, mía lau cùng nhiều nấm quý.<br>
• <strong>Tàu Hũ Liên Hoa Sốt Nấm Tuyết (65.000đ):</strong> Món ký danh số 1 của quán.<br>
• <strong>Gỏi Ngó Sen Hoa Chuối Phù Trúc (69.000đ):</strong> Giòn mát, thanh nhiệt.<br>
• <strong>Chả Giò Nấm Liên Hoa Giòn Rụm (60.000đ):</strong> Nhân nấm hương & khoai môn bùi dẻo.<br>
💰 <strong>Tổng tạm tính: 443.000đ</strong> (~110.000đ/người) — Hoặc chọn <strong>Buffet Chay 35+ Món chỉ 119.000đ/người</strong>!<br>
⏰ Giờ đón khách: <strong>11:00 – 13:30 & 18:00 – 20:30</strong> | Zalo: <strong>0904.184.986</strong> • Hotline: <strong>0933.286.133</strong>`;
  }

  async function askLienHoaAI(userQuestion) {
    const sys = buildSystemPrompt();
    const dKey = aiConfig.deepseekKey;
    const gKey = aiConfig.geminiKey;
    const pref = aiConfig.provider || "auto";

    if ((pref === "deepseek" || pref === "auto") && dKey && dKey.startsWith("sk-")) {
      try {
        const resp = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: sys },
              { role: "user", content: userQuestion }
            ],
            temperature: 0.65
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            return `<div class="ai-badge-source">⚡ DeepSeek AI • Chế độ Quản Trị</div>` + text.replace(/\n/g, "<br>");
          }
        }
      } catch {
        /* fallback */
      }
    }

    if ((pref === "gemini" || pref === "auto") && gKey) {
      for (const m of ["gemini-2.0-flash", "gemini-1.5-flash"]) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(gKey)}`;
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `${sys}\n\nKhách hỏi: ${userQuestion}` }] }],
              generationConfig: { temperature: 0.65 }
            })
          });
          if (resp.ok) {
            const data = await resp.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return `<div class="ai-badge-source">✨ Gemini AI • Chế độ Quản Trị</div>` + text.replace(/\n/g, "<br>");
            }
          }
        } catch {
          /* continue */
        }
      }
    }

    return `<div class="ai-badge-source">🪷 Trợ Lý Tri Thức Liên Hoa Chay</div>` + localSmartKnowledge(userQuestion);
  }

  function initAiEvents() {
    updateAiBadges();

    const modal = document.getElementById("aiKeyModalOverlay");
    const openBtn = document.getElementById("btnOpenAiKeyModal");
    const closeBtn = document.getElementById("btnCloseAiKeyModal");

    const openModal = () => {
      if (!modal) return;
      document.getElementById("aiProviderSelect").value = aiConfig.provider || "auto";
      document.getElementById("inputDeepseekKey").value = aiConfig.deepseekKey || "";
      document.getElementById("inputGeminiKey").value = aiConfig.geminiKey || "";
      updateAiBadges();
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    };

    openBtn?.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Phím tắt bí mật cho Quản trị viên: Ctrl + Shift + A
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        openModal();
      }
    });

    // Chạm 3 lần vào dòng bản quyền cuối trang để mở trên điện thoại
    const footerCopy = document.querySelector(".footer-bottom p");
    let tapCount = 0;
    let tapTimer = null;
    footerCopy?.addEventListener("click", () => {
      tapCount += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 900);
      if (tapCount >= 3) {
        tapCount = 0;
        openModal();
      }
    });

    document.getElementById("btnSaveAiKeys")?.addEventListener("click", () => {
      aiConfig.provider = document.getElementById("aiProviderSelect").value;
      aiConfig.deepseekKey = document.getElementById("inputDeepseekKey").value.trim();
      aiConfig.geminiKey = document.getElementById("inputGeminiKey").value.trim();
      saveAiConfig();
      closeModal();
    });

    document.getElementById("btnClearAiKeys")?.addEventListener("click", () => {
      document.getElementById("inputDeepseekKey").value = "";
      document.getElementById("inputGeminiKey").value = "";
      clearAiConfig();
    });

    const form = document.getElementById("aiChatForm");
    const input = document.getElementById("aiChatInput");
    const output = document.getElementById("aiChatResponseBox");

    async function handleQuestion(q) {
      if (!q || !output) return;
      output.innerHTML = `<div class="ai-loading">🪷 Trợ lý Liên Hoa đang chuẩn bị gợi ý thực đơn cho bạn...</div>`;
      const ans = await askLienHoaAI(q);
      const isZh = /[\u4e00-\u9fa5]/.test(q);
      const btnText = isZh
        ? "🛒 一键将招牌推荐组合加入餐盘"
        : "🛒 Thêm Nhanh Combo Gợi Ý Vào Mâm";
      output.innerHTML = `
        <div class="ai-answer-content">${ans}</div>
        <div style="margin-top:12px;">
          <button type="button" class="btn-spotlight-add" data-add-dish="lau-nam-lien-hoa">${btnText}</button>
        </div>
      `;
    }

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = (input?.value || "").trim();
      if (!q) return;
      handleQuestion(q);
    });

    document.querySelectorAll("[data-ai-prompt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = btn.getAttribute("data-ai-prompt");
        if (input) input.value = q;
        handleQuestion(q);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAiEvents);
  } else {
    initAiEvents();
  }
})();
