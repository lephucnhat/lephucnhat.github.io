/**
 * ==========================================================================
 * APP.JS — ĐIỀU PHỐI DỮ LIỆU JSON + INLINE FALLBACK, LỌC, TÌM KIẾM & FORM
 * Trường Mầm non Lê Thế Hiếu — Xã Cam Lộ, Tỉnh Quảng Trị
 * ==========================================================================
 */

(function () {
  'use strict';

  const Utils = window.MNLTH_Utils;
  const Interactive = window.MNLTH_Interactive;

  /* ==========================================================================
     1. DỮ LIỆU FALLBACK NỘI TUYẾN (Đảm bảo mở trực tiếp không bao giờ trắng trang)
     ========================================================================== */
  const INLINE_FALLBACK = {
  "siteConfig": {
    "schoolName": "Trường Mầm non Lê Thế Hiếu",
    "schoolShortName": "MN Lê Thế Hiếu",
    "schoolYear": "Năm học 2026 – 2027",
    "slogan": "Ươm mầm xanh trên quê hương vùng Cùa lịch sử",
    "subSlogan": "Môi trường giáo dục mầm non an toàn, ấm áp, lấy trẻ làm trung tâm — Nơi mỗi ngày đến trường của bé là một ngày vui khám phá.",
    "mergerNote": "Thành lập từ năm học 2026–2027 trên cơ sở hợp nhất Trường Mầm non Bình Minh và Trường Mầm non Hoa Mai theo Quyết định của UBND xã Cam Lộ, tỉnh Quảng Trị.",
    "governingBody": "Ủy ban Nhân dân xã Cam Lộ – Tỉnh Quảng Trị",
    "professionalBody": "Sở Giáo dục và Đào tạo tỉnh Quảng Trị",
    "address": "Thôn Cam Chính, xã Cam Lộ, tỉnh Quảng Trị",
    "principal": "[HỌ TÊN HIỆU TRƯỞNG]",
    "vicePrincipals": "[DANH SÁCH PHÓ HIỆU TRƯỞNG]",
    "phone": "[SỐ ĐIỆN THOẠI NHÀ TRƯỜNG]",
    "email": "[EMAIL NHÀ TRƯỜNG]",
    "childProtectionHotline": {
      "title": "Đường dây nóng Bảo vệ Trẻ em xã Cam Lộ & Quốc gia",
      "nationalNumber": "111",
      "nationalLabel": "Tổng đài Quốc gia Bảo vệ Trẻ em (111 - Miễn phí 24/7)",
      "localLabel": "Đường dây nóng Bảo vệ Trẻ em UBND xã Cam Lộ (Theo Thông báo ngày 16/11/2026)",
      "localPhone": "[SỐ ĐƯỜNG DÂY NÓNG XÃ CAM LỘ]"
    },
    "websiteUrl": "https://mnlethehieu.quangtri.edu.vn",
    "workingHours": "Thứ Hai – Thứ Sáu: Đón trẻ từ 06:45 | Trả trẻ từ 16:15 – 17:00",
    "campuses": [
      {
        "id": "cam-chinh",
        "name": "Trường chính Cam Chính (Trụ sở chính)",
        "address": "Thôn Cam Chính, xã Cam Lộ, tỉnh Quảng Trị",
        "ageGroups": "Nhà trẻ 24–36 tháng, Mẫu giáo 3–4 tuổi, 4–5 tuổi, 5–6 tuổi",
        "features": "Khu hiệu bộ, bếp ăn bán trú một chiều chuẩn vệ sinh ATTP, sân chơi xanh và các phòng học chuyên đề.",
        "isMain": true
      },
      {
        "id": "phan-hieu",
        "name": "Điểm trường Phân hiệu",
        "address": "Xã Cam Lộ, tỉnh Quảng Trị",
        "ageGroups": "Nhà trẻ 24–36 tháng, Mẫu giáo 3–4 tuổi, 4–5 tuổi, 5–6 tuổi",
        "features": "Khu lớp học khang trang, bếp ăn bán trú, sân vận động ngoài trời và góc khám phá STEAM.",
        "isMain": false
      },
      {
        "id": "cam-son",
        "name": "Điểm trường Cam Sơn",
        "address": "Thôn Cam Sơn, xã Cam Lộ, tỉnh Quảng Trị",
        "ageGroups": "Mẫu giáo 3–4 tuổi, 4–5 tuổi, 5–6 tuổi",
        "features": "Không gian học tập thân thiện, gần gũi thiên nhiên, phục vụ thuận tiện cho con em khu vực Cam Sơn.",
        "isMain": false
      },
      {
        "id": "cam-loc",
        "name": "Điểm trường Cam Lộc",
        "address": "Thôn Cam Lộc, xã Cam Lộ, tỉnh Quảng Trị",
        "ageGroups": "Mẫu giáo 3–5 tuổi",
        "features": "Lớp học ấm cúng, an toàn, gắn kết chặt chẽ giữa gia đình và nhà trường tại địa bàn thôn Cam Lộc.",
        "isMain": false
      },
      {
        "id": "diem-bo-sung",
        "name": "[Vị trí mẫu thêm Điểm trường mới]",
        "address": "Cập nhật trong data/site-config.json khi nhà trường mở rộng điểm lớp",
        "ageGroups": "Tùy chỉnh theo phân bổ năm học",
        "features": "Mẫu cấu hình mở giúp giáo viên phụ trách CNTT dễ dàng bổ sung thông tin điểm trường mà không cần sửa mã nguồn.",
        "isMain": false,
        "isTemplate": true
      }
    ],
    "organization": [
      {
        "group": "Đảng bộ & Lãnh đạo Nhà trường",
        "icon": "🏛️",
        "units": [
          {
            "name": "Đảng bộ Trường Mầm non Lê Thế Hiếu",
            "desc": "Gồm Chi bộ Trường Chính và Chi bộ Phân hiệu — Lãnh đạo toàn diện công tác chính trị, tư tưởng và chuyên môn."
          },
          {
            "name": "Ban Giám hiệu Nhà trường",
            "desc": "Hiệu trưởng: [HỌ TÊN HIỆU TRƯỞNG] cùng các Phó Hiệu trưởng phụ trách công tác Chuyên môn, Nuôi dưỡng và Cơ sở vật chất."
          },
          {
            "name": "Các Hội đồng & Đoàn thể",
            "desc": "Hội đồng trường, Hội đồng sư phạm, Công đoàn cơ sở, Chi đoàn Thanh niên và Ban đại diện Cha mẹ trẻ."
          }
        ]
      },
      {
        "group": "4 Tổ Chuyên môn Giáo dục theo Độ tuổi",
        "icon": "🎓",
        "units": [
          {
            "name": "Tổ Nhà trẻ (24 – 36 tháng tuổi)",
            "desc": "Chăm sóc giấc ngủ, bữa ăn, tập nói, phát triển vận động thô – tinh và cảm xúc an toàn đầu đời cho bé."
          },
          {
            "name": "Tổ Mẫu giáo Bé (3 – 4 tuổi)",
            "desc": "Hình thành nề nếp tự phục vụ, phát triển ngôn ngữ, nhận biết thế giới xung quanh qua trò chơi."
          },
          {
            "name": "Tổ Mẫu giáo Nhỡ (4 – 5 tuổi)",
            "desc": "Khám phá khoa học, làm quen toán sơ đẳng, kể chuyện sáng tạo, giáo dục cảm xúc xã hội (SEL) và kỹ năng sống."
          },
          {
            "name": "Tổ Mẫu giáo Lớn (5 – 6 tuổi)",
            "desc": "Làm quen chữ cái tiếng Việt, ứng dụng giáo dục STEAM, chuẩn bị tâm thế vững vàng cho trẻ vào lớp Một."
          }
        ]
      },
      {
        "group": "Khối Nuôi dưỡng & Hành chính – Văn phòng",
        "icon": "🍲",
        "units": [
          {
            "name": "Tổ Nuôi dưỡng",
            "desc": "Vận hành quy trình bếp ăn một chiều: Tiếp phẩm tươi sạch, sơ chế, chế biến, lưu mẫu thức ăn 24h và tổ chức Bữa ăn gia đình."
          },
          {
            "name": "Tổ Văn phòng",
            "desc": "Công tác kế toán, văn thư – lưu trữ, y tế học đường, bảo vệ an ninh trật tự và an toàn trường học."
          }
        ]
      }
    ],
    "externalSystems": [
      {
        "name": "Hệ thống Quản lý Nhà trường SMAS",
        "url": "https://smas.edu.vn",
        "desc": "Đồng bộ hồ sơ học sinh, điểm danh và đánh giá sự phát triển của trẻ (Dành cho Cán bộ – Giáo viên)."
      },
      {
        "name": "Cơ sở dữ liệu Ngành GD&ĐT",
        "url": "https://csdl.moet.gov.vn",
        "desc": "Hệ thống CSDL Bộ Giáo dục và Đào tạo & Sở GD&ĐT tỉnh Quảng Trị."
      },
      {
        "name": "Đăng nhập Quản trị CMS Sở GD&ĐT",
        "url": "https://mnlethehieu.quangtri.edu.vn/ Admin",
        "desc": "Cổng quản trị nội bộ thuộc hệ thống edu.vn của Sở GD&ĐT Quảng Trị."
      }
    ]
  },
  "news": [
    {
      "id": "toa-dam-20-11-2026",
      "title": "Trường Mầm non Lê Thế Hiếu tổ chức tọa đàm kỷ niệm 44 năm Ngày Nhà giáo Việt Nam (20/11/1982 – 20/11/2026)",
      "category": "Sự kiện nhà trường",
      "date": "20/11/2026",
      "featured": true,
      "image": "assets/images/news-20-11.svg",
      "summary": "Buổi tọa đàm ấm áp và ý nghĩa — mùa tri ân đầu tiên kể từ khi hai trường Mầm non Bình Minh và Mầm non Hoa Mai hợp nhất dưới mái nhà chung Trường Mầm non Lê Thế Hiếu tại xã Cam Lộ.",
      "content": [
        "Hòa chung không khí hân hoan của cả nước hướng về Ngày Nhà giáo Việt Nam 20/11, ngày 20/11/2026, Trường Mầm non Lê Thế Hiếu, xã Cam Lộ, tỉnh Quảng Trị đã long trọng tổ chức buổi tọa đàm kỷ niệm 44 năm Ngày Nhà giáo Việt Nam (20/11/1982 – 20/11/2026) trong không khí trang trọng, ấm áp và đầy ý nghĩa.",
        "Tham dự buổi tọa đàm có đại diện lãnh đạo địa phương xã Cam Lộ, Ban đại diện Hội cha mẹ trẻ, đại diện Trạm Y tế xã Cam Lộ, đại diện đơn vị kết nghĩa cùng các cô giáo nguyên là cán bộ quản lý, giáo viên, nhân viên qua các thời kỳ và toàn thể hội đồng sư phạm nhà trường.",
        "Đặc biệt, ngày 20/11 năm học 2026–2027 mang một dấu ấn rất riêng đối với tập thể nhà trường: Đây là mùa tri ân đầu tiên kể từ khi Trường Mầm non Bình Minh và Trường Mầm non Hoa Mai chính thức hợp nhất thành Trường Mầm non Lê Thế Hiếu. Những tiết mục văn nghệ sâu lắng và những lời sẻ chia chân thành đã thắt chặt tinh thần đoàn kết, tiếp thêm động lực để mỗi cô giáo tận tụy ươm mầm xanh trên quê hương vùng Cùa lịch sử."
      ]
    },
    {
      "id": "clb-nuoi-con-khoe-2026",
      "title": "Sinh hoạt Câu lạc bộ “Nuôi con khỏe” – Chung tay vì sức khỏe và sự phát triển toàn diện của trẻ",
      "category": "Chăm sóc – Nuôi dưỡng",
      "date": "11/11/2026",
      "featured": false,
      "image": "assets/images/news-nutrition.svg",
      "summary": "Nhà trường và phụ huynh cùng trao đổi thực trạng cân đo đợt tháng 9/2026 và thống nhất 4 nhóm giải pháp dinh dưỡng, giấc ngủ, vận động cho trẻ từ 24 tháng đến 6 tuổi.",
      "content": [
        "Nhằm tăng cường sự phối hợp giữa gia đình và nhà trường trong công tác chăm sóc, nuôi dưỡng và bảo vệ sức khỏe trẻ, chiều ngày 11/11/2026, Trường Mầm non Lê Thế Hiếu đã tổ chức buổi sinh hoạt Câu lạc bộ “Nuôi con khỏe” với sự tham gia của Ban Giám hiệu, đội ngũ giáo viên và đại diện các bậc phụ huynh.",
        "Tại buổi sinh hoạt, Ban Giám hiệu nhà trường đã thông tin chi tiết về kết quả cân nặng, chiều cao của trẻ qua đợt cân đo định kỳ đầu năm học 2026–2027, giúp phụ huynh nắm bắt biểu đồ tăng trưởng thể chất của con để có chế độ chăm sóc phù hợp.",
        "Nhà trường và cha mẹ trẻ đã thống nhất 4 nhóm giải pháp phối hợp trọng tâm: (1) Đảm bảo dinh dưỡng cân đối và an toàn vệ sinh thực phẩm, theo dõi thực đơn bán trú để điều chỉnh bữa ăn tối tại nhà; (2) Theo dõi sát biểu đồ tăng trưởng đối với trẻ suy dinh dưỡng, thấp còi hoặc thừa cân; (3) Rèn thói quen ngủ đúng giờ, tăng cường vận động ngoài trời; (4) Duy trì kết nối thường xuyên giữa giáo viên chủ nhiệm và phụ huynh."
      ]
    },
    {
      "id": "chuyen-de-nu-cuoi-chac-khoe",
      "title": "Sinh hoạt chuyên đề “Bí mật của nụ cười chắc khỏe” phối hợp cùng Trạm Y tế xã Cam Lộ",
      "category": "Y tế học đường",
      "date": "22/10/2026",
      "featured": false,
      "image": "assets/images/news-dental.svg",
      "summary": "Các bác sĩ Trạm Y tế xã Cam Lộ trực tiếp hướng dẫn giáo viên, phụ huynh và các bé kỹ năng chải răng đúng cách, phòng ngừa sâu răng ngay từ lứa tuổi mầm non.",
      "content": [
        "Chiều ngày 22/10/2026, Trường Mầm non Lê Thế Hiếu đã phối hợp với các bác sĩ thuộc Trạm Y tế xã Cam Lộ tổ chức buổi sinh hoạt chuyên đề “Bí mật của nụ cười chắc khỏe” dành cho cán bộ quản lý, giáo viên và đại diện cha mẹ trẻ.",
        "Tại chuyên đề, bác sĩ Trạm Y tế xã Cam Lộ đã chia sẻ trực quan về nguyên nhân gây sâu răng ở trẻ nhỏ, các dấu hiệu sớm cần lưu ý và quy trình chải răng chuẩn y khoa phù hợp với trẻ mầm non. Qua đợt khám sức khỏe định kỳ, nhà trường đặc biệt lưu ý việc hạn chế bánh kẹo ngọt, nước có đường trước giờ đi ngủ và duy trì súc miệng, chải răng sau bữa ăn.",
        "Các cô giáo cũng chia sẻ kinh nghiệm lồng ghép giáo dục vệ sinh răng miệng thông qua các câu chuyện kể hấp dẫn trên lớp như truyện “Gấu con bị sâu răng”, giúp các bé hào hứng tự giác bảo vệ hàm răng xinh mỗi ngày."
      ]
    },
    {
      "id": "hoat-dong-chao-mung-20-10",
      "title": "Sôi nổi các hoạt động chào mừng Ngày Phụ nữ Việt Nam 20/10: Chạy bộ UpRace & Giao lưu bóng chuyền",
      "category": "Hoạt động đoàn thể",
      "date": "20/10/2026",
      "featured": false,
      "image": "assets/images/news-sports.svg",
      "summary": "Tập thể cán bộ, giáo viên, nhân viên hào hứng hưởng ứng giải chạy bộ vì cộng đồng UpRace từ 5h30 sáng và thi đấu giao lưu bóng chuyền gắn kết 3 đội chuyên môn.",
      "content": [
        "Thiết thực chào mừng Ngày Phụ nữ Việt Nam 20/10/2026, Trường Mầm non Lê Thế Hiếu đã tổ chức chuỗi hoạt động thể thao rèn luyện sức khỏe và gắn kết tập thể sư phạm sau sáp nhập.",
        "Ngay từ 5 giờ 30 sáng, đông đảo cán bộ, giáo viên, nhân viên nhà trường đã tham gia Giải chạy bộ vì cộng đồng UpRace năm 2026, lan tỏa năng lượng tích cực và lối sống khỏe mạnh.",
        "Buổi chiều cùng ngày, giải giao lưu bóng chuyền nữ giữa 3 đội liên quân các tổ chuyên môn đã diễn ra sôi nổi với những pha bóng đẹp mắt và tiếng cổ vũ rộn ràng. Hoạt động góp phần thắt chặt tình cảm đồng nghiệp, xây dựng môi trường trường học hạnh phúc."
      ]
    },
    {
      "id": "bua-an-gia-dinh-khoi-5-6-tuoi",
      "title": "Tổ chức “Bữa ăn gia đình” cho trẻ khối Mẫu giáo 5–6 tuổi tại Trường chính và Điểm Phân hiệu",
      "category": "Giáo dục kỹ năng sống",
      "date": "15/10/2026",
      "featured": false,
      "image": "assets/images/news-family-meal.svg",
      "summary": "Trẻ được rèn kỹ năng tự phục vụ, biết mời cô và các bạn, lấy thức ăn vừa đủ và cảm nhận không khí ấm cúng, sẻ chia như bữa cơm sum họp tại gia đình.",
      "content": [
        "Thực hiện kế hoạch chăm sóc, nuôi dưỡng và giáo dục trẻ năm học 2026–2027, ngày 15/10/2026, Trường Mầm non Lê Thế Hiếu đã tổ chức hoạt động trải nghiệm “Bữa ăn gia đình” dành cho các bé khối Mẫu giáo Lớn 5–6 tuổi tại Trường chính Cam Chính và Điểm Phân hiệu.",
        "Toàn bộ quy trình bếp ăn bán trú được Tổ Nuôi dưỡng thực hiện nghiêm ngặt qua các bước: Tiếp nhận thực phẩm tươi sạch có nguồn gốc rõ ràng, sơ chế phân khu sống – chín riêng biệt, chế biến hợp khẩu vị trẻ thơ và trình bày bàn ăn đẹp mắt.",
        "Trong bữa ăn gia đình, các bé được hướng dẫn tự chuẩn bị khăn, bát thìa, biết chờ đến lượt, tự múc lượng thức ăn phù hợp và giữ vệ sinh bàn ăn gọn gàng. Hoạt động giúp trẻ ăn ngon miệng hơn, đồng thời hình thành văn hóa ứng xử lễ phép, biết trân trọng công sức của các cô cấp dưỡng."
      ]
    },
    {
      "id": "be-vui-tet-trung-thu-2026",
      "title": "Chi đoàn Trường Mầm non Lê Thế Hiếu tổ chức ngày hội “Bé vui Tết Trung thu” tại các điểm trường",
      "category": "Hoạt động trải nghiệm",
      "date": "25/09/2026",
      "featured": false,
      "image": "assets/images/news-mid-autumn.svg",
      "summary": "Không khí rộn ràng với hoạt cảnh Chú Cuội – Chị Hằng, múa lân và phá cỗ trông trăng được tổ chức chu đáo tại Điểm trường Cam Sơn, Phân hiệu và Trường Chính.",
      "content": [
        "Được sự chỉ đạo của Ban Giám hiệu, trong hai ngày 24 và 25/09/2026, Chi đoàn Thanh niên Trường Mầm non Lê Thế Hiếu đã tổ chức chương trình “Bé vui Tết Trung thu” tại cả 3 khu vực: Điểm trường Cam Sơn, Điểm Phân hiệu và Trường chính Cam Chính.",
        "Các bé được hòa mình vào hoạt cảnh Chú Cuội – Chị Hằng vui nhộn, thưởng thức các tiết mục văn nghệ tuổi thơ và cùng nhau phá cỗ trung thu trong niềm hân hoan. Sự kiện thể hiện sự quan tâm đồng đều của nhà trường tới mọi điểm trường trên địa bàn xã Cam Lộ."
      ]
    }
  ],
  "resources": [
    {
      "id": "res-ai-chu-voi",
      "title": "Ứng dụng AI trong hoạt động khám phá khoa học: “Chú voi ngộ nghĩnh”",
      "ageGroup": "MG 4–5 tuổi",
      "type": "Giáo án – STEM",
      "campus": "Trường chính Cam Chính",
      "author": "Giáo viên Lê Thị Hoài Thu",
      "date": "24/11/2026",
      "description": "Bài giảng điện tử tích hợp hình ảnh và hoạt cảnh trực quan hỗ trợ bằng AI, giúp trẻ khối 4–5 tuổi hào hứng khám phá đặc điểm, môi trường sống và tập tính đáng yêu của loài voi.",
      "tags": [
        "Ứng dụng AI",
        "Khám phá khoa học",
        "Khối 4-5 tuổi"
      ]
    },
    {
      "id": "res-chuyen-gau-con-sau-rang",
      "title": "Câu chuyện: “Gấu con bị sâu răng” – Giáo dục kỹ năng vệ sinh răng miệng",
      "ageGroup": "MG 4–5 tuổi",
      "type": "Giáo án – STEM",
      "campus": "Lớp 4–5 tuổi A Cam Chính",
      "author": "Tổ Mẫu giáo 4–5 tuổi",
      "date": "18/11/2026",
      "description": "Học liệu phát triển ngôn ngữ kết hợp giáo dục sức khỏe răng miệng. Đã được tích hợp trực tiếp vào mục 'Góc Bé Vui Học Tại Nhà' với tính năng giọng đọc cô kể chuyện tự động.",
      "tags": [
        "Kể chuyện",
        "Chăm sóc răng miệng",
        "Góc Bé Vui Học"
      ],
      "interactiveTarget": "story"
    },
    {
      "id": "res-chu-cai-a-aw-aa",
      "title": "Hoạt động làm quen chữ cái: a, ă, â (Bộ bài giảng tương tác)",
      "ageGroup": "MG 5–6 tuổi",
      "type": "PowerPoint",
      "campus": "Lớp MG 5–6 tuổi B Cam Chính & A Phân hiệu",
      "author": "Tổ Mẫu giáo 5–6 tuổi",
      "date": "15/11/2026",
      "description": "Bài giảng làm quen nhóm chữ cái a, ă, â thông qua thẻ từ, hình ảnh trực quan và trò chơi phát âm chuẩn tiếng Việt cho trẻ mẫu giáo lớn.",
      "tags": [
        "Làm quen chữ cái",
        "Tiền tiểu học",
        "a ă â"
      ],
      "interactiveTarget": "alphabet"
    },
    {
      "id": "res-chu-cai-e-ee",
      "title": "Chuyên đề cấp tổ: Hoạt động làm quen chữ cái e, ê",
      "ageGroup": "MG 5–6 tuổi",
      "type": "Video clip",
      "campus": "Khối Mẫu giáo 5–6 tuổi",
      "author": "Tổ Mẫu giáo 5–6 tuổi",
      "date": "12/11/2026",
      "description": "Video chuyên đề sinh hoạt chuyên môn cấp tổ hướng dẫn trẻ nhận biết nét chữ, phát âm rõ ràng chữ e, ê qua các hoạt động nhóm sinh động.",
      "tags": [
        "Chuyên đề cấp tổ",
        "Làm quen chữ cái",
        "e ê"
      ],
      "interactiveTarget": "alphabet"
    },
    {
      "id": "res-chu-cai-o-oo-ow",
      "title": "Phương pháp làm quen chữ cái: o, ô, ơ",
      "ageGroup": "MG 5–6 tuổi",
      "type": "PowerPoint",
      "campus": "Lớp MG 5–6 tuổi Cam Sơn",
      "author": "Điểm trường Cam Sơn",
      "date": "10/11/2026",
      "description": "Bài giảng PowerPoint trực quan giúp trẻ mẫu giáo 5–6 tuổi phân biệt nét tròn, dấu mũ và dấu móc của nhóm chữ cái o, ô, ơ qua các trò chơi nhận diện từ vựng sinh động.",
      "tags": [
        "Làm quen chữ cái",
        "Điểm trường Cam Sơn",
        "o ô ơ"
      ],
      "interactiveTarget": "alphabet"
    },
    {
      "id": "res-ai-chu-cai-u-uw",
      "title": "Ứng dụng AI trong hoạt động làm quen chữ cái: u, ư",
      "ageGroup": "MG 5–6 tuổi",
      "type": "PowerPoint",
      "campus": "Khối Mẫu giáo 5–6 tuổi",
      "author": "Tổ Mẫu giáo 5–6 tuổi",
      "date": "08/11/2026",
      "description": "Ứng dụng công nghệ AI thiết kế nhân vật hoạt hình đồng hành cùng bé nhận diện và phát âm chữ cái u, ư.",
      "tags": [
        "Ứng dụng AI",
        "Làm quen chữ cái",
        "u ư"
      ]
    },
    {
      "id": "res-tro-choi-doan-nhac-cu",
      "title": "Trò chơi âm nhạc: “Đoán tên nhạc cụ”",
      "ageGroup": "MG 5–6 tuổi",
      "type": "Trò chơi",
      "campus": "Lớp MG 5–6 tuổi B Cam Chính",
      "author": "Tổ Mẫu giáo 5–6 tuổi",
      "date": "05/11/2026",
      "description": "Trò chơi phát triển thính giác và cảm thụ âm nhạc, giúp trẻ phân biệt âm sắc của trống, đàn, phách tre, sắc xô. Có thể chơi trực tiếp tại Góc Bé Vui Học.",
      "tags": [
        "Trò chơi âm nhạc",
        "Phát triển thẩm mỹ",
        "Góc Bé Vui Học"
      ],
      "interactiveTarget": "quiz"
    },
    {
      "id": "res-tro-choi-giac-quan",
      "title": "Trò chơi khám phá: “Giác quan kỳ diệu” & Tìm hiểu 5 giác quan",
      "ageGroup": "MG 5–6 tuổi",
      "type": "Trò chơi",
      "campus": "Lớp MG 5–6 tuổi A Phân hiệu & Cam Sơn",
      "author": "Tổ Mẫu giáo 5–6 tuổi",
      "date": "03/11/2026",
      "description": "Bộ trò chơi và bài giảng giúp bé nhận biết chức năng của thị giác, thính giác, khứu giác, vị giác và xúc giác cùng cách bảo vệ cơ thể.",
      "tags": [
        "5 giác quan",
        "Khám phá khoa học",
        "Góc Bé Vui Học"
      ],
      "interactiveTarget": "quiz"
    },
    {
      "id": "res-ai-chuyen-qua-trung",
      "title": "Ứng dụng AI trong hoạt động phát triển ngôn ngữ: Truyện “Quả trứng”",
      "ageGroup": "Nhà trẻ 24–36 tháng",
      "type": "PowerPoint",
      "campus": "Khối Nhà trẻ 24–36 tháng tuổi",
      "author": "Tổ Nhà trẻ",
      "date": "01/11/2026",
      "description": "Học liệu tranh động AI đầy màu sắc phù hợp với độ tập trung của trẻ nhà trẻ 24–36 tháng, kích thích trẻ tập nói và bắt chước tiếng kêu các con vật.",
      "tags": [
        "Nhà trẻ 24-36 tháng",
        "Phát triển ngôn ngữ",
        "Ứng dụng AI"
      ]
    },
    {
      "id": "res-tro-choi-tim-doi-dep",
      "title": "Trò chơi vận động & nhận biết: “Tìm đúng đôi dép”",
      "ageGroup": "MG 3–4 tuổi",
      "type": "Video clip",
      "campus": "Lớp MG 3–4 tuổi Cam Sơn",
      "author": "Điểm trường Cam Sơn",
      "date": "28/10/2026",
      "description": "Hoạt động rèn phản xạ nhanh, kỹ năng ghép đôi tương ứng về màu sắc, kích thước và tính tự lập mang giày dép cho trẻ 3–4 tuổi.",
      "tags": [
        "Khối 3-4 tuổi",
        "Kỹ năng tự phục vụ",
        "Video clip"
      ]
    },
    {
      "id": "res-tao-hinh-trang-tri-vay",
      "title": "Hoạt động tạo hình: Trang trí trang phục bạn trai, bạn gái",
      "ageGroup": "MG 4–5 tuổi",
      "type": "Video clip",
      "campus": "Lớp 4–5 tuổi B Phân hiệu",
      "author": "Tổ Mẫu giáo 4–5 tuổi",
      "date": "25/10/2026",
      "description": "Rèn kỹ năng vận động tinh, phối hợp màu sắc và óc sáng tạo thẩm mỹ cho trẻ mẫu giáo nhỡ qua các nguyên vật liệu thiên nhiên.",
      "tags": [
        "Hoạt động tạo hình",
        "Điểm Phân hiệu"
      ]
    },
    {
      "id": "res-ngay-hoi-doc-sach",
      "title": "Ngày hội đọc sách của bé & Trò chơi vận động “Chuyền vòng qua chân”",
      "ageGroup": "MG 4–5 tuổi",
      "type": "Video clip",
      "campus": "Lớp 4–5 tuổi A Cam Chính & A Phân hiệu",
      "author": "Tổ Mẫu giáo 4–5 tuổi",
      "date": "20/10/2026",
      "description": "Nuôi dưỡng tình yêu sách tranh từ sớm kết hợp trò chơi vận động tập thể rèn sự khéo léo, tinh thần đồng đội.",
      "tags": [
        "Văn hóa đọc",
        "Trò chơi vận động"
      ]
    },
    {
      "id": "res-tai-lieu-steam-sel",
      "title": "Cẩm nang ứng dụng giáo dục STEAM & Bồi dưỡng cảm xúc xã hội (SEL) cho trẻ mầm non",
      "ageGroup": "Chung",
      "type": "Cẩm nang",
      "campus": "Toàn trường",
      "author": "Ban Chuyên môn Trường MN Lê Thế Hiếu",
      "date": "15/10/2026",
      "description": "Tài liệu bồi dưỡng chuyên môn giúp giáo viên và phụ huynh phối hợp xây dựng 'Lớp học hạnh phúc', phát triển tư duy STEAM và trí tuệ cảm xúc cho trẻ.",
      "tags": [
        "Giáo dục STEAM",
        "Cảm xúc xã hội SEL",
        "Cẩm nang"
      ]
    }
  ],
  "documents": [
    {
      "id": "ck-2026-tuyen-sinh",
      "code": "KH-TS/2026-2027",
      "title": "Hướng dẫn tuyển sinh mầm non và giao bổ sung chỉ tiêu tuyển sinh năm học 2026 – 2027",
      "category": "Công khai 2026–2027",
      "issuer": "Trường Mầm non Lê Thế Hiếu",
      "issueDate": "25/08/2026",
      "effectiveDate": "01/09/2026",
      "level": "Cấp Mầm non",
      "summary": "Công khai chỉ tiêu, đối tượng, địa bàn tuyển sinh tại Trường chính Cam Chính, Điểm Phân hiệu, Điểm trường Cam Sơn và Cam Lộc; hướng dẫn hồ sơ nhập học trực tiếp và trực tuyến cho trẻ từ 24 tháng đến 5 tuổi."
    },
    {
      "id": "ck-2026-chat-luong",
      "code": "CK-CLGD/2026-2027",
      "title": "Báo cáo công khai cam kết chất lượng giáo dục, đội ngũ và cơ sở vật chất năm học 2026 – 2027",
      "category": "Công khai 2026–2027",
      "issuer": "Trường Mầm non Lê Thế Hiếu",
      "issueDate": "05/09/2026",
      "effectiveDate": "05/09/2026",
      "level": "Cấp Mầm non",
      "summary": "Thực hiện Thông tư công khai trong cơ sở giáo dục mầm non: Công khai điều kiện cơ sở vật chất, thiết bị đồ chơi tại các điểm trường sau hợp nhất, trình độ chuẩn đội ngũ giáo viên và mục tiêu chất lượng nuôi dưỡng – chăm sóc trẻ."
    },
    {
      "id": "ck-2026-du-toan",
      "code": "CK-NS/2026",
      "title": "Công khai dự toán thu – chi ngân sách nhà nước và các khoản thu dịch vụ phục vụ bán trú năm học 2026 – 2027",
      "category": "Công khai 2026–2027",
      "issuer": "Trường Mầm non Lê Thế Hiếu",
      "issueDate": "18/09/2026",
      "effectiveDate": "20/09/2026",
      "level": "Cấp Mầm non",
      "summary": "Công khai minh bạch dự toán ngân sách nhà nước giao và các khoản thỏa thuận phục vụ bán trú, chăm sóc trẻ theo đúng quy định của HĐND tỉnh Quảng Trị và sự đồng thuận tại Hội nghị cha mẹ trẻ đầu năm học."
    },
    {
      "id": "vb-truong-qd25",
      "code": "25/QĐ-MNLTH",
      "title": "Quyết định về việc ban hành Quy chế thực hiện dân chủ trong hoạt động của Trường Mầm non Lê Thế Hiếu năm học 2026 – 2027",
      "category": "Văn bản Nhà trường",
      "issuer": "Trường Mầm non Lê Thế Hiếu",
      "issueDate": "08/09/2026",
      "effectiveDate": "08/09/2026",
      "level": "Nhà trường",
      "summary": "Quy định rõ trách nhiệm công khai, minh bạch của Ban Giám hiệu, quyền được biết, được bàn và giám sát của cán bộ, giáo viên, nhân viên và cha mẹ trẻ trong mọi hoạt động giáo dục của nhà trường."
    },
    {
      "id": "vb-truong-qd26",
      "code": "26/QĐ-MNLTH",
      "title": "Quyết định về việc ban hành Quy chế làm việc của Trường Mầm non Lê Thế Hiếu năm học 2026 – 2027",
      "category": "Văn bản Nhà trường",
      "issuer": "Trường Mầm non Lê Thế Hiếu",
      "issueDate": "08/09/2026",
      "effectiveDate": "08/09/2026",
      "level": "Nhà trường",
      "summary": "Quy định nguyên tắc làm việc, chế độ trách nhiệm, phân công nhiệm vụ giữa Hiệu trưởng, các Phó Hiệu trưởng, Tổ trưởng chuyên môn, giáo viên và nhân viên tại Trường chính cùng các điểm trường lẻ."
    },
    {
      "id": "vb-truong-qd27",
      "code": "27/QĐ-MNLTH",
      "title": "Quyết định về việc ban hành Quy chế Văn hóa công sở Trường Mầm non Lê Thế Hiếu năm học 2026 – 2027",
      "category": "Văn bản Nhà trường",
      "issuer": "Trường Mầm non Lê Thế Hiếu",
      "issueDate": "08/09/2026",
      "effectiveDate": "08/09/2026",
      "level": "Nhà trường",
      "summary": "Chuẩn mực giao tiếp sư phạm, trang phục, thái độ ứng xử mẫu mực, yêu thương, tôn trọng trẻ và thái độ cầu thị, chu đáo khi trao đổi với phụ huynh học sinh."
    },
    {
      "id": "vb-truong-qd28",
      "code": "28/QĐ-MNLTH",
      "title": "Quyết định về việc ban hành Quy chế hoạt động và mối quan hệ phối hợp giữa các tổ chức trong nhà trường năm học 2026 – 2027",
      "category": "Văn bản Nhà trường",
      "issuer": "Trường Mầm non Lê Thế Hiếu",
      "issueDate": "08/09/2026",
      "effectiveDate": "08/09/2026",
      "level": "Nhà trường",
      "summary": "Quy định cơ chế phối hợp nhịp nhàng giữa Đảng bộ, Ban Giám hiệu, Hội đồng trường, Công đoàn, Chi đoàn Thanh niên và Ban đại diện Cha mẹ trẻ."
    },
    {
      "id": "vb-xa-hop-nhat",
      "code": "QĐ-UBND",
      "title": "Quyết định về việc hợp nhất Trường Mầm non Bình Minh và Trường Mầm non Hoa Mai thành Trường Mầm non Lê Thế Hiếu",
      "category": "Văn bản Xã Cam Lộ",
      "issuer": "UBND xã Cam Lộ",
      "issueDate": "15/08/2026",
      "effectiveDate": "01/09/2026",
      "level": "UBND xã Cam Lộ",
      "summary": "Văn bản pháp lý quan trọng đánh dấu sự ra đời của Trường Mầm non Lê Thế Hiếu trên cơ sở hợp nhất hai trường Mầm non Bình Minh và Mầm non Hoa Mai trên địa bàn xã Cam Lộ, tỉnh Quảng Trị."
    },
    {
      "id": "vb-xa-vien-chuc",
      "code": "QĐ-UBND-VC",
      "title": "Quyết định về việc tiếp nhận và bố trí viên chức, người lao động làm việc tại Trường Mầm non Lê Thế Hiếu",
      "category": "Văn bản Xã Cam Lộ",
      "issuer": "UBND xã Cam Lộ",
      "issueDate": "20/08/2026",
      "effectiveDate": "01/09/2026",
      "level": "UBND xã Cam Lộ",
      "summary": "Kiện toàn đội ngũ cán bộ quản lý, giáo viên và nhân viên nuôi dưỡng – văn phòng sau khi hợp nhất hai đơn vị trường học."
    },
    {
      "id": "vb-xa-duong-day-nong",
      "code": "TB-UBND",
      "title": "Thông báo về việc công khai đường dây nóng bảo vệ trẻ em trên địa bàn xã Cam Lộ",
      "category": "Văn bản Xã Cam Lộ",
      "issuer": "UBND xã Cam Lộ",
      "issueDate": "16/11/2026",
      "effectiveDate": "16/11/2026",
      "level": "UBND xã Cam Lộ",
      "summary": "Công khai số điện thoại tiếp nhận thông tin, tư vấn và can thiệp khẩn cấp nhằm bảo vệ quyền trẻ em, phòng chống xâm hại, bạo lực trẻ em trên địa bàn xã Cam Lộ kết nối cùng Tổng đài Quốc gia 111."
    },
    {
      "id": "vb-xa-xep-hang",
      "code": "QĐ-UBND-XH",
      "title": "Quyết định về việc xếp hạng các đơn vị trường học thuộc UBND xã Cam Lộ và Kế hoạch phát triển giáo dục giai đoạn 2026 – 2030, tầm nhìn 2035",
      "category": "Văn bản Xã Cam Lộ",
      "issuer": "UBND xã Cam Lộ",
      "issueDate": "10/09/2026",
      "effectiveDate": "10/09/2026",
      "level": "UBND xã Cam Lộ",
      "summary": "Định hướng đầu tư cơ sở vật chất, giữ vững và nâng cao tiêu chí trường mầm non đạt chuẩn quốc gia trên địa bàn xã Cam Lộ giai đoạn 2026–2030."
    },
    {
      "id": "vb-so-4425",
      "code": "4425/CTr-SGDĐT",
      "title": "Chương trình công tác trọng tâm ngành Giáo dục và Đào tạo tỉnh Quảng Trị năm học 2026 – 2027",
      "category": "Văn bản Sở & Bộ (Cấp Mầm non)",
      "issuer": "Sở GD&ĐT Quảng Trị",
      "issueDate": "28/08/2026",
      "effectiveDate": "01/09/2026",
      "level": "Cấp Mầm non",
      "summary": "Đã sửa lỗi đảo ngày hiệu lực trên CMS cũ. Triển khai các nhiệm vụ trọng tâm cấp học Mầm non: đảm bảo an toàn tuyệt đối về thể chất và tinh thần cho trẻ, nâng cao chất lượng chuyên đề 'Xây dựng trường mầm non lấy trẻ làm trung tâm'."
    },
    {
      "id": "vb-so-pho-cap-mn",
      "code": "CV-SGDĐT-GDMN",
      "title": "Công văn hướng dẫn triển khai phổ cập Giáo dục Mầm non cho trẻ em từ 3 đến 5 tuổi và quản lý đồ dùng, đồ chơi, học liệu",
      "category": "Văn bản Sở & Bộ (Cấp Mầm non)",
      "issuer": "Sở GD&ĐT Quảng Trị",
      "issueDate": "04/09/2026",
      "effectiveDate": "04/09/2026",
      "level": "Cấp Mầm non",
      "summary": "Hướng dẫn các cơ sở GDMN lựa chọn, khai thác thiết bị, đồ chơi an toàn và thực hiện mục tiêu phổ cập giáo dục mầm non cho trẻ mẫu giáo 3–5 tuổi."
    },
    {
      "id": "vb-bo-tt03-tt93",
      "code": "03/2026/TT-BGDĐT",
      "title": "Triển khai thực hiện Thông tư số 03/2026/TT-BGDĐT quy định Quy tắc ứng xử của nhà giáo và Quy chế phối hợp Y tế trường học",
      "category": "Văn bản Sở & Bộ (Cấp Mầm non)",
      "issuer": "Bộ GD&ĐT / Sở GD&ĐT",
      "issueDate": "12/09/2026",
      "effectiveDate": "15/09/2026",
      "level": "Cấp Mầm non",
      "summary": "Chuẩn hóa quy tắc ứng xử sư phạm trong cơ sở giáo dục và quy chế phối hợp giữa ngành Giáo dục với ngành Y tế trong chăm sóc sức khỏe ban đầu cho trẻ."
    }
  ],
  "menu": {
    "notice": "[DỮ LIỆU MẪU MINH HỌA – CẬP NHẬT TRONG data/menu.json]",
    "weekLabel": "Tuần lễ mẫu Năm học 2026 – 2027 (Áp dụng quy trình Bếp ăn bán trú một chiều & Lưu mẫu thức ăn 24 giờ)",
    "nutritionNote": "Thực đơn trên cổng cũ (/hoat-dong-chuyen-mon/to-nuoi-duong/thuc-don-cua-be) hiện đang để trống ('Nội dung đang cập nhật...'). Dưới đây là khung dữ liệu mẫu chuẩn dinh dưỡng mầm non để Tổ Nuôi dưỡng dễ dàng điền thực đơn thực tế hàng tuần vào file data/menu.json.",
    "days": [
      {
        "dayId": "thu-2",
        "dayName": "Thứ Hai",
        "shortName": "Thứ 2",
        "theme": "Khởi đầu tuần mới tràn năng lượng",
        "meals": {
          "morning": {
            "time": "08:30 – 09:00 (Bổ sung sữa học đường / Điểm tâm)",
            "dish": "Sữa tươi tiệt trùng / Cháo yến mạch thịt bằm ấm bụng",
            "benefit": "Bổ sung Canxi và năng lượng nhẹ sau giờ thể dục sáng"
          },
          "lunch": {
            "time": "10:45 – 11:30 (Bữa chính trưa bán trú)",
            "dish": "Cơm trắng dẻo • Thịt heo kho trứng cút • Canh bí đỏ nấu tôm tươi • Chuối chín tráng miệng",
            "benefit": "Đầy đủ 4 nhóm chất: Đạm, Tinh bột, Chất béo, Vitamin A & chất xơ"
          },
          "afternoon": {
            "time": "14:30 – 15:00 (Bữa phụ chiều sau giấc ngủ trưa)",
            "dish": "Phở gà ta nấu mềm + Nước cam tươi",
            "benefit": "Dễ tiêu hóa, tăng đề kháng Vitamin C cho hoạt động chiều"
          }
        },
        "schedule": {
          "morningActivity": "Đón trẻ, thể dục sáng theo nhạc 'Xòe ra nắm vào' • Hoạt động học: Làm quen chữ cái (a, ă, â) / Khám phá khoa học",
          "afternoonActivity": "Vận động nhẹ sau ngủ trưa • Rèn kỹ năng vệ sinh răng miệng • Chơi tự chọn ở các góc & Trả trẻ"
        }
      },
      {
        "dayId": "thu-3",
        "dayName": "Thứ Ba",
        "shortName": "Thứ 3",
        "theme": "Bé khỏe – Bé khéo tay",
        "meals": {
          "morning": {
            "time": "08:30 – 09:00 (Điểm tâm giữa giờ)",
            "dish": "Sữa hạt dinh dưỡng / Súp gà ngô non",
            "benefit": "Giàu đạm thực vật và chất xơ tự nhiên"
          },
          "lunch": {
            "time": "10:45 – 11:30 (Bữa chính trưa bán trú)",
            "dish": "Cơm trắng • Cá thu rim sốt cà chua (đã lọc sạch xương) • Canh rau ngót nấu thịt nạc • Đu đủ chín",
            "benefit": "Giàu Omega-3 tốt cho trí não và thị lực của trẻ"
          },
          "afternoon": {
            "time": "14:30 – 15:00 (Bữa phụ chiều)",
            "dish": "Cháo sườn non đậu xanh + Sữa chua men sống",
            "benefit": "Hỗ trợ hệ tiêu hóa khỏe mạnh, hấp thu dưỡng chất tốt"
          }
        },
        "schedule": {
          "morningActivity": "Đón trẻ • Thể dục sáng • Hoạt động Tạo hình: Trang trí trang phục bạn trai, bạn gái / Khám phá 5 giác quan",
          "afternoonActivity": "Nghe kể chuyện 'Gấu con bị sâu răng' • Trò chơi vận động 'Tìm đúng đôi dép' & Trả trẻ"
        }
      },
      {
        "dayId": "thu-4",
        "dayName": "Thứ Tư",
        "shortName": "Thứ 4",
        "theme": "Bữa ăn gia đình – Gắn kết yêu thương",
        "meals": {
          "morning": {
            "time": "08:30 – 09:00 (Điểm tâm giữa giờ)",
            "dish": "Sữa tươi học đường / Bánh bông lan mềm",
            "benefit": "Cung cấp năng lượng cho các hoạt động ngoài trời"
          },
          "lunch": {
            "time": "10:45 – 11:30 (Trải nghiệm Bữa ăn gia đình)",
            "dish": "Cơm trắng • Thịt gà om nấm hương • Trứng cuộn rau củ • Canh cải ngọt nấu thịt bằm • Dưa hấu ngọt",
            "benefit": "Rèn kỹ năng tự phục vụ, biết lấy thức ăn vừa đủ và sẻ chia cùng bạn"
          },
          "afternoon": {
            "time": "14:30 – 15:00 (Bữa phụ chiều)",
            "dish": "Bún mọc giò sống dọc mùng nấu chín kỹ",
            "benefit": "Đổi vị thanh mát, giàu dinh dưỡng cho buổi chiều"
          }
        },
        "schedule": {
          "morningActivity": "Đón trẻ • Hoạt động làm quen Toán sơ đẳng & Giáo dục âm nhạc: Trò chơi 'Đoán tên nhạc cụ'",
          "afternoonActivity": "Thực hành kỹ năng sống: Tự gấp quần áo, sắp xếp đồ dùng cá nhân • Vui chơi ngoài trời & Trả trẻ"
        }
      },
      {
        "dayId": "thu-5",
        "dayName": "Thứ Năm",
        "shortName": "Thứ 5",
        "theme": "Khám phá STEAM & Thiên nhiên vùng Cùa",
        "meals": {
          "morning": {
            "time": "08:30 – 09:00 (Điểm tâm giữa giờ)",
            "dish": "Sữa đậu nành ấm / Cháo thịt bò rau củ",
            "benefit": "Giàu sắt và kẽm giúp bé hồng hào, nhanh nhẹn"
          },
          "lunch": {
            "time": "10:45 – 11:30 (Bữa chính trưa bán trú)",
            "dish": "Cơm trắng • Tôm thịt rim mặn ngọt • Su su, cà rốt xào thịt • Canh mồng tơi nấu tôm • Thanh long",
            "benefit": "Tăng cường khoáng chất, chất xơ giúp bé tiêu hóa dễ dàng"
          },
          "afternoon": {
            "time": "14:30 – 15:00 (Bữa phụ chiều)",
            "dish": "Nui sao nấu thịt bằm, cà rốt + Váng sữa",
            "benefit": "Món ăn hình ngôi sao bắt mắt giúp trẻ ăn ngon miệng"
          }
        },
        "schedule": {
          "morningActivity": "Đón trẻ • Ứng dụng AI khám phá khoa học: 'Chú voi ngộ nghĩnh' & 'Chuyện quả trứng'",
          "afternoonActivity": "Ngày hội đọc sách của bé tại góc thư viện • Trò chơi tập thể 'Chuyền vòng qua chân' & Trả trẻ"
        }
      },
      {
        "dayId": "thu-6",
        "dayName": "Thứ Sáu",
        "shortName": "Thứ 6",
        "theme": "Nêu gương Bé ngoan – Vui khỏe cuối tuần",
        "meals": {
          "morning": {
            "time": "08:30 – 09:00 (Điểm tâm giữa giờ)",
            "dish": "Sữa tươi tiệt trùng",
            "benefit": "Đảm bảo định lượng dinh dưỡng chuẩn hàng ngày"
          },
          "lunch": {
            "time": "10:45 – 11:30 (Bữa chính trưa bán trú)",
            "dish": "Cơm trắng • Thịt bò hầm khoai tây, cà rốt • Canh bí xanh nấu sườn non • Quýt ngọt tráng miệng",
            "benefit": "Món hầm mềm giàu dưỡng chất, dễ nhai nuốt cho mọi độ tuổi"
          },
          "afternoon": {
            "time": "14:30 – 15:00 (Bữa phụ chiều)",
            "dish": "Chè đậu xanh hạt sen thanh mát + Bánh quy bơ",
            "benefit": "Thanh nhiệt, bổ dưỡng trước khi kết thúc tuần học"
          }
        },
        "schedule": {
          "morningActivity": "Đón trẻ • Biểu diễn văn nghệ cuối tuần • Tổng vệ sinh lớp học & Chăm sóc góc thiên nhiên",
          "afternoonActivity": "Sinh hoạt nêu gương Hoa Bé Ngoan • Trao đổi cùng phụ huynh về tình hình tuần qua của bé"
        }
      }
    ]
  }
};

  const state = {
    siteConfig: INLINE_FALLBACK.siteConfig,
    news: INLINE_FALLBACK.news,
    resources: INLINE_FALLBACK.resources,
    documents: INLINE_FALLBACK.documents,
    menu: INLINE_FALLBACK.menu,
    selectedDayId: 'thu-2',
    resourceFilter: {
      query: '',
      ageGroup: 'ALL',
      type: 'ALL'
    },
    docFilter: {
      category: 'ALL',
      query: ''
    }
  };

  /* ==========================================================================
     2. NẠP DỮ LIỆU TỪ data/*.json (Nếu chạy qua HTTP Server sẽ ưu tiên JSON mới nhất)
     ========================================================================== */
  async function fetchJsonWithFallback(url, fallbackData) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return fallbackData;
      return await res.json();
    } catch (err) {
      return fallbackData;
    }
  }

  async function loadAllData() {
    const [siteConfig, news, resources, documents, menu] = await Promise.all([
      fetchJsonWithFallback('data/site-config.json', INLINE_FALLBACK.siteConfig),
      fetchJsonWithFallback('data/news.json', INLINE_FALLBACK.news),
      fetchJsonWithFallback('data/resources.json', INLINE_FALLBACK.resources),
      fetchJsonWithFallback('data/documents.json', INLINE_FALLBACK.documents),
      fetchJsonWithFallback('data/menu.json', INLINE_FALLBACK.menu)
    ]);

    state.siteConfig = siteConfig;
    state.news = news;
    state.resources = resources;
    state.documents = documents;
    state.menu = menu;
  }

  /* ==========================================================================
     3. RENDER CẤU HÌNH TRƯỜNG, CƠ CẤU TỔ CHỨC & BẢN ĐỒ ĐIỂM TRƯỜNG
     ========================================================================== */
  function renderOrganizationAndCampuses() {
    const orgContainer = document.getElementById('org-structure-grid');
    if (orgContainer && state.siteConfig.organization) {
      orgContainer.innerHTML = state.siteConfig.organization
        .map(
          (grp) => `
          <div class="org-card">
            <div class="org-card-header">
              <span class="org-icon" aria-hidden="true">${Utils.escapeHTML(grp.icon)}</span>
              <h3 class="org-group-title">${Utils.escapeHTML(grp.group)}</h3>
            </div>
            <ul class="org-unit-list">
              ${grp.units
                .map(
                  (u) => `
                <li class="org-unit-item">
                  <div class="org-unit-name">${Utils.escapeHTML(u.name)}</div>
                  <div class="org-unit-desc">${Utils.escapeHTML(u.desc)}</div>
                </li>`
                )
                .join('')}
            </ul>
          </div>`
        )
        .join('');
    }

    const campusContainer = document.getElementById('campuses-grid');
    if (campusContainer && state.siteConfig.campuses) {
      campusContainer.innerHTML = state.siteConfig.campuses
        .map((c) => {
          const cls = c.isMain ? 'main-campus' : c.isTemplate ? 'template-campus' : '';
          const badge = c.isMain
            ? 'Trụ sở chính'
            : c.isTemplate
            ? 'Mẫu cấu hình mở'
            : 'Điểm trường trực thuộc';
          return `
            <div class="campus-card ${cls}">
              <span class="campus-badge">${Utils.escapeHTML(badge)}</span>
              <h4 class="campus-name">${Utils.escapeHTML(c.name)}</h4>
              <p class="campus-meta">📍 <strong>Địa chỉ:</strong> ${Utils.escapeHTML(c.address)}</p>
              <p class="campus-meta">👶 <strong>Độ tuổi:</strong> ${Utils.escapeHTML(c.ageGroups)}</p>
              <p class="campus-meta">${Utils.escapeHTML(c.features)}</p>
            </div>
          `;
        })
        .join('');
    }
  }

  /* ==========================================================================
     4. RENDER TIN TỨC & SỰ KIỆN (BỐ CỤC BÁO CHÍ BENTO GRID — KHÔNG LẶP TIN)
     ========================================================================== */
  function renderNewsBento() {
    const container = document.getElementById('news-bento-container');
    if (!container || !Array.isArray(state.news) || state.news.length === 0) return;

    // Khử trùng lặp theo id để đảm bảo 100% không bao giờ lặp tin như bản gốc
    const seenIds = new Set();
    const uniqueNews = state.news.filter((item) => {
      if (!item || !item.id || seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

    const featured = uniqueNews.find((n) => n.featured) || uniqueNews[0];
    const sideList = uniqueNews.filter((n) => n.id !== featured.id).slice(0, 4);

    container.innerHTML = `
      <article class="news-featured-card">
        <img src="${Utils.escapeHTML(featured.image)}" alt="${Utils.escapeHTML(featured.title)}" class="news-featured-img" width="640" height="400" />
        <div class="news-featured-body">
          <div class="news-meta">
            <span class="news-cat-badge">⭐ Tin tiêu điểm • ${Utils.escapeHTML(featured.category)}</span>
            <span>📅 ${Utils.escapeHTML(featured.date)}</span>
          </div>
          <h3 class="news-featured-title">${Utils.escapeHTML(featured.title)}</h3>
          <p class="news-featured-summary">${Utils.escapeHTML(featured.summary)}</p>
          <div class="news-card-actions">
            <button type="button" class="btn btn-primary" data-open-news="${Utils.escapeHTML(featured.id)}">
              📖 Đọc toàn bộ & Nghe đọc bài
            </button>
          </div>
        </div>
      </article>
      <div class="news-side-list">
        ${sideList
          .map(
            (item) => `
          <article class="news-item-card">
            <img src="${Utils.escapeHTML(item.image)}" alt="${Utils.escapeHTML(item.title)}" class="news-item-thumb" loading="lazy" width="240" height="150" />
            <div>
              <div class="news-meta">
                <span class="news-cat-badge">${Utils.escapeHTML(item.category)}</span>
                <span>📅 ${Utils.escapeHTML(item.date)}</span>
              </div>
              <h4 class="news-item-title">${Utils.escapeHTML(item.title)}</h4>
              <div class="news-card-actions">
                <button type="button" class="btn-read-more" data-open-news="${Utils.escapeHTML(item.id)}">
                  📖 Đọc bài & Nghe 🔊
                </button>
              </div>
            </div>
          </article>`
          )
          .join('')}
      </div>
    `;

    container.querySelectorAll('[data-open-news]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const newsId = btn.getAttribute('data-open-news');
        const article = uniqueNews.find((n) => n.id === newsId);
        if (!article) return;

        const paragraphs = Array.isArray(article.content)
          ? article.content.map((p) => `<p>${Utils.escapeHTML(p)}</p>`).join('')
          : `<p>${Utils.escapeHTML(article.summary)}</p>`;

        const speechStr = Array.isArray(article.content)
          ? article.content.join(' ')
          : article.summary;

        const backdrop = document.getElementById('universal-modal');
        if (backdrop) backdrop.setAttribute('data-mode', 'article');

        Interactive.openModal({
          badge: article.category,
          title: article.title,
          date: article.date,
          bodyHtml: `
            <img src="${Utils.escapeHTML(article.image)}" alt="${Utils.escapeHTML(article.title)}" style="width:100%; max-height:300px; object-fit:cover; border-radius:var(--radius-md); border:1px solid var(--color-border);" />
            ${paragraphs}
          `,
          speechText: speechStr,
          shareId: 'tin-tuc'
        });
      });
    });
  }

  /* ==========================================================================
     5. RENDER THỰC ĐƠN TUẦN & KẾ HOẠCH TUẦN (THỨ 2 -> THỨ 6 + BẢNG IN A4)
     ========================================================================== */
  function renderWeeklyMenuAndSchedule() {
    const days = (state.menu && state.menu.days) || [];
    const tabsContainer = document.getElementById('menu-day-tabs');
    const panelContainer = document.getElementById('menu-day-panel');
    const printTableBody = document.getElementById('print-full-week-tbody');

    if (!tabsContainer || !panelContainer || days.length === 0) return;

    tabsContainer.innerHTML = days
      .map(
        (d) => `
        <button type="button" role="tab"
                aria-selected="${d.dayId === state.selectedDayId ? 'true' : 'false'}"
                class="day-tab-btn ${d.dayId === state.selectedDayId ? 'active' : ''}"
                data-day-id="${Utils.escapeHTML(d.dayId)}">
          📅 ${Utils.escapeHTML(d.dayName)}
        </button>`
      )
      .join('');

    const activeDay = days.find((d) => d.dayId === state.selectedDayId) || days[0];

    panelContainer.innerHTML = `
      <div class="menu-day-header">
        <div>
          <span class="section-eyebrow">${Utils.escapeHTML(activeDay.dayName)}</span>
          <h3 style="font-family:var(--font-display); font-size:var(--text-xl); font-weight:800;">
            🌟 Chủ đề ngày: ${Utils.escapeHTML(activeDay.theme)}
          </h3>
        </div>
        <button type="button" class="btn btn-primary no-print" id="btn-print-menu-inline">
          🖨️ In / Lưu PDF chuẩn A4
        </button>
      </div>

      <div class="meals-grid">
        <div class="meal-card">
          <div class="meal-time">🥛 BỮA PHỤ SÁNG • ${Utils.escapeHTML(activeDay.meals.morning.time)}</div>
          <div class="meal-dish">${Utils.escapeHTML(activeDay.meals.morning.dish)}</div>
          <div class="meal-benefit">💡 ${Utils.escapeHTML(activeDay.meals.morning.benefit)}</div>
        </div>
        <div class="meal-card lunch-highlight">
          <div class="meal-time">🍲 BỮA TRƯA BÁN TRÚ • ${Utils.escapeHTML(activeDay.meals.lunch.time)}</div>
          <div class="meal-dish">${Utils.escapeHTML(activeDay.meals.lunch.dish)}</div>
          <div class="meal-benefit">💡 ${Utils.escapeHTML(activeDay.meals.lunch.benefit)}</div>
        </div>
        <div class="meal-card">
          <div class="meal-time">🍊 BỮA PHỤ CHIỀU • ${Utils.escapeHTML(activeDay.meals.afternoon.time)}</div>
          <div class="meal-dish">${Utils.escapeHTML(activeDay.meals.afternoon.dish)}</div>
          <div class="meal-benefit">💡 ${Utils.escapeHTML(activeDay.meals.afternoon.benefit)}</div>
        </div>
      </div>

      <div class="schedule-box">
        <div>
          <div style="font-weight:800; color:var(--color-warm-dark); margin-bottom:4px;">☀️ Kế hoạch Hoạt động Buổi sáng</div>
          <p style="font-size:var(--text-sm);">${Utils.escapeHTML(activeDay.schedule.morningActivity)}</p>
        </div>
        <div>
          <div style="font-weight:800; color:var(--color-warm-dark); margin-bottom:4px;">🌤️ Kế hoạch Hoạt động Buổi chiều</div>
          <p style="font-size:var(--text-sm);">${Utils.escapeHTML(activeDay.schedule.afternoonActivity)}</p>
        </div>
      </div>
    `;

    tabsContainer.querySelectorAll('[data-day-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedDayId = btn.getAttribute('data-day-id');
        renderWeeklyMenuAndSchedule();
      });
    });

    const inlinePrintBtn = document.getElementById('btn-print-menu-inline');
    if (inlinePrintBtn) {
      inlinePrintBtn.addEventListener('click', Interactive.triggerPrintWeeklyMenu);
    }

    // Điền bảng tổng hợp cả tuần phục vụ in A4 và tra cứu tổng thể
    if (printTableBody) {
      printTableBody.innerHTML = days
        .map(
          (d) => `
          <tr>
            <td data-label="Thứ / Chủ đề"><strong>${Utils.escapeHTML(d.dayName)}</strong><br/><span style="font-size:0.78rem; color:var(--color-text-muted);">${Utils.escapeHTML(d.theme)}</span></td>
            <td data-label="Bữa phụ sáng">${Utils.escapeHTML(d.meals.morning.dish)}</td>
            <td data-label="Bữa chính trưa bán trú"><strong>${Utils.escapeHTML(d.meals.lunch.dish)}</strong></td>
            <td data-label="Bữa phụ chiều">${Utils.escapeHTML(d.meals.afternoon.dish)}</td>
            <td data-label="Kế hoạch hoạt động">
              <strong>Sáng:</strong> ${Utils.escapeHTML(d.schedule.morningActivity)}<br/>
              <strong>Chiều:</strong> ${Utils.escapeHTML(d.schedule.afternoonActivity)}
            </td>
          </tr>`
        )
        .join('');
    }
  }

  /* ==========================================================================
     6. KHO TÀI NGUYÊN SƯ PHẠM (LỌC ĐA ĐIỀU KIỆN + TÌM KIẾM KHÔNG DẤU)
     ========================================================================== */
  function renderResources() {
    const grid = document.getElementById('resources-grid-container');
    const countLabel = document.getElementById('resources-count-label');
    if (!grid) return;

    const qNorm = Utils.removeVietnameseTones(state.resourceFilter.query);
    const ageFilter = state.resourceFilter.ageGroup;
    const typeFilter = state.resourceFilter.type;

    const filtered = state.resources.filter((r) => {
      const matchAge = ageFilter === 'ALL' || r.ageGroup === ageFilter;
      const matchType = typeFilter === 'ALL' || r.type === typeFilter;
      if (!matchAge || !matchType) return false;
      if (!qNorm) return true;

      const haystack = Utils.removeVietnameseTones(
        `${r.title} ${r.description} ${r.campus} ${r.author} ${(r.tags || []).join(' ')}`
      );
      return haystack.includes(qNorm);
    });

    if (countLabel) {
      countLabel.textContent = `Hiển thị ${filtered.length} / ${state.resources.length} học liệu chuẩn hóa`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; background:var(--color-surface); padding:28px; border-radius:var(--radius-md); text-align:center; border:1px dashed var(--color-border);">
          <p style="font-weight:700; margin-bottom:8px;">Không tìm thấy học liệu phù hợp với bộ lọc hiện tại.</p>
          <button type="button" class="btn btn-secondary" id="btn-reset-resource-filter">Xoá bộ lọc tìm kiếm</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-reset-resource-filter');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.resourceFilter = { query: '', ageGroup: 'ALL', type: 'ALL' };
          const sInput = document.getElementById('resource-search-input');
          const ageSel = document.getElementById('resource-age-select');
          const typeSel = document.getElementById('resource-type-select');
          if (sInput) sInput.value = '';
          if (ageSel) ageSel.value = 'ALL';
          if (typeSel) typeSel.value = 'ALL';
          renderResources();
        });
      }
      return;
    }

    grid.innerHTML = filtered
      .map(
        (item) => `
        <article class="resource-card">
          <div class="resource-badges">
            <span class="badge-age">👶 ${Utils.escapeHTML(item.ageGroup)}</span>
            <span class="badge-type">📂 ${Utils.escapeHTML(item.type)}</span>
          </div>
          <h3 class="resource-title">${Utils.escapeHTML(item.title)}</h3>
          <p class="resource-desc">${Utils.escapeHTML(item.description)}</p>
          <div class="resource-footer">
            <span>🏫 ${Utils.escapeHTML(item.campus)}</span>
            <button type="button" class="btn-read-more" data-open-res="${Utils.escapeHTML(item.id)}">
              Xem chi tiết ➔
            </button>
          </div>
        </article>`
      )
      .join('');

    grid.querySelectorAll('[data-open-res]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-open-res');
        const item = state.resources.find((r) => r.id === resId);
        if (!item) return;

        Interactive.openModal({
          badge: `${item.ageGroup} • ${item.type}`,
          title: item.title,
          date: item.date,
          bodyHtml: `
            <p><strong>Đơn vị / Điểm lớp:</strong> ${Utils.escapeHTML(item.campus)}</p>
            <p><strong>Tác giả / Tổ chuyên môn:</strong> ${Utils.escapeHTML(item.author)}</p>
            <p>${Utils.escapeHTML(item.description)}</p>
            <div style="background:var(--color-primary-soft); padding:14px; border-radius:var(--radius-sm); font-size:var(--text-sm);">
              💡 <strong>Gợi ý thực hành cùng bé:</strong> Phụ huynh có thể mở ngay mục <em>"Góc Bé Vui Học Tại Nhà"</em> phía trên để cùng bé luyện phát âm chữ cái, nghe cô kể chuyện hoặc chơi trò chơi tương tác trực tiếp trên điện thoại.
            </div>
          `,
          speechText: `${item.title}. Khối ${item.ageGroup}. ${item.description}`,
          shareId: 'tai-nguyen'
        });
      });
    });
  }

  function initResourceFilters() {
    const sInput = document.getElementById('resource-search-input');
    const ageSel = document.getElementById('resource-age-select');
    const typeSel = document.getElementById('resource-type-select');

    if (sInput) {
      sInput.addEventListener('input', (e) => {
        state.resourceFilter.query = e.target.value;
        renderResources();
      });
    }
    if (ageSel) {
      ageSel.addEventListener('change', (e) => {
        state.resourceFilter.ageGroup = e.target.value;
        renderResources();
      });
    }
    if (typeSel) {
      typeSel.addEventListener('change', (e) => {
        state.resourceFilter.type = e.target.value;
        renderResources();
      });
    }
  }

  /* ==========================================================================
     7. HỆ THỐNG VĂN BẢN & CÔNG KHAI NĂM HỌC 2026–2027 (CHỈ HIỂN THỊ ĐÚNG CẤP)
     ========================================================================== */
  function renderDocuments() {
    const tbody = document.getElementById('documents-tbody');
    if (!tbody) return;

    const cat = state.docFilter.category;
    const qNorm = Utils.removeVietnameseTones(state.docFilter.query);

    const filtered = state.documents.filter((doc) => {
      const matchCat = cat === 'ALL' || doc.category === cat;
      if (!matchCat) return false;
      if (!qNorm) return true;
      const haystack = Utils.removeVietnameseTones(
        `${doc.code} ${doc.title} ${doc.issuer} ${doc.summary} ${doc.category}`
      );
      return haystack.includes(qNorm);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:24px;">
            Không tìm thấy văn bản khớp với từ khóa tra cứu.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map(
        (doc) => `
        <tr>
          <td data-label="Số hiệu"><span class="doc-code-badge">${Utils.escapeHTML(doc.code)}</span></td>
          <td data-label="Trích yếu văn bản">
            <strong style="display:block; margin-bottom:4px;">${Utils.escapeHTML(doc.title)}</strong>
            <span style="font-size:var(--text-xs); color:var(--color-text-muted);">${Utils.escapeHTML(doc.category)} • Cấp: ${Utils.escapeHTML(doc.level)}</span>
          </td>
          <td data-label="Cơ quan ban hành">${Utils.escapeHTML(doc.issuer)}</td>
          <td data-label="Ban hành / Hiệu lực">
            <span style="font-size:var(--text-xs);">BH: ${Utils.escapeHTML(doc.issueDate)}<br/>HL: ${Utils.escapeHTML(doc.effectiveDate)}</span>
          </td>
          <td data-label="Thao tác">
            <button type="button" class="btn-read-more" data-open-doc="${Utils.escapeHTML(doc.id)}">
              📄 Xem tóm tắt
            </button>
          </td>
        </tr>`
      )
      .join('');

    tbody.querySelectorAll('[data-open-doc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-open-doc');
        const doc = state.documents.find((d) => d.id === docId);
        if (!doc) return;

        Interactive.openModal({
          badge: `${doc.category} • ${doc.code}`,
          title: doc.title,
          date: `Ban hành: ${doc.issueDate} | Hiệu lực: ${doc.effectiveDate}`,
          bodyHtml: `
            <p><strong>Số hiệu văn bản:</strong> ${Utils.escapeHTML(doc.code)}</p>
            <p><strong>Cơ quan ban hành:</strong> ${Utils.escapeHTML(doc.issuer)}</p>
            <p><strong>Phạm vi / Cấp áp dụng:</strong> ${Utils.escapeHTML(doc.level)}</p>
            <div style="background:var(--color-bg); border-left:4px solid var(--color-primary); padding:14px; border-radius:4px;">
              <strong>Nội dung tóm tắt:</strong><br/>
              ${Utils.escapeHTML(doc.summary)}
            </div>
          `,
          speechText: `${doc.title}. Cơ quan ban hành: ${doc.issuer}. ${doc.summary}`,
          shareId: 'van-ban'
        });
      });
    });
  }

  function initDocumentFilters() {
    const tabBtns = document.querySelectorAll('[data-doc-cat]');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.docFilter.category = btn.getAttribute('data-doc-cat');
        tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
        renderDocuments();
      });
    });

    const docSearch = document.getElementById('doc-search-input');
    if (docSearch) {
      docSearch.addEventListener('input', (e) => {
        state.docFilter.query = e.target.value;
        renderDocuments();
      });
    }
  }

  /* ==========================================================================
     8. FORM Ý KIẾN PHỤ HUYNH & TIỆN ÍCH KẾT NỐI 1 CHẠM (.VCF / QR / COPY)
     ========================================================================== */
  function initParentFeedbackForm() {
    const form = document.getElementById('parent-feedback-form');
    const btnCopyZalo = document.getElementById('btn-copy-feedback-zalo');
    if (!form) return;

    function validateAndCollect() {
      const nameGroup = document.getElementById('fg-parent-name');
      const campusGroup = document.getElementById('fg-parent-campus');
      const msgGroup = document.getElementById('fg-parent-msg');

      const nameVal = (document.getElementById('input-parent-name')?.value || '').trim();
      const phoneVal = (document.getElementById('input-parent-phone')?.value || '').trim();
      const campusVal = (document.getElementById('input-parent-campus')?.value || '').trim();
      const msgVal = (document.getElementById('input-parent-msg')?.value || '').trim();

      let valid = true;

      if (nameVal.length < 2) {
        nameGroup?.classList.add('invalid');
        valid = false;
      } else {
        nameGroup?.classList.remove('invalid');
      }

      if (!campusVal) {
        campusGroup?.classList.add('invalid');
        valid = false;
      } else {
        campusGroup?.classList.remove('invalid');
      }

      if (msgVal.length < 10) {
        msgGroup?.classList.add('invalid');
        valid = false;
      } else {
        msgGroup?.classList.remove('invalid');
      }

      if (!valid) {
        Utils.showToast('⚠️ Vui lòng điền đầy đủ Họ tên phụ huynh, Điểm trường và Nội dung góp ý (tối thiểu 10 ký tự).');
        return null;
      }

      const formattedText =
        `[GÓP Ý PHỤ HUYNH - TRƯỜNG MN LÊ THẾ HIẾU]\n` +
        `- Họ tên Phụ huynh: ${nameVal}\n` +
        `- SĐT liên hệ: ${phoneVal || 'Không cung cấp'}\n` +
        `- Điểm trường / Nhóm lớp: ${campusVal}\n` +
        `- Nội dung: ${msgVal}`;

      return { nameVal, phoneVal, campusVal, msgVal, formattedText };
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = validateAndCollect();
      if (!data) return;

      const rawEmail = state.siteConfig?.email || '[EMAIL NHÀ TRƯỜNG]';
      const hasRealEmail = !rawEmail.includes('[') && rawEmail.includes('@');

      Utils.copyTextToClipboard(
        data.formattedText,
        '✅ Đã kiểm tra hợp lệ & sao chép nội dung góp ý để gửi nhà trường!'
      );

      if (hasRealEmail) {
        const subject = encodeURIComponent(`Góp ý Phụ huynh - ${data.nameVal} (${data.campusVal})`);
        const body = encodeURIComponent(data.formattedText);
        window.location.href = `mailto:${rawEmail}?subject=${subject}&body=${body}`;
      }
    });

    if (btnCopyZalo) {
      btnCopyZalo.addEventListener('click', () => {
        const data = validateAndCollect();
        if (!data) return;
        Utils.copyTextToClipboard(
          data.formattedText,
          '📋 Đã sao chép nội dung chuẩn! Phụ huynh có thể dán gửi ngay vào Zalo nhóm lớp / nhà trường.'
        );
      });
    }
  }

  function initOneTouchConnectAndHeader() {
    // Vẽ mã QR trang web
    Utils.renderCleanQRMatrix('school-qr-canvas', state.siteConfig?.websiteUrl || 'https://mnlethehieu.quangtri.edu.vn');

    const vcardBtn = document.getElementById('btn-download-vcard');
    if (vcardBtn) {
      vcardBtn.addEventListener('click', () => Utils.downloadSchoolVCard(state.siteConfig));
    }

    const copyUrlBtn = document.getElementById('btn-copy-site-url');
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener('click', () => {
        Utils.copyTextToClipboard(
          window.location.href,
          '📋 Đã sao chép địa chỉ trang web Trường Mầm non Lê Thế Hiếu!'
        );
      });
    }

    const hotlineBtn = document.getElementById('btn-top-hotline');
    if (hotlineBtn) {
      hotlineBtn.addEventListener('click', () => {
        const h = state.siteConfig?.childProtectionHotline || {};
        Interactive.openModal({
          badge: 'Bảo vệ Trẻ em Khẩn cấp 24/7',
          title: h.title || 'Đường dây nóng Bảo vệ Trẻ em xã Cam Lộ & Quốc gia',
          date: 'Thông báo UBND xã Cam Lộ ngày 16/11/2026',
          bodyHtml: `
            <div style="background:var(--color-danger-soft); border:1px solid var(--color-danger-border); padding:16px; border-radius:var(--radius-md);">
              <p style="font-size:var(--text-lg); font-weight:800; color:var(--color-danger); margin-bottom:6px;">
                📞 Tổng đài Quốc gia Bảo vệ Trẻ em: <a href="tel:111" style="color:var(--color-danger); text-decoration:underline;">111</a> (Miễn phí 24/7)
              </p>
              <p style="font-size:var(--text-sm);">
                Tiếp nhận thông tin, tư vấn tâm lý và bảo vệ khẩn cấp quyền trẻ em trên toàn quốc.
              </p>
            </div>
            <div style="background:var(--color-bg); border:1px solid var(--color-border); padding:16px; border-radius:var(--radius-md);">
              <p><strong>📍 Đường dây nóng UBND xã Cam Lộ:</strong> ${Utils.escapeHTML(h.localPhone || '[SỐ ĐƯỜNG DÂY NÓNG XÃ CAM LỘ]')}</p>
              <p><strong>🏫 Trụ sở Trường Mầm non Lê Thế Hiếu:</strong> ${Utils.escapeHTML(state.siteConfig?.address || 'Thôn Cam Chính, xã Cam Lộ, tỉnh Quảng Trị')}</p>
              <p style="font-size:var(--text-xs); color:var(--color-text-muted); margin-top:6px;">
                Lưu ý trung thực dữ liệu: Quản trị viên nhà trường cập nhật số điện thoại trực ban thực tế của xã và trường tại file <code>data/site-config.json</code>.
              </p>
            </div>
          `,
          speechText: 'Đường dây nóng Bảo vệ Trẻ em xã Cam Lộ và Tổng đài Quốc gia 1 1 1 trực miễn phí 24 trên 7.',
          shareId: 'ket-noi'
        });
      });
    }

    // Nút tìm kiếm nhanh trên Top Bar
    const topSearchBtn = document.getElementById('btn-top-search');
    if (topSearchBtn) {
      topSearchBtn.addEventListener('click', Interactive.focusQuickSearch);
    }

    // Nút Chế độ đọc tập trung
    const readingModeBtn = document.getElementById('btn-reading-mode');
    if (readingModeBtn) {
      readingModeBtn.addEventListener('click', () => {
        const active = document.body.classList.toggle('reading-mode');
        readingModeBtn.classList.toggle('active', active);
        readingModeBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
        Utils.showToast(active ? '📖 Đã bật Chế độ đọc tập trung dịu mắt' : '✨ Đã tắt Chế độ đọc tập trung');
      });
    }

    // Nút इन PDF ở tiêu đề Góc phụ huynh
    const topPrintBtn = document.getElementById('btn-print-menu-top');
    if (topPrintBtn) {
      topPrintBtn.addEventListener('click', Interactive.triggerPrintWeeklyMenu);
    }

    // Menu Mobile
    const mobileBtn = document.getElementById('btn-mobile-menu');
    const mainNav = document.getElementById('main-navigation');
    if (mobileBtn && mainNav) {
      mobileBtn.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileBtn.textContent = isOpen ? '✕' : '☰';
      });

      mainNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mainNav.classList.remove('open');
          mobileBtn.setAttribute('aria-expanded', 'false');
          mobileBtn.textContent = '☰';
        });
      });
    }
  }

  /* ==========================================================================
     9. KHỞI ĐỘNG TOÀN BỘ ỨNG DỤNG
     ========================================================================== */
  async function boot() {
    Utils.initFontScale();
    Interactive.initAlphabetCard();
    Interactive.initStoryCard();
    Interactive.initQuizCard();
    Interactive.initGalleryAndModalEvents();

    // Render ngay lập tức bằng dữ liệu Fallback để tốc độ phản hồi 0ms
    renderOrganizationAndCampuses();
    renderNewsBento();
    renderWeeklyMenuAndSchedule();
    renderResources();
    renderDocuments();

    initResourceFilters();
    initDocumentFilters();
    initParentFeedbackForm();
    initOneTouchConnectAndHeader();

    // Đồng bộ lại từ data/*.json nếu có chỉnh sửa mới từ giáo viên
    await loadAllData();
    renderOrganizationAndCampuses();
    renderNewsBento();
    renderWeeklyMenuAndSchedule();
    renderResources();
    renderDocuments();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
