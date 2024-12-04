// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        app_name: "BrainRot",
        sponsor: "Sponsor",
        create: "Create",
        accepted_formats: "Accepted formats are: {{formats}}",
        choose_file: "Choose a file",
        file_uploaded: "File '{{fileName}}' uploaded successfully.",
        invalid_file: "Invalid file type. Please upload a supported file.",
        uploading_file: "Uploading file...",
        upload_failed: "Failed to upload file. Please try again.",
        file_too_large: "The file exceeds the maximum allowed size of {{maxSize}} MB.",
        processing_file: "File '{{fileName}}' is being processed. Please wait...",
        extracting_text: "Extracting text...",
        generating_audio: "Generating audio...",
        pending_status: "Pending due to server load. Please wait...",
        unknown_status: "An unknown error occurred. Please try again.",
        status_error: "Error fetching status. Please try again.",
        note_text: "Note:",
        create_new: "Create New",
        processing_limit: "For now, a maximum of 2 minutes of text can be processed. You can sponsor <a>here</a> and help us contribute to this project so that we can increase our processing limits.",
        section_0_title: "A Fun Solution to Your Study Struggles",
        section_0_body: "Have you ever wanted to scroll through TikTok for hours, but those exams just won’t let you breathe? We get it, studying can feel like a chore when all you want is a break. That’s where BrainRot comes in. With BrainRot, you don’t have to choose between grinding for your grades and enjoying your favorite pastime. We’ve cracked the code to turn studying into something you actually look forward to. Your course materials meet a whole new level of creativity—now, it’s not just work; it’s fun!",
        section_0_video: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_1.mp4",
        section_1_title: "Study Smarter, Not Boring-er",
        section_1_body: "I know it sounds too good to be true, but trust me: with BrainRot, studying can finally be fun. Here’s how it works: BrainRot’s powerful AI takes your course material, turns it into a voiceover, and matches it with gameplay from viral, endlessly watchable videos—just like the ones that keep you glued to your feed. Imagine prepping for your finals while being entertained by your favorite game highlights. No more zoning out; no more dragging your feet. BrainRot keeps you engaged, entertained, and ready to crush those exams like a boss.",
        section_1_video: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_2.mp4",
        section_2_title: "Your Personalized Study Adventure",
        section_2_body: "And here’s the best part: when this video ends, you’ll be redirected to the Create Page; your personal BrainRot command center. Upload your course material—PDFs, Word docs, PowerPoint slides, or even simple text files—and watch BrainRot work its magic. In just seconds, you’ll have a custom study video ready to go. It’s fast, it’s fun, and it’s made just for you. So what are you waiting for? Let’s make studying something you can’t wait to do. Click through and give BrainRot a try—you won’t regret it!",
        section_2_video: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_3.mp4",
      }
    },
    tr: {
      translation: {
        app_name: "BrainRot",
        sponsor: "Sponsor",
        create: "Oluştur",
        accepted_formats: "Kabul edilen formatlar: {{formats}}",
        choose_file: "Bir dosya seçin",
        file_uploaded: "Dosya '{{fileName}}' başarıyla yüklendi.",
        invalid_file: "Geçersiz dosya türü. Lütfen desteklenen bir dosya yükleyin.",
        uploading_file: "Dosya yükleniyor...",
        upload_failed: "Dosya yüklenemedi. Lütfen tekrar deneyin.",
        file_too_large: "Dosya, izin verilen maksimum {{maxSize}} MB boyutunu aşıyor.",
        processing_file: "Dosya '{{fileName}}' işleniyor. Lütfen bekleyin...",
        extracting_text: "Metin çıkarılıyor...",
        generating_audio: "Ses oluşturuluyor...",
        pending_status: "Server yoğunluğu nedeniyle işlem sırasında bekliyor. Lütfen bekleyin...",
        unknown_status: "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        status_error: "Durum alınırken hata oluştu. Lütfen tekrar deneyin.",
        note_text: "Not:",
        create_new: "Yeni Dosya",
        processing_limit: "Şimdilik maksimum 2 dakikalık metin işlenebiliyor. Bize <a>buradan</a> sponsor olabilir ve bu projeye katkıda bulunarak işleme sınırlarımızı artırmamıza yardımcı olabilirsiniz.",
        section_0_title: "Ders Çalışma Derdi Sona Eriyor",
        section_0_body: "Hiç saatlerce TikTok'ta takılmak isterken sınavların seni boğduğunu hissettin mi? Seni anlıyoruz, ders çalışmak bazen dünyanın en sıkıcı işi gibi gelebilir. Ama merak etme, çünkü BrainRot burada! Artık ders çalışmakla keyif almak arasında seçim yapmak zorunda değilsin. BrainRot sayesinde dersler, sıkıcı bir görev olmaktan çıkıp gerçekten eğlenerek vakit geçireceğin bir aktiviteye dönüşüyor. Hem öğrenip hem de keyif almanın tadını çıkar—ders çalışmak artık iş değil, tam anlamıyla eğlence!",
        section_0_video: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_1_tr.mp4",
        section_1_title: "Daha Akıllı Çalış, Daha Sıkıcı Değil",
        section_1_body: "Biliyorum, kulağa gerçek olamayacak kadar iyi geliyor ama inan, BrainRot sayesinde ders çalışmak gerçekten eğlenceli hale geliyor. Peki nasıl mı? BrainRot’un yapay zekâsı ders notlarını alıyor, bunları seslendirmeye çeviriyor ve popüler, bağımlılık yapan videoların oyun görüntüleriyle birleştiriyor—hani sürekli izlemekten kendini alamadığın türden videolar gibi. Düşünsene, sınavlara hazırlanırken aynı anda keyifli oyun sahneleri izliyorsun. Artık sıkılıp dalıp gitmek ya da sürekli ertelemek yok. BrainRot seni hem motive ediyor, hem eğlendiriyor, hem de sınavlarını başarıyla geçmeye hazır hale getiriyor!",
        section_1_video: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_2_tr.mp4",
        section_2_title: "Kişisel Ders Çalışma Maceran",
        section_2_body: "Ve işte en güzel kısmı: Video bittiğinde, seni BrainRot’un 'Oluştur' sayfasına yönlendireceğiz. Ders materyallerini yükle—PDF, Word, PowerPoint ya da basit bir metin dosyası fark etmez—ve BrainRot’un büyüsünü gerçekleştirmesini izle. Sadece birkaç saniye içinde sana özel hazırlanmış bir çalışma videosu hazır olacak. Hızlı, eğlenceli ve tamamen sana özel! Peki, neyi bekliyorsun? Ders çalışmayı dört gözle bekleyeceğin bir şeye dönüştürelim. Hemen tıkla ve BrainRot’u dene, pişman olmayacaksın!",
        section_2_video: "https://gitlab.com/atakanakin/shortvideos/-/raw/main/onboarding_3_tr.mp4",
      }
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;