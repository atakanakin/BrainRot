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
        status_error: "Error fetching status. Please try again.",
        note_text: "Note:",
        processing_limit: "For now, a maximum of 2 minutes of text can be processed. You can sponsor <a>here</a> and help us contribute to this project so that we can increase our processing limits."
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
        status_error: "Durum alınırken hata oluştu. Lütfen tekrar deneyin.",
        note_text: "Not:",
        processing_limit: "Şimdilik maksimum 2 dakikalık metin işlenebiliyor. Bize <a>buradan</a> sponsor olabilir ve bu projeye katkıda bulunarak işleme sınırlarımızı artırmamıza yardımcı olabilirsiniz."
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