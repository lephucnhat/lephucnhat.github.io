/**
 * TRỢ LÝ AI LÊ PHÚC NHẬT (lephucnhat.vn) — CHUẨN BẢO MẬT ZERO-LEAK
 * Đồng bộ nhận diện: Hiểu Sâu • Sống Tỉnh • Hành Đúng
 * Chủ tịch HĐQT HTX Lâm Nghiệp Bền Vững Keo Sơn • Chuyên gia AI Thực Chiến Xứ Cùa, Quảng Trị
 * Bảo mật 100%: Không nhúng khóa API công khai trong mã nguồn tĩnh.
 * Tự động đồng bộ khóa API từ localStorage của lephucnhat.vn (nếu quản trị viên đã cấu hình).
 */
(function () {
  'use strict';

  // Chống khởi tạo trùng nếu trang nhúng nhiều lần
  if (window.__LPN_SUBPAGE_AI_INIT__) return;
  window.__LPN_SUBPAGE_AI_INIT__ = true;

  const FALLBACK_AVATAR_SVG = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23042f24%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23064e3b%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22gold%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23fde68a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23f59e0b%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Ccircle%20cx%3D%22100%22%20cy%3D%22100%22%20r%3D%2296%22%20fill%3D%22url(%23bg)%22%20stroke%3D%22url(%23gold)%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22100%22%20y%3D%22115%22%20text-anchor%3D%22middle%22%20fill%3D%22url(%23gold)%22%20font-family%3D%22Georgia%2C%20serif%22%20font-weight%3D%22bold%22%20font-size%3D%2256%22%3ELPN%3C%2Ftext%3E%3C%2Fsvg%3E";
  const AVATAR_URL = "../111.jpg";

  function safeGet(k, fb = '') {
    try { return localStorage.getItem(k) || fb; } catch (e) { return fb; }
  }
  function safeSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  }
  function safeRemove(k) {
    try { localStorage.removeItem(k); } catch (e) {}
  }

  const AI_CONFIG = {
    provider: safeGet('lpn_sub_ai_provider', 'auto'),
    deepseekKey: safeGet('lpn_deepseek_api_key', ''),
    geminiKey: safeGet('lpn_gemini_api_key', ''),
    geminiModel: 'gemini-2.5-flash',
    deepseekModel: 'deepseek-chat',
    maxHistory: 10
  };

  const SYSTEM_KNOWLEDGE = `
Bạn là Trợ lý AI chính thức của anh Lê Phúc Nhật (Hiểu Sâu • Sống Tỉnh • Hành Đúng) trên hệ sinh thái giáo trình 4D tại lephucnhat.vn.

THÔNG TIN CHÍNH THỨC VỀ LÊ PHÚC NHẬT:
- Họ và tên: Lê Phúc Nhật (Ngày sinh: 09/07/1982 – Tuổi Nhâm Tuất).
- Chức vụ & Vai trò:
  + Chủ tịch HĐQT HTX Lâm Nghiệp Bền Vững Keo Sơn (Thôn An Sơn, Xã Cam Lộ, Tỉnh Quảng Trị – Xứ Cùa).
  + Kiến Trúc Sư Hệ Thống Nội Dung & AI Thực Chiến (36+ mô-đun tự động hóa, vận hành mạng lưới đa kênh).
  + Chuyên Gia Lâm Nghiệp & Dược Liệu Sạch Xứ Cùa (Cây giống Keo lai chuẩn nguồn, Cao An Xoa, Cao Chè Vằng, Bột Ngũ Cốc dinh dưỡng).
- Gia đình: MỘT người vợ hiền (cô giáo mầm non trường Lê Thế Hiếu) và HAI cô con gái yêu thương.
- Triết lý định danh: "Hiểu sâu để thấy bản chất – Sống tỉnh để giữ bình an – Hành đúng để tạo giá trị" • "Hạnh phúc từ Tử tế – Tử tế để Hạnh phúc • Kiến tạo giá trị thực từ Gốc!".
- Kênh kết nối chính thức:
  + Website: https://lephucnhat.vn/
  + Facebook: https://www.facebook.com/lephucnhat.vn (7.3K+ Followers)
  + YouTube: https://www.youtube.com/@LePhucNhatOfficial
  + TikTok: https://www.tiktok.com/@kyluat.tritue.chuyenhoa
  + Email: lephucnhat.vn@gmail.com

KIẾN THỨC HỆ THỐNG BÀI GIẢNG 4D TRÊN LEPHUCNHAT.VN:
1. Bác Sĩ Glenn Cunningham – Đôi Chân Thần Tốc AI: Vượt nghịch cảnh đôi chân bỏng nặng năm 7 tuổi để lập kỷ lục thế giới chạy 1 dặm (4:06.8). Ứng dụng nội lực tỉnh thức kết hợp đôi cánh AI.
2. Bí Mật Của May Mắn Thật Sự: "May mắn là khi sự chuẩn bị gặp gỡ cơ hội" (Seneca). Gieo 7 đức tính và làm chủ Công thức Lệnh Vàng AI 4 bước (Vai trò + Việc cần làm + Bối cảnh + Định dạng).
3. Bản Chỉ Huy Tâm Thức Siêu Chuyên Cơ A388: Tháp 6 tầng nhận thức (Môi trường -> Hành vi -> Năng lực -> Niềm tin/Giá trị -> Nhân dạng -> Sứ mệnh), làm chủ buồng lái cuộc đời.
4. Nền Tảng Giá Trị & Di Sản 4D: Quy luật Sông Nile & Biển Chết (cho đi để trường tồn), Lãi kép 1% mỗi ngày, Ba bộ lọc Socrates và kiến tạo di sản bền vững.
5. Từ Vấp Ngã Đến Người Gieo Rừng: Chuyển hóa biến cố 0,8 ha rừng năm 2016 tại Cam Lộ thành hành trình ươm mầm rừng bền vững và phụng sự cộng đồng.

Hãy trả lời ấm áp, sâu sắc, súc tích, chân thành bằng tiếng Việt. Tuyệt đối không cung cấp bất kỳ số tài khoản ngân hàng nào.
`;

  let chatHistory = [
    {
      role: 'assistant',
      content: 'Xin chào quý bạn hữu! Tôi là **Trợ lý AI của anh Lê Phúc Nhật (Hiểu Sâu • Sống Tỉnh • Hành Đúng)**. Bạn muốn trao đổi sâu hơn về nội dung bài giảng 4D này, hệ sinh thái **HTX Lâm Nghiệp Keo Sơn**, **AI Thực Chiến** hay kết nối trực tiếp cùng anh Nhật tại **lephucnhat.vn** ạ?'
    }
  ];

  function formatMarkdown(text) {
    if (!text) return '';
    let html = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#fde047; text-decoration:underline;">$1</a>');
    html = html.replace(/\n\n+/g, '<br><br>').replace(/\n/g, '<br>');
    return html;
  }

  function getSmartFallbackReply(question) {
    const q = question.toLowerCase();

    if (q.includes('sông nile') || q.includes('biển chết') || q.includes('cho đi') || q.includes('di sản')) {
      return `🌊 <strong>Quy Luật Cho Đi Để Trường Tồn &amp; Kiến Tạo Di Sản 4D:</strong><br><br>` +
        `• <strong>Sông Nile</strong> đón nhận nguồn nước rồi hào phóng bồi đắp phù sa cho muôn loài; <strong>Biển Chết</strong> chỉ nhận mà không cho đi nên mặn chát.<br>` +
        `• Cũng như đất đỏ bazan Xứ Cùa hiến dâng dưỡng chất cho rừng xanh, người dẫn đường càng rộng lượng chia sẻ tri thức thì mạch nguồn sáng tạo càng dồi dào.<br><br>` +
        `👉 Khám phá bài giảng 30 Slide tại: <a href="../lpn-thong-diep-gia-tri-di-san-4d/" style="color:#fde047; font-weight:800;">Nền Tảng Giá Trị &amp; Di Sản 4D</a>`;
    }

    if (q.includes('cunningham') || q.includes('chạy') || q.includes('nghịch cảnh') || q.includes('bác sĩ')) {
      return `🏃‍♂️ <strong>Tiến Sĩ Glenn Cunningham – Nội Lực Tỉnh Thức &amp; Đôi Cánh AI:</strong><br><br>` +
        `• Bị bỏng nặng đôi chân năm 7 tuổi nhưng bằng kỷ luật sắt đá, ông lập kỷ lục thế giới chạy 1 dặm (4:06.8) năm 1934.<br>` +
        `• <strong>Bài học thực chiến:</strong> Xuất phát điểm hay tuổi tác chưa bao giờ là giới hạn cuối cùng khi ta kết hợp vốn sống thực tế cùng đòn bẩy Trí tuệ Nhân tạo (AI).<br><br>` +
        `👉 Xem trọn vẹn tại: <a href="../lpn-bac-si-cunningham-4d/" style="color:#fde047; font-weight:800;">Bác Sĩ Cunningham 4D</a>`;
    }

    if (q.includes('may mắn') || q.includes('cây bốn lá') || q.includes('seneca') || q.includes('lệnh vàng') || q.includes('prompt')) {
      return `🍀 <strong>Bí Mật Của May Mắn Thật Sự &amp; Công Thức Lệnh Vàng AI:</strong><br><br>` +
        `• <em>“May mắn là khi sự chuẩn bị gặp gỡ cơ hội.”</em> — Giống như vườn ươm đã làm đất kỹ sẽ bật mầm xanh mướt khi gặp mưa đầu mùa.<br>` +
        `• <strong>Công thức Lệnh Vàng 4 bước:</strong> <strong>VAI TRÒ + VIỆC CẦN LÀM + BỐI CẢNH + ĐỊNH DẠNG</strong>.<br><br>` +
        `👉 Thực hành tại: <a href="../lpn-bi-mat-may-man-4d/" style="color:#fde047; font-weight:800;">Bí Mật May Mắn 4D</a>`;
    }

    if (q.includes('a388') || q.includes('chuyên cơ') || q.includes('6 tầng') || q.includes('nhận thức')) {
      return `✈️ <strong>Bản Chỉ Huy Tâm Thức Siêu Chuyên Cơ A388:</strong><br><br>` +
        `• <strong>Tháp 6 tầng nhận thức:</strong> Môi trường → Hành vi → Năng lực → Niềm tin &amp; Giá trị → Nhân dạng → Sứ mệnh.<br>` +
        `• Giữ tâm thế Cơ trưởng tỉnh thức để điều phối cảm xúc và hành động chuẩn xác trước mọi biến động.<br><br>` +
        `👉 Mở buồng lái 16 chặng: <a href="../lpn-6-tang-nhan-thuc-v08/" style="color:#fde047; font-weight:800;">Siêu Chuyên Cơ A388</a>`;
    }

    if (q.includes('keo sơn') || q.includes('dược liệu') || q.includes('an xoa') || q.includes('chè vằng') || q.includes('ngũ cốc') || q.includes('rừng')) {
      return `🌱 <strong>HTX Lâm Nghiệp Bền Vững Keo Sơn (Xứ Cùa – Cam Lộ, Quảng Trị):</strong><br><br>` +
        `• Do anh <strong>Lê Phúc Nhật</strong> giữ vai trò Chủ tịch HĐQT.<br>` +
        `• Chuyên ươm tạo <strong>Cây giống Keo lai chuẩn nguồn</strong> chống chịu gió bão và chế biến dược liệu sạch đất đỏ bazan: <strong>Cao An Xoa, Cao Chè Vằng, Bột Ngũ Cốc dinh dưỡng</strong>.<br><br>` +
        `👉 Xem câu chuyện 4D: <a href="../nguoi-gieo-rung-4d/" style="color:#fde047; font-weight:800;">Từ Vấp Ngã Đến Người Gieo Rừng</a>`;
    }

    if (q.includes('triết lý') || q.includes('hiểu sâu') || q.includes('sống tỉnh') || q.includes('hành đúng') || q.includes('tử tế')) {
      return `🧭 <strong>Triết Lý Định Danh Của Anh Lê Phúc Nhật:</strong><br><br>` +
        `• <strong>Hiểu Sâu:</strong> Nhìn thấu bản chất và quy luật nhân quả từ gốc.<br>` +
        `• <strong>Sống Tỉnh:</strong> Giữ tâm bình an, sáng suốt giữa dòng chảy số.<br>` +
        `• <strong>Hành Đúng:</strong> Làm chuẩn mực, tận tâm tạo ra giá trị thực.<br>` +
        `• <em>“Hạnh phúc từ Tử tế – Tử tế để Hạnh phúc • Kiến tạo giá trị thực từ Gốc!”</em>`;
    }

    if (q.includes('gia đình') || q.includes('vợ') || q.includes('con') || q.includes('tiểu sử') || q.includes('sinh năm')) {
      return `🏡 <strong>Chân Dung &amp; Tổ Ấm Gia Đình Anh Lê Phúc Nhật:</strong><br><br>` +
        `• Sinh ngày <strong>09/07/1982</strong> (Nhâm Tuất), quê hương tại <strong>Thôn An Sơn, Xã Cam Lộ, Tỉnh Quảng Trị (Xứ Cùa)</strong>.<br>` +
        `• Hậu phương bình yên và tự hào nhất: <strong>MỘT người vợ hiền</strong> (cô giáo mầm non trường Lê Thế Hiếu) và <strong>HAI con gái</strong> yêu thương.`;
    }

    return `🤝 <strong>Kết nối trực tiếp cùng anh Lê Phúc Nhật:</strong><br><br>` +
      `• <strong>Trang chủ Hệ sinh thái:</strong> <a href="https://lephucnhat.vn/" style="color:#fde047; font-weight:800;">lephucnhat.vn</a><br>` +
      `• <strong>Facebook (7.3K+ Followers):</strong> <a href="https://www.facebook.com/lephucnhat.vn" target="_blank" rel="noopener" style="color:#fde047;">facebook.com/lephucnhat.vn</a><br>` +
      `• <strong>YouTube:</strong> <a href="https://www.youtube.com/@LePhucNhatOfficial" target="_blank" rel="noopener" style="color:#fde047;">@LePhucNhatOfficial</a><br>` +
      `• <strong>Email:</strong> <a href="mailto:lephucnhat.vn@gmail.com" style="color:#fde047;">lephucnhat.vn@gmail.com</a>`;
  }

  async function callDeepSeekAPI(messages) {
    if (!AI_CONFIG.deepseekKey || AI_CONFIG.deepseekKey.length < 10) throw new Error('No DeepSeek key');
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.deepseekKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.deepseekModel,
        messages: [{ role: 'system', content: SYSTEM_KNOWLEDGE }, ...messages.slice(-AI_CONFIG.maxHistory)],
        temperature: 0.7,
        max_tokens: 650
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async function callGeminiAPI(messages) {
    if (!AI_CONFIG.geminiKey || AI_CONFIG.geminiKey.length < 15) throw new Error('No Gemini key');
    const contents = messages.slice(-AI_CONFIG.maxHistory).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.geminiModel}:generateContent?key=${AI_CONFIG.geminiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_KNOWLEDGE }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 650 }
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async function requestAIResponse(userText) {
    chatHistory.push({ role: 'user', content: userText });
    const hasD = AI_CONFIG.deepseekKey && AI_CONFIG.deepseekKey.length > 10;
    const hasG = AI_CONFIG.geminiKey && AI_CONFIG.geminiKey.length > 15;

    if (hasD || hasG) {
      const order = AI_CONFIG.provider === 'deepseek' ? ['deepseek', 'gemini'] : ['gemini', 'deepseek'];
      for (const p of order) {
        try {
          if (p === 'deepseek' && hasD) {
            const reply = await callDeepSeekAPI(chatHistory);
            if (reply) return { reply, isHtml: false };
          } else if (p === 'gemini' && hasG) {
            const reply = await callGeminiAPI(chatHistory);
            if (reply) return { reply, isHtml: false };
          }
        } catch (err) {
          // Auto-fallback to next provider or local knowledge
        }
      }
    }
    return { reply: getSmartFallbackReply(userText), isHtml: true };
  }

  function renderAIAssistant() {
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'ai-fab-launcher';
    fab.id = 'aiFabLauncher';
    fab.setAttribute('aria-label', 'Mở trợ lý AI Lê Phúc Nhật');
    fab.innerHTML = `
      <div class="ai-fab-icon-box">
        <span class="ai-fab-pulse-ring"></span>
        <span>✨</span>
      </div>
      <div class="ai-fab-text">
        <span class="ai-fab-title">Hỏi Lê Phúc Nhật</span>
        <span class="ai-fab-sub">Hiểu sâu • Sống tỉnh • Hành đúng</span>
      </div>
    `;

    const chatWin = document.createElement('div');
    chatWin.className = 'ai-chat-window';
    chatWin.id = 'aiChatWindow';
    chatWin.setAttribute('role', 'dialog');
    chatWin.setAttribute('aria-label', 'Cửa sổ trò chuyện Trợ lý AI Lê Phúc Nhật');
    chatWin.innerHTML = `
      <div class="ai-chat-header">
        <div class="ai-chat-profile">
          <div class="ai-avatar">
            <img src="${AVATAR_URL}" alt="Lê Phúc Nhật" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR_SVG}';">
            <span class="ai-online-dot"></span>
          </div>
          <div class="ai-profile-meta">
            <div class="ai-title">
              <span>Lê Phúc Nhật AI</span>
              <span class="ai-provider-pill" id="aiProviderBadge">${(AI_CONFIG.deepseekKey || AI_CONFIG.geminiKey) ? 'AI Live' : 'Tri Thức Gốc'}</span>
            </div>
            <span class="ai-status-text">HTX Keo Sơn • AI Thực Chiến Xứ Cùa</span>
          </div>
        </div>
        <div class="ai-header-actions">
          <button type="button" class="ai-icon-btn" id="btnAiSettings" title="Cài đặt khóa AI" aria-label="Cài đặt AI">⚙️</button>
          <button type="button" class="ai-icon-btn" id="btnAiClear" title="Làm mới đoạn chat" aria-label="Làm mới chat">🗑️</button>
          <button type="button" class="ai-icon-btn" id="btnAiClose" title="Đóng cửa sổ" aria-label="Đóng">&times;</button>
        </div>
      </div>

      <div class="ai-chips-bar" id="aiChipsBar">
        <button type="button" class="ai-chip" data-q="Giải thích triết lý Hiểu Sâu • Sống Tỉnh • Hành Đúng của anh Lê Phúc Nhật?">🧭 Triết lý 3 Chữ Sống</button>
        <button type="button" class="ai-chip" data-q="HTX Lâm Nghiệp Bền Vững Keo Sơn và Dược liệu Xứ Cùa có gì đặc biệt?">🌱 HTX Keo Sơn & Dược liệu</button>
        <button type="button" class="ai-chip" data-q="Công thức Lệnh Vàng AI 4 bước ứng dụng thực tế như thế nào?">🤖 Lệnh Vàng AI</button>
        <button type="button" class="ai-chip" data-q="Tóm tắt bài học từ Bác sĩ Cunningham và Siêu chuyên cơ A388?">✈️ Bài học 4D cốt lõi</button>
        <button type="button" class="ai-chip" data-q="Thông tin liên hệ chính thức của anh Lê Phúc Nhật?">📞 Kết nối anh Nhật</button>
      </div>

      <div class="ai-chat-body" id="aiChatBody">
        <div class="ai-msg bot">
          <div class="ai-msg-avatar"><img src="${AVATAR_URL}" alt="Lê Phúc Nhật" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR_SVG}';"></div>
          <div class="ai-msg-bubble">${formatMarkdown(chatHistory[0].content)}</div>
        </div>
      </div>

      <div class="ai-chat-footer">
        <form class="ai-input-form" id="aiChatForm">
          <textarea
            class="ai-input-field"
            id="aiInputField"
            rows="1"
            placeholder="Nhập câu hỏi về bài giảng, AI thực chiến, HTX Keo Sơn..."
            aria-label="Nhập câu hỏi"
          ></textarea>
          <button type="submit" class="ai-send-btn" id="aiSendBtn" aria-label="Gửi tin nhắn">➤</button>
        </form>
        <div class="ai-footer-note">Lê Phúc Nhật • lephucnhat.vn • Kiến tạo giá trị thực từ Gốc</div>
      </div>

      <div class="ai-settings-overlay" id="aiSettingsOverlay">
        <div class="ai-settings-header">
          <h4>⚙️ Cấu Hình Khóa AI Cá Nhân (Lưu trên trình duyệt)</h4>
          <button type="button" class="ai-icon-btn" id="btnCloseAiSettings" aria-label="Đóng cài đặt">&times;</button>
        </div>
        <div class="ai-settings-body">
          <div class="ai-setting-group">
            <label for="selectAiProvider">Mô hình AI ưu tiên:</label>
            <select class="ai-setting-select" id="selectAiProvider">
              <option value="auto">Tự động (Gemini 2.5 Flash / DeepSeek + Tri Thức Gốc)</option>
              <option value="gemini">Google Gemini 2.5 Flash</option>
              <option value="deepseek">DeepSeek AI (deepseek-chat)</option>
            </select>
            <span class="ai-setting-help">Khóa API chỉ lưu cục bộ trong trình duyệt của bạn, bảo mật tuyệt đối.</span>
          </div>
          <div class="ai-setting-group">
            <label for="inputGeminiKey">Google Gemini API Key (Tùy chọn):</label>
            <input type="password" class="ai-setting-input" id="inputGeminiKey" placeholder="AIzaSy...">
          </div>
          <div class="ai-setting-group">
            <label for="inputDeepseekKey">DeepSeek API Key (Tùy chọn):</label>
            <input type="password" class="ai-setting-input" id="inputDeepseekKey" placeholder="sk-...">
          </div>
        </div>
        <div class="ai-settings-footer">
          <button type="button" class="ai-btn-reset" id="btnResetAiDefault">Xóa khóa đã lưu</button>
          <button type="button" class="ai-btn-save" id="btnSaveAiSettings">Lưu Cấu Hình</button>
        </div>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(chatWin);
    attachAIEvents(fab, chatWin);
  }

  function attachAIEvents(fab, chatWin) {
    const chatBody = document.getElementById('aiChatBody');
    const chatForm = document.getElementById('aiChatForm');
    const inputField = document.getElementById('aiInputField');
    const sendBtn = document.getElementById('aiSendBtn');
    const chipsBar = document.getElementById('aiChipsBar');
    const btnClose = document.getElementById('btnAiClose');
    const btnClear = document.getElementById('btnAiClear');
    const btnSettings = document.getElementById('btnAiSettings');
    const settingsOverlay = document.getElementById('aiSettingsOverlay');
    const btnCloseSettings = document.getElementById('btnCloseAiSettings');
    const btnSaveSettings = document.getElementById('btnSaveAiSettings');
    const btnResetDefault = document.getElementById('btnResetAiDefault');
    const providerBadge = document.getElementById('aiProviderBadge');
    const selectProvider = document.getElementById('selectAiProvider');
    const inputDeepseek = document.getElementById('inputDeepseekKey');
    const inputGemini = document.getElementById('inputGeminiKey');

    function toggleChat(open) {
      const isOpen = open !== undefined ? open : !chatWin.classList.contains('open');
      if (isOpen) {
        chatWin.classList.add('open');
        setTimeout(() => inputField.focus(), 120);
      } else {
        chatWin.classList.remove('open');
        settingsOverlay.classList.remove('open');
      }
    }

    fab.addEventListener('click', () => toggleChat());
    btnClose.addEventListener('click', () => toggleChat(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatWin.classList.contains('open')) toggleChat(false);
    });

    function scrollToBottom() {
      setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 40);
    }

    function appendMessage(role, content, isHtml = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `ai-msg ${role === 'user' ? 'user' : 'bot'}`;
      const rendered = isHtml ? content : formatMarkdown(content);
      if (role === 'assistant') {
        msgDiv.innerHTML = `
          <div class="ai-msg-avatar"><img src="${AVATAR_URL}" alt="Lê Phúc Nhật" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR_SVG}';"></div>
          <div class="ai-msg-bubble">${rendered}</div>
        `;
      } else {
        msgDiv.innerHTML = `<div class="ai-msg-bubble">${formatMarkdown(content)}</div>`;
      }
      chatBody.appendChild(msgDiv);
      scrollToBottom();
    }

    async function handleUserSubmit(text) {
      const cleanText = (text || '').trim();
      if (!cleanText) return;
      inputField.value = '';
      inputField.style.height = 'auto';
      sendBtn.disabled = true;
      appendMessage('user', cleanText);

      const typing = document.createElement('div');
      typing.className = 'ai-typing-indicator';
      typing.innerHTML = '<span class="ai-typing-dot"></span><span class="ai-typing-dot"></span><span class="ai-typing-dot"></span>';
      chatBody.appendChild(typing);
      scrollToBottom();

      try {
        const res = await requestAIResponse(cleanText);
        typing.remove();
        chatHistory.push({ role: 'assistant', content: res.reply.replace(/<[^>]+>/g, '') });
        appendMessage('assistant', res.reply, res.isHtml);
      } catch (err) {
        typing.remove();
        appendMessage('assistant', getSmartFallbackReply(cleanText), true);
      } finally {
        sendBtn.disabled = false;
        inputField.focus();
      }
    }

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserSubmit(inputField.value);
    });

    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserSubmit(inputField.value);
      }
    });

    chipsBar.addEventListener('click', (e) => {
      const chip = e.target.closest('.ai-chip');
      if (chip && chip.dataset.q) handleUserSubmit(chip.dataset.q);
    });

    btnClear.addEventListener('click', () => {
      chatHistory = [chatHistory[0]];
      chatBody.innerHTML = `
        <div class="ai-msg bot">
          <div class="ai-msg-avatar"><img src="${AVATAR_URL}" alt="Lê Phúc Nhật" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR_SVG}';"></div>
          <div class="ai-msg-bubble">${formatMarkdown(chatHistory[0].content)}</div>
        </div>
      `;
    });

    btnSettings.addEventListener('click', () => {
      selectProvider.value = AI_CONFIG.provider;
      inputDeepseek.value = AI_CONFIG.deepseekKey;
      inputGemini.value = AI_CONFIG.geminiKey;
      settingsOverlay.classList.add('open');
    });

    btnCloseSettings.addEventListener('click', () => settingsOverlay.classList.remove('open'));

    btnSaveSettings.addEventListener('click', () => {
      AI_CONFIG.provider = selectProvider.value;
      AI_CONFIG.deepseekKey = inputDeepseek.value.trim();
      AI_CONFIG.geminiKey = inputGemini.value.trim();
      safeSet('lpn_sub_ai_provider', AI_CONFIG.provider);
      if (AI_CONFIG.deepseekKey) safeSet('lpn_deepseek_api_key', AI_CONFIG.deepseekKey);
      else safeRemove('lpn_deepseek_api_key');
      if (AI_CONFIG.geminiKey) safeSet('lpn_gemini_api_key', AI_CONFIG.geminiKey);
      else safeRemove('lpn_gemini_api_key');
      if (providerBadge) providerBadge.textContent = (AI_CONFIG.deepseekKey || AI_CONFIG.geminiKey) ? 'AI Live' : 'Tri Thức Gốc';
      settingsOverlay.classList.remove('open');
      appendMessage('assistant', '✅ Đã lưu cấu hình Trợ lý AI Lê Phúc Nhật an toàn trên trình duyệt của bạn.');
    });

    btnResetDefault.addEventListener('click', () => {
      AI_CONFIG.provider = 'auto';
      AI_CONFIG.deepseekKey = '';
      AI_CONFIG.geminiKey = '';
      safeRemove('lpn_sub_ai_provider');
      safeRemove('lpn_deepseek_api_key');
      safeRemove('lpn_gemini_api_key');
      inputDeepseek.value = '';
      inputGemini.value = '';
      if (providerBadge) providerBadge.textContent = 'Tri Thức Gốc';
      settingsOverlay.classList.remove('open');
      appendMessage('assistant', '🔄 Đã đưa Trợ lý về chế độ Tri Thức Gốc mặc định (không lưu khóa API).');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAIAssistant);
  } else {
    renderAIAssistant();
  }
})();
