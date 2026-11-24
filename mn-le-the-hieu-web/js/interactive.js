/**
 * ==========================================================================
 * INTERACTIVE.JS — MODULE TƯƠNG TÁC "GÓC BÉ VUI HỌC", MODAL, LIGHTBOX & PRINT
 * Trường Mầm non Lê Thế Hiếu — Xã Cam Lộ, Tỉnh Quảng Trị
 * ==========================================================================
 */

window.MNLTH_Interactive = (function () {
  'use strict';

  const Utils = window.MNLTH_Utils;

  /* ==========================================================================
     1. DỮ LIỆU THẺ 1: LÀM QUEN CHỮ CÁI TIẾNG VIỆT (a, ă, â | e, ê | o, ô, ơ)
        Chuyển hóa từ bộ bài giảng thật của khối MG 5–6 tuổi Cam Chính, Phân hiệu & Cam Sơn
     ========================================================================== */
  const ALPHABET_GROUPS = {
    'a-aw-aa': [
      {
        letter: 'a',
        upper: 'A',
        name: 'Chữ a',
        word: 'Quả na • Ca nước',
        icon: '🍈',
        poem: 'Chữ a tròn trịa thêm nét móc bên phải — Bé ngoan đọc to: a, quả na ngọt lành!',
        speech: 'Chữ a. Ví dụ: Quả na, ca nước. Chữ a có một nét cong tròn khép kín và một nét móc dưới bên phải.'
      },
      {
        letter: 'ă',
        upper: 'Ă',
        name: 'Chữ ă',
        word: 'Khăn mặt • Mặt trăng',
        icon: '🌙',
        poem: 'Chữ ă đội chiếc mũ cong ngửa như vầng trăng khuyết — Bé nhớ giữ khăn mặt sạch sẽ nhé!',
        speech: 'Chữ ă. Ví dụ: Khăn mặt, ông trăng. Chữ ă có dấu mũ cong ngửa ở phía trên đầu.'
      },
      {
        letter: 'â',
        upper: 'Â',
        name: 'Chữ â',
        word: 'Cái cân • Đôi chân',
        icon: '⚖️',
        poem: 'Chữ â đội chiếc nón chóp nhọn xinh xắn — Bé đi đều đôi chân đến trường!',
        speech: 'Chữ â. Ví dụ: Cái cân, đôi chân. Chữ â đội chiếc mũ nhọn xinh xắn ở trên đầu.'
      }
    ],
    'e-ee': [
      {
        letter: 'e',
        upper: 'E',
        name: 'Chữ e',
        word: 'Em bé • Xe đạp',
        icon: '🚲',
        poem: 'Chữ e có nét ngang nối nét cong hở phải — Em bé ngoan lễ phép chào cô!',
        speech: 'Chữ e. Ví dụ: Em bé, xe đạp. Chuyên đề làm quen chữ cái e, ê của khối Mẫu giáo 5 đến 6 tuổi.'
      },
      {
        letter: 'ê',
        upper: 'Ê',
        name: 'Chữ ê',
        word: 'Búp bê • Quả khế',
        icon: '🎎',
        poem: 'Chữ ê giống chữ e nhưng đội thêm chiếc nón xinh — Bé yêu búp bê và chùm khế ngọt!',
        speech: 'Chữ ê. Ví dụ: Búp bê, quả khế. Chữ ê có thêm chiếc mũ nhọn ở phía trên.'
      },
      {
        letter: 'u',
        upper: 'U',
        name: 'Chữ u',
        word: 'Mũ bảo hiểm • Đu đủ',
        icon: '⛑️',
        poem: 'Chữ u mở miệng hướng lên trời — Đi xe cùng bố mẹ, bé nhớ đội mũ bảo hiểm nhé!',
        speech: 'Chữ u. Ví dụ: Mũ bảo hiểm, quả đu đủ.'
      }
    ],
    'o-oo-ow': [
      {
        letter: 'o',
        upper: 'O',
        name: 'Chữ o',
        word: 'Quả bóng • Con ong',
        icon: '🐝',
        poem: 'Chữ o tròn như quả trứng gà — Chú ong chăm chỉ bay đi tìm hoa!',
        speech: 'Chữ o. Ví dụ: Quả bóng tròn, con ong chăm chỉ. Bài giảng lớp Mẫu giáo 5 đến 6 tuổi điểm trường Cam Sơn.'
      },
      {
        letter: 'ô',
        upper: 'Ô',
        name: 'Chữ ô',
        word: 'Cô giáo • Cái ô',
        icon: '☂️',
        poem: 'Chữ o đội nón thành chữ ô — Bé yêu cô giáo Trường Mầm non Lê Thế Hiếu!',
        speech: 'Chữ ô. Ví dụ: Cô giáo hiền từ, cái ô che nắng che mưa.'
      },
      {
        letter: 'ơ',
        upper: 'Ơ',
        name: 'Chữ ơ',
        word: 'Lá cờ Tổ quốc • Quả mơ',
        icon: '🇻🇳',
        poem: 'Chữ ơ có dấu móc nhỏ bên vai phải — Lá cờ đỏ sao vàng tung bay giữa sân trường!',
        speech: 'Chữ ơ. Ví dụ: Lá cờ Tổ quốc Việt Nam, quả mơ.'
      }
    ]
  };

  let currentAlphaGroup = 'a-aw-aa';
  let currentLetterIndex = 0;

  function initAlphabetCard() {
    const groupBtns = document.querySelectorAll('[data-alpha-group]');
    groupBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentAlphaGroup = btn.getAttribute('data-alpha-group');
        currentLetterIndex = 0;
        groupBtns.forEach((b) => b.classList.toggle('active', b === btn));
        renderAlphabetLetters(false);
      });
    });

    renderAlphabetLetters(false);
  }

  function renderAlphabetLetters(autoSpeak = false) {
    const list = ALPHABET_GROUPS[currentAlphaGroup] || ALPHABET_GROUPS['a-aw-aa'];
    const grid = document.getElementById('alphabet-buttons-grid');
    const display = document.getElementById('alphabet-display-box');
    if (!grid || !display) return;

    grid.innerHTML = list
      .map(
        (item, idx) => `
        <button type="button" class="letter-big-btn ${idx === currentLetterIndex ? 'active' : ''}"
                data-letter-idx="${idx}" aria-label="Phát âm ${Utils.escapeHTML(item.name)}">
          ${Utils.escapeHTML(item.letter)}
        </button>`
      )
      .join('');

    const activeItem = list[currentLetterIndex] || list[0];
    display.innerHTML = `
      <div class="letter-word-example">${activeItem.icon} ${Utils.escapeHTML(activeItem.upper)} ${Utils.escapeHTML(activeItem.letter)} — ${Utils.escapeHTML(activeItem.word)}</div>
      <p style="font-size: var(--text-xs); color: var(--color-text-muted);">${Utils.escapeHTML(activeItem.poem)}</p>
      <div style="margin-top: 6px;">
        <button type="button" class="btn-read-more" id="btn-speak-active-letter">
          🔊 Nghe phát âm "${Utils.escapeHTML(activeItem.letter)}"
        </button>
      </div>
    `;

    grid.querySelectorAll('[data-letter-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentLetterIndex = parseInt(btn.getAttribute('data-letter-idx'), 10) || 0;
        renderAlphabetLetters(true);
      });
    });

    const speakBtn = document.getElementById('btn-speak-active-letter');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        Utils.playGentleTone('success');
        Utils.speakVietnamese(activeItem.speech, 0.9);
      });
    }

    if (autoSpeak) {
      Utils.playGentleTone('success');
      Utils.speakVietnamese(activeItem.speech, 0.9);
    }
  }

  /* ==========================================================================
     2. DỮ LIỆU THẺ 2: NGHE KỂ CHUYỆN "GẤU CON BỊ SÂU RĂNG"
        (Tài nguyên thật của Lớp 4–5 tuổi A Cam Chính kết hợp Chuyên đề Răng miệng)
     ========================================================================== */
  const STORY_TEXT =
    'Câu chuyện: Gấu con bị sâu răng. ' +
    'Trong khu rừng xanh có một chú Gấu con rất thích ăn bánh kẹo ngọt, sô-cô-la và mật ong. ' +
    'Mỗi tối trước khi đi ngủ, mẹ Gấu đều dịu dàng nhắc: Gấu con ơi, con nhớ đánh răng sạch sẽ nhé! ' +
    'Nhưng Gấu con lười biếng đáp: Con buồn ngủ lắm rồi, mai con đánh răng cũng được ạ! ' +
    'Một đêm nọ, những con vi khuẩn sâu răng bắt đầu đục khoét làm răng của Gấu con đau nhức dữ dội. ' +
    'Sáng hôm sau, bác sĩ Voi khám răng cho Gấu con và dặn dò: Cháu bị sâu răng vì ăn nhiều đồ ngọt buổi tối mà không chải răng đấy. ' +
    'Từ hôm đó, Gấu con nghe lời bác sĩ và cô giáo, chăm chỉ chải răng mỗi sáng thức dậy, sau bữa ăn và trước khi đi ngủ nên không còn bị đau răng nữa!';

  function initStoryCard() {
    const btnPlay = document.getElementById('btn-story-play');
    const btnStop = document.getElementById('btn-story-stop');
    const speedSel = document.getElementById('story-speed-select');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        const rate = speedSel ? parseFloat(speedSel.value) : 0.9;
        btnPlay.textContent = '🔊 Đang đọc truyện cho bé...';
        const ok = Utils.speakVietnamese(STORY_TEXT, rate, () => {
          btnPlay.textContent = '🔊 Nghe cô kể chuyện';
        });
        if (!ok) {
          btnPlay.textContent = '🔊 Nghe cô kể chuyện';
        }
      });
    }

    if (btnStop) {
      btnStop.addEventListener('click', () => {
        Utils.stopSpeech();
        if (btnPlay) btnPlay.textContent = '🔊 Nghe cô kể chuyện';
        Utils.showToast('⏹️ Đã tạm dừng giọng kể chuyện.');
      });
    }
  }

  /* ==========================================================================
     3. DỮ LIỆU THẺ 3: TRÒ CHƠI NHỎ "ĐOÁN TÊN NHẠC CỤ & GIÁC QUAN KỲ DIỆU"
        (5 câu hỏi tương tác từ học liệu Lớp MG 5–6 tuổi B Cam Chính & A Phân hiệu)
     ========================================================================== */
  const QUIZ_QUESTIONS = [
    {
      question: '1. Nhạc cụ nào có mặt tròn, khi cô giáo gõ dùi vào sẽ kêu "Tùng! Tùng! Tùng!" thật rộn rã?',
      options: ['🥁 Cái trống trường em', '🎻 Đàn vi-ô-lông', '🪈 Chiếc sáo trúc'],
      correctIndex: 0,
      explain: 'Hoan hô bé! Cái trống khi gõ sẽ vang lên tiếng "Tùng! Tùng!" báo hiệu giờ học vui.'
    },
    {
      question: '2. Nhạc cụ nào làm bằng hai thanh tre nhỏ, khi gõ vào nhau phát ra tiếng "Cách! Cách!" giữ nhịp bài hát?',
      options: ['🎹 Đàn pi-a-nô', '🥢 Đôi phách tre', '🎺 Kèn đồng'],
      correctIndex: 1,
      explain: 'Đúng rồi! Đôi phách tre giúp các bạn nhỏ gõ đệm theo nhịp bài hát thật đều.'
    },
    {
      question: '3. Giác quan nào giúp bé nhìn thấy cầu vồng rực rỡ, hoa nở sân trường và nụ cười hiền của cô giáo?',
      options: ['👀 Đôi mắt (Thị giác)', '👂 Đôi tai (Thính giác)', '👃 Chiếc mũi (Khứu giác)'],
      correctIndex: 0,
      explain: 'Giỏi quá! Đôi mắt là cửa sổ thị giác giúp bé nhìn thấy muôn màu thế giới.'
    },
    {
      question: '4. Bộ phận nào giúp bé ngửi được hương thơm ngát của nồi cơm mới và hoa bưởi trong vườn?',
      options: ['👅 Cái lưỡi (Vị giác)', '👃 Chiếc mũi (Khứu giác)', '✋ Đôi bàn tay (Xúc giác)'],
      correctIndex: 1,
      explain: 'Chính xác! Chiếc mũi là cơ quan khứu giác giúp bé nhận biết hương thơm.'
    },
    {
      question: '5. Để có "Nụ cười chắc khỏe" không bị đau như bạn Gấu con, bé cần làm gì mỗi ngày?',
      options: [
        '🦷 Chải răng sáng – tối và hạn chế ăn kẹo ngọt trước khi ngủ',
        '🍬 Ăn thật nhiều kẹo ngọt rồi đi ngủ ngay',
        '🥤 Chỉ uống nước ngọt có ga thay nước lọc'
      ],
      correctIndex: 0,
      explain: 'Tuyệt vời! Bé nhớ chải răng sạch sẽ mỗi sáng và tối để có hàm răng trắng xinh nhé!'
    }
  ];

  let quizIdx = 0;
  let quizScore = 0;
  let quizAnswered = false;

  function initQuizCard() {
    renderQuizStep();
  }

  function renderQuizStep() {
    const box = document.getElementById('kids-quiz-box');
    if (!box) return;

    const q = QUIZ_QUESTIONS[quizIdx];
    quizAnswered = false;

    box.innerHTML = `
      <div class="quiz-progress">
        <span>Câu hỏi ${quizIdx + 1} / ${QUIZ_QUESTIONS.length}</span>
        <span>⭐ Điểm bé ngoan: ${quizScore}/${QUIZ_QUESTIONS.length}</span>
      </div>
      <div class="quiz-question">${Utils.escapeHTML(q.question)}</div>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt, idx) => `
          <button type="button" class="quiz-opt-btn" data-quiz-opt="${idx}">
            ${Utils.escapeHTML(opt)}
          </button>`
          )
          .join('')}
      </div>
      <div class="quiz-feedback" id="quiz-feedback-text" aria-live="polite"></div>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:auto;">
        <button type="button" class="btn-read-more" id="btn-quiz-next">Câu tiếp theo ➔</button>
        <button type="button" class="btn-read-more" id="btn-quiz-reset" style="background:var(--color-surface);">🔄 Chơi lại từ đầu</button>
      </div>
    `;

    const feedbackEl = document.getElementById('quiz-feedback-text');
    const optBtns = box.querySelectorAll('[data-quiz-opt]');

    optBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (quizAnswered) return;
        quizAnswered = true;
        const chosen = parseInt(btn.getAttribute('data-quiz-opt'), 10);

        if (chosen === q.correctIndex) {
          quizScore++;
          btn.classList.add('correct');
          if (feedbackEl) {
            feedbackEl.style.color = '#15803D';
            feedbackEl.textContent = '🌟 ' + q.explain;
          }
          Utils.playGentleTone('success');
        } else {
          btn.classList.add('wrong');
          if (optBtns[q.correctIndex]) {
            optBtns[q.correctIndex].classList.add('correct');
          }
          if (feedbackEl) {
            feedbackEl.style.color = '#B91C1C';
            feedbackEl.textContent = '💡 Chưa đúng rồi! ' + q.explain;
          }
          Utils.playGentleTone('retry');
        }
      });
    });

    const nextBtn = document.getElementById('btn-quiz-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        quizIdx = (quizIdx + 1) % QUIZ_QUESTIONS.length;
        if (quizIdx === 0 && quizAnswered) {
          Utils.showToast(`🎉 Bé đã hoàn thành 5 câu hỏi với ${quizScore}/5 ngôi sao!`);
          quizScore = 0;
        }
        renderQuizStep();
      });
    }

    const resetBtn = document.getElementById('btn-quiz-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        quizIdx = 0;
        quizScore = 0;
        renderQuizStep();
      });
    }
  }

  /* ==========================================================================
     4. MODAL ĐỌC BÀI TIN TỨC / VĂN BẢN / TÀI NGUYÊN & LIGHTBOX ẢNH
     ========================================================================== */
  const GALLERY_ITEMS = [
    {
      src: 'assets/images/gallery-1.svg',
      title: 'Góc học tập STEAM & Khám phá khoa học lấy trẻ làm trung tâm',
      desc: 'Các bé khối Mẫu giáo hào hứng trải nghiệm học liệu trực quan và bài giảng ứng dụng AI tại lớp.'
    },
    {
      src: 'assets/images/gallery-2.svg',
      title: 'Sân chơi vận động ngoài trời xanh – sạch – an toàn',
      desc: 'Hoạt động thể dục sáng theo nhạc "Xòe ra nắm vào" và trò chơi vận động rèn luyện thể lực mỗi ngày.'
    },
    {
      src: 'assets/images/gallery-3.svg',
      title: 'Ngày hội đọc sách của bé & Góc làm quen chữ cái tiếng Việt',
      desc: 'Nuôi dưỡng tình yêu sách tranh và chuẩn bị tâm thế tiếng Việt vững vàng cho trẻ 5–6 tuổi.'
    },
    {
      src: 'assets/images/gallery-4.svg',
      title: 'Quy trình bếp ăn bán trú một chiều & Hoạt động "Bữa ăn gia đình"',
      desc: 'Đảm bảo vệ sinh an toàn thực phẩm, lưu mẫu thức ăn 24 giờ và giáo dục kỹ năng tự phục vụ cho trẻ.'
    }
  ];

  let currentLightboxIdx = 0;

  function openModal({ badge, title, date, bodyHtml, speechText, shareId }) {
    const backdrop = document.getElementById('universal-modal');
    const content = document.getElementById('universal-modal-content');
    if (!backdrop || !content) return;

    Utils.stopSpeech();

    const shareUrl = window.location.origin + window.location.pathname + (shareId ? '#' + shareId : '');

    content.innerHTML = `
      <div class="modal-header">
        <div>
          <span class="news-cat-badge">${Utils.escapeHTML(badge || 'Thông tin nhà trường')}</span>
          ${date ? `<span style="font-size:var(--text-xs); color:var(--color-text-muted); margin-left:8px;">📅 ${Utils.escapeHTML(date)}</span>` : ''}
          <h3 style="font-family:var(--font-display); font-size:var(--text-xl); font-weight:800; margin-top:8px;">
            ${Utils.escapeHTML(title)}
          </h3>
        </div>
        <button type="button" class="modal-close-btn" id="btn-close-modal" aria-label="Đóng cửa sổ">✕</button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px; padding-bottom:14px; border-bottom:1px dashed var(--color-border);">
        ${
          speechText
            ? `<button type="button" class="btn btn-primary" id="btn-modal-tts" style="padding:8px 16px; min-height:40px;">
                 🔊 Nghe đọc bài
               </button>
               <button type="button" class="btn btn-secondary" id="btn-modal-tts-stop" style="padding:8px 14px; min-height:40px;">
                 ⏹️ Dừng đọc
               </button>`
            : ''
        }
        <button type="button" class="btn btn-secondary" id="btn-modal-copy-link" style="padding:8px 16px; min-height:40px;">
          📋 Sao chép liên kết
        </button>
      </div>
      <div class="modal-body-text" style="display:flex; flex-direction:column; gap:14px; font-size:var(--text-base);">
        ${bodyHtml}
      </div>
    `;

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');

    const closeBtn = document.getElementById('btn-close-modal');
    if (closeBtn) {
      closeBtn.focus();
      closeBtn.addEventListener('click', closeModal);
    }

    const ttsBtn = document.getElementById('btn-modal-tts');
    if (ttsBtn && speechText) {
      ttsBtn.addEventListener('click', () => {
        ttsBtn.textContent = '🔊 Đang đọc bài...';
        Utils.speakVietnamese(title + '. ' + speechText, 1.0, () => {
          ttsBtn.textContent = '🔊 Nghe đọc bài';
        });
      });
    }

    const ttsStopBtn = document.getElementById('btn-modal-tts-stop');
    if (ttsStopBtn) {
      ttsStopBtn.addEventListener('click', () => {
        Utils.stopSpeech();
        if (ttsBtn) ttsBtn.textContent = '🔊 Nghe đọc bài';
      });
    }

    const copyBtn = document.getElementById('btn-modal-copy-link');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        Utils.copyTextToClipboard(shareUrl, '📋 Đã sao chép liên kết bài viết!');
      });
    }
  }

  function closeModal() {
    Utils.stopSpeech();
    const backdrop = document.getElementById('universal-modal');
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
  }

  function initGalleryAndModalEvents() {
    const galleryContainer = document.getElementById('school-gallery-grid');
    if (galleryContainer) {
      galleryContainer.innerHTML = GALLERY_ITEMS.map(
        (item, idx) => `
        <button type="button" class="gallery-item" data-gallery-idx="${idx}" aria-label="Xem ảnh: ${Utils.escapeHTML(item.title)}">
          <img src="${Utils.escapeHTML(item.src)}" alt="${Utils.escapeHTML(item.title)}" loading="lazy" width="400" height="250" />
          <div class="gallery-caption">${Utils.escapeHTML(item.title)}</div>
        </button>`
      ).join('');

      galleryContainer.querySelectorAll('[data-gallery-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentLightboxIdx = parseInt(btn.getAttribute('data-gallery-idx'), 10) || 0;
          openLightboxItem(currentLightboxIdx);
        });
      });
    }

    const backdrop = document.getElementById('universal-modal');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      const isOpen = backdrop && backdrop.classList.contains('open');
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
      if (isOpen && backdrop.getAttribute('data-mode') === 'lightbox') {
        if (e.key === 'ArrowRight') {
          currentLightboxIdx = (currentLightboxIdx + 1) % GALLERY_ITEMS.length;
          openLightboxItem(currentLightboxIdx);
        } else if (e.key === 'ArrowLeft') {
          currentLightboxIdx = (currentLightboxIdx - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
          openLightboxItem(currentLightboxIdx);
        }
      }
      // Phím tắt Ctrl+K mở ô tìm kiếm nhanh
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        focusQuickSearch();
      }
    });
  }

  function openLightboxItem(idx) {
    const item = GALLERY_ITEMS[idx] || GALLERY_ITEMS[0];
    const backdrop = document.getElementById('universal-modal');
    if (backdrop) backdrop.setAttribute('data-mode', 'lightbox');

    openModal({
      badge: `Thư viện ảnh (${idx + 1}/${GALLERY_ITEMS.length})`,
      title: item.title,
      date: 'Năm học 2026 – 2027',
      bodyHtml: `
        <img src="${Utils.escapeHTML(item.src)}" alt="${Utils.escapeHTML(item.title)}" style="width:100%; border-radius:var(--radius-md); border:1px solid var(--color-border);" />
        <p>${Utils.escapeHTML(item.desc)}</p>
        <div style="display:flex; justify-content:space-between; gap:12px; margin-top:8px;">
          <button type="button" class="btn btn-secondary" id="btn-lb-prev">⬅ Ảnh trước</button>
          <button type="button" class="btn btn-secondary" id="btn-lb-next">Ảnh tiếp theo ➡</button>
        </div>
      `,
      speechText: item.desc,
      shareId: 'tai-nguyen'
    });

    const prevBtn = document.getElementById('btn-lb-prev');
    const nextBtn = document.getElementById('btn-lb-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentLightboxIdx = (currentLightboxIdx - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
        openLightboxItem(currentLightboxIdx);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentLightboxIdx = (currentLightboxIdx + 1) % GALLERY_ITEMS.length;
        openLightboxItem(currentLightboxIdx);
      });
    }
  }

  function focusQuickSearch() {
    const searchInput = document.getElementById('resource-search-input');
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => searchInput.focus(), 300);
      Utils.showToast('🔍 Nhập từ khóa có dấu hoặc không dấu (VD: "gau con", "chu cai")');
    }
  }

  /* ==========================================================================
     5. IN / LƯU PDF CHUẨN A4 CHO THỰC ĐƠN & KẾ HOẠCH TUẦN
     ========================================================================== */
  function triggerPrintWeeklyMenu() {
    window.print();
  }

  return {
    initAlphabetCard,
    initStoryCard,
    initQuizCard,
    initGalleryAndModalEvents,
    openModal,
    closeModal,
    focusQuickSearch,
    triggerPrintWeeklyMenu
  };
})();
