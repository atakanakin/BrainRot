import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFileUpload } from "react-icons/fa";
import Lottie from "lottie-react";
import uploadingAnimation from "../assets/loading_lottie.json";
import "../styles/UploadSection.css";

const acceptedFormats = [".pdf", ".docx", ".pptx", ".txt"];
const MAX_FILE_SIZE_MB = 20;

const UploadSection = () => {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileSizeMB = file.size / (1024 * 1024);

      if (!acceptedFormats.some((ext) => fileExtension === ext.slice(1))) {
        alert(t("invalid_file"));
        return;
      }

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        alert(t("file_too_large", { maxSize: MAX_FILE_SIZE_MB }));
        return;
      }

      setUploadedFile(file);
      setIsUploading(true);
      setUploadStatus(t("uploading_file"));

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();
        setIsUploading(false);
        setUploadStatus(t("file_uploaded", { fileName: file.name }));
        console.log("Upload result:", result);
      } catch (error) {
        console.error("Error uploading file:", error);
        setIsUploading(false);
        setUploadStatus(t("upload_failed"));
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

      {isUploading && (
        <div className="upload-status">
          <Lottie animationData={uploadingAnimation} style={{ height: 150, width: 150 }} />
          <p>{t("uploading_file")}</p>
        </div>
      )}

      {uploadStatus && !isUploading && (
        <p className="upload-status-message">{uploadStatus}</p>
      )}
    </div>
  );
};

export default UploadSection;
