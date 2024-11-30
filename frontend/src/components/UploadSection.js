import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/CreatePage.css";
import { FaFileUpload } from "react-icons/fa";

const acceptedFormats = [".pdf", ".docx", ".pptx", ".txt"];

const UploadSection = () => {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (acceptedFormats.some((ext) => fileExtension === ext.slice(1))) {
        setUploadedFile(file);
        alert(t("file_uploaded", { fileName: file.name })); // TODO: Upload logic
      } else {
        alert(t("invalid_file"));
      }
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <FaFileUpload size={40} />
        <p>
          {t("accepted_formats", { formats: acceptedFormats.join(", ") })}
        </p>
        <button
          className="upload-btn"
          onClick={() => document.getElementById("fileInput").click()}
        >
          {t("choose_file")}
        </button>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleFileInputChange}
          accept={acceptedFormats.join(",")}
        />
      </div>
      {uploadedFile && (
        <p className="uploaded-file-info">
          {t("uploaded_file")}: {uploadedFile.name}
        </p>
      )}
    </div>
  );
};

export default UploadSection;
