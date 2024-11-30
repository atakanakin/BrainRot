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
        uploaded_file: "Uploaded File",
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
        uploaded_file: "Yüklenen Dosya",
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