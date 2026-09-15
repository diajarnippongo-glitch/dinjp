import type { LearningModule, ReviewPondasiModule, QuizPartConfig } from '@/types';

export const APP_NAME = 'Portal Belajar DiN Japanese';
export const SENSEI_EMAIL = 'sensei@din.com';
export const SENSEI_WHATSAPP = '6281312380029';
export const DRIVE_LINK = 'https://drive.google.com/drive/folders/d/example-folder-id';

export const modules: LearningModule[] = [
  {
    id: 'moji', title: 'Moji', titleJp: '文字', description: 'Karakter kanji dan tulisan', icon: 'PenTool',
    totalQuestions: 14, passingScore: 85,
    mondai: [
      { id: 'm1', label: '問題1', range: [1, 8] },
      { id: 'm2', label: '問題2', range: [9, 14] },
    ],
  },
  {
    id: 'goi', title: 'Goi', titleJp: '語彙', description: 'Kosakata dan penggunaan kata', icon: 'BookOpen',
    totalQuestions: 21, passingScore: 85,
    mondai: [
      { id: 'm1', label: '問題1', range: [1, 11] },
      { id: 'm2', label: '問題2', range: [12, 16] },
      { id: 'm3', label: '問題3', range: [17, 21] },
    ],
  },
  {
    id: 'bunpou', title: 'Bunpou', titleJp: '文法', description: 'Pola tata bahasa dan struktur kalimat', icon: 'ScrollText',
    totalQuestions: 23, passingScore: 85,
    mondai: [
      { id: 'm1', label: '問題1', range: [1, 13] },
      { id: 'm2', label: '問題2', range: [14, 18] },
      { id: 'm3', label: '問題3', range: [19, 23], scroll: true },
    ],
  },
  {
    id: 'dokkai', title: 'Dokkai', titleJp: '読解', description: 'Pemahaman bacaan', icon: 'FileText',
    totalQuestions: 16, passingScore: 85,
    mondai: [
      { id: 'm1', label: '問題1', range: [1, 4] },
      { id: 'm2', label: '問題2', range: [5, 7], scroll: true },
      { id: 'm3', label: '問題3', range: [8, 10], scroll: true },
      { id: 'm4', label: '問題4', range: [11, 14], scroll: true },
      { id: 'm5', label: '問題5', range: [15, 16], scroll: true },
    ],
  },
  {
    id: 'choukai', title: 'Choukai', titleJp: '聴解', description: 'Latihan mendengarkan dengan audio', icon: 'Headphones',
    totalQuestions: 28, passingScore: 85,
    mondai: [
      { id: 'm1', label: '問題1', range: [1, 6] },
      { id: 'm2', label: '問題2', range: [7, 12] },
      { id: 'm3', label: '問題3', range: [13, 15] },
      { id: 'm4', label: '問題4', range: [16, 19] },
      { id: 'm5', label: '問題5', range: [20, 28] },
    ],
  },
];

export const reviewPondasiModules: ReviewPondasiModule[] = [
  {
    id: 'partikel', title: 'Partikel', titleJp: '助詞', description: 'Penggunaan partikel bahasa Jepang', icon: 'Sparkles',
    parts: [
      { id: 'partikel-1', label: 'Bagian 1', questionCount: 10 },
      { id: 'partikel-2', label: 'Bagian 2', questionCount: 10 },
      { id: 'partikel-3', label: 'Bagian 3', questionCount: 10 },
      { id: 'partikel-4', label: 'Bagian 4', questionCount: 10 },
      { id: 'partikel-5', label: 'Bagian 5', questionCount: 10 },
      { id: 'partikel-6', label: 'Bagian 6', questionCount: 10 },
      { id: 'partikel-7', label: 'Bagian 7', questionCount: 10 },
      { id: 'partikel-8', label: 'Bagian 8', questionCount: 10 },
      { id: 'partikel-9', label: 'Bagian Akhir (Review)', questionCount: 100 },
    ],
  },
  {
    id: 'kata-kerja', title: 'Perubahan', titleJp: '動詞変化', description: 'Konjugasi dan perubahan bentuk kata kerja', icon: 'Repeat',
    parts: [
      { id: 'kata-kerja-1', label: 'Bagian 1', questionCount: 10 },
      { id: 'kata-kerja-2', label: 'Bagian 2', questionCount: 10 },
      { id: 'kata-kerja-3', label: 'Bagian 3', questionCount: 10 },
      { id: 'kata-kerja-4', label: 'Bagian 4', questionCount: 10 },
      { id: 'kata-kerja-5', label: 'Bagian 5', questionCount: 10 },
      { id: 'kata-kerja-6', label: 'Bagian 6', questionCount: 10 },
      { id: 'kata-kerja-7', label: 'Bagian 7', questionCount: 10 },
      { id: 'kata-kerja-8', label: 'Bagian 8', questionCount: 10 },
      { id: 'kata-kerja-9', label: 'Bagian Akhir (Review)', questionCount: 100 },
    ],
  },
  {
    id: 'kosakata', title: 'Pengelompokkan', titleJp: '単語整理', description: 'Klasifikasi kosakata berdasarkan tema', icon: 'Layers',
    parts: [
      { id: 'kosakata-1', label: 'Bagian 1', questionCount: 10 },
      { id: 'kosakata-2', label: 'Bagian 2', questionCount: 10 },
      { id: 'kosakata-3', label: 'Bagian 3', questionCount: 10 },
      { id: 'kosakata-4', label: 'Bagian 4', questionCount: 10 },
      { id: 'kosakata-5', label: 'Bagian 5', questionCount: 10 },
      { id: 'kosakata-6', label: 'Bagian 6', questionCount: 10 },
      { id: 'kosakata-7', label: 'Bagian 7', questionCount: 10 },
      { id: 'kosakata-8', label: 'Bagian 8', questionCount: 10 },
      { id: 'kosakata-9', label: 'Bagian Akhir (Review)', questionCount: 100 },
    ],
  },
  {
    id: 'bunpou-review', title: 'Tata Bahasa', titleJp: '文法', description: 'Tinjauan pola tata bahasa', icon: 'ScrollText',
    parts: [
      { id: 'bunpou-review-1', label: 'Bagian 1', questionCount: 10 },
      { id: 'bunpou-review-2', label: 'Bagian 2', questionCount: 10 },
      { id: 'bunpou-review-3', label: 'Bagian 3', questionCount: 10 },
      { id: 'bunpou-review-4', label: 'Bagian 4', questionCount: 10 },
      { id: 'bunpou-review-5', label: 'Bagian 5', questionCount: 10 },
      { id: 'bunpou-review-6', label: 'Bagian 6', questionCount: 10 },
      { id: 'bunpou-review-7', label: 'Bagian 7', questionCount: 10 },
      { id: 'bunpou-review-8', label: 'Bagian 8', questionCount: 10 },
      { id: 'bunpou-review-9', label: 'Bagian Akhir (Review)', questionCount: 100 },
    ],
  },
  {
    id: 'kaiwa', title: 'Percakapan', titleJp: '会話表現', description: 'Ekspresi percakapan sehari-hari', icon: 'MessageSquare',
    parts: [
      { id: 'kaiwa-1', label: 'Bagian 1', questionCount: 10 },
      { id: 'kaiwa-2', label: 'Bagian 2', questionCount: 10 },
      { id: 'kaiwa-3', label: 'Bagian 3', questionCount: 10 },
      { id: 'kaiwa-4', label: 'Bagian 4', questionCount: 10 },
      { id: 'kaiwa-5', label: 'Bagian 5', questionCount: 10 },
      { id: 'kaiwa-6', label: 'Bagian 6', questionCount: 10 },
      { id: 'kaiwa-7', label: 'Bagian 7', questionCount: 10 },
      { id: 'kaiwa-8', label: 'Bagian 8', questionCount: 10 },
      { id: 'kaiwa-9', label: 'Bagian Akhir (Review)', questionCount: 100 },
    ],
  },
];

export const SCHEDULE_CATEGORIES_N4 = ['N4 土・日'];
export const SCHEDULE_CATEGORIES_N3 = ['N3 月・水', 'N3 火・木', 'N3 金・土 / 日'];
export const SCHEDULE_CATEGORIES_ALL = [...SCHEDULE_CATEGORIES_N4, ...SCHEDULE_CATEGORIES_N3];

export function getScheduleCategories(classLevel: 'N3' | 'N4'): string[] {
  return classLevel === 'N4' ? SCHEDULE_CATEGORIES_N4 : SCHEDULE_CATEGORIES_N3;
}

export function getMondaiIdsForQuizPart(week: number, part: number, mondaiPerPart = 2): string[] {
  const startMondai = (week - 1) * 2 + (part - 1) * mondaiPerPart;
  return Array.from({ length: mondaiPerPart }, (_, i) => `m${startMondai + i + 1}`);
}

export const quizParts: QuizPartConfig[] = (() => {
  const parts: QuizPartConfig[] = [];
  for (let week = 1; week <= 12; week++) {
    for (let part = 1; part <= 2; part++) {
      parts.push({ id: `w${week}p${part}`, label: `Minggu ${week} Bagian ${part}`, week, part });
    }
  }
  return parts;
})();

export const dailyMotivations: { greeting: string; quote: string }[] = [
  { greeting: 'Selamat pagi, semangat!', quote: '"Belajar bahasa Jepang itu kayak nge-grind di game — awalnya susah, tapi setelah naik level, auto berasa OP. Gaskeun!"' },
  { greeting: 'Selamat pagi, jangan nanggung!', quote: '"Hari ini kamu lebih kuat dari kemarin. Tapi tetap rendah hati, no cap. いってきます！"' },
  { greeting: 'Selamat pagi, pejuang!', quote: '"Yang susah itu sementara, tapi skill bahasa Jepangmu itu permanen. Keep pushing, bestie!"' },
  { greeting: 'Selamat pagi, semangat ya!', quote: '"Jangan bandingkan progresmu dengan orang lain. Kamu punya timeline sendiri. Slowly but surely, がんばろう！"' },
  { greeting: 'Selamat pagi, jangan menyerah!', quote: '"Merasa stuck? Itu artinya kamu lagi naik level. Emang nggak gampang, tapi worth it. Trust the process!"' },
  { greeting: 'Selamat pagi, weekend warrior!', quote: '"Belajar sambil ngopi, hidup jadi lebih bermakna. Kanji demi kanji, kamu pasti bisa. いける！"' },
  { greeting: 'Selamat pagi, Sunday mood!', quote: '"Istirahat itu penting, tapi jangan lupa review kosakata ya. Sedikit demi sedikit, lama-lama jadi gunung. ふぁいと！"' },
];

export function getDailyMotivation(): { greeting: string; quote: string } {
  const day = new Date().getDay();
  return dailyMotivations[day] ?? dailyMotivations[0];
}

export function buildWhatsAppReminder(name: string, period: string, amount: number): string {
  return `Halo ${name}, selamat pagi/siang.\n\nKami dari Portal Belajar DiN Japanese ingin mengingatkan dengan hormat bahwa pembayaran biaya les untuk periode *${period}* sebesar *Rp${amount.toLocaleString('id-ID')}* belum kami terima.\n\nMohon kesediaannya untuk segera melakukan pembayaran. Jika sudah membayar, mohon abaikan pesan ini.\n\nTerima kasih atas perhatian dan kerja sama Anda.\n\nSalam hangat,\nTim Portal Belajar DiN Japanese`;
}

export function mogiShikenGrade(score: number, classLevel?: 'N3' | 'N4'): { label: string; color: string } {
  if (classLevel === 'N4') {
    if (score < 90) return { label: 'Tidak Lulus', color: 'red' };
    return { label: 'Lulus A2', color: 'green' };
  }
  if (score < 95) return { label: 'Tidak Lulus', color: 'red' };
  if (score <= 103) return { label: 'Lulus A2', color: 'amber' };
  return { label: 'Lulus B1', color: 'green' };
}
