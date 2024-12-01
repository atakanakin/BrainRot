import React, { useState, useEffect } from "react";
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
  const [taskId, setTaskId] = useState(null);
  const [backendStatus, setBackendStatus] = useState("");
  const [textContent, setTextContent] = useState(null);
  const [textFileName, setTextFileName] = useState("");

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
        setTaskId(result.task_id);
        setUploadStatus(t("file_uploaded", { fileName: file.name }));
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadStatus(t("upload_failed"));
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (taskId) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5000/status/${taskId}`);
          const result = await response.json();

          if (result.status === "COMPLETED") {
            setBackendStatus(t("processing_complete"));
            setIsUploading(false);
            clearInterval(interval);

            if (result.files?.text_file) {
              setTextFileName(result.files.text_file);
              const textResponse = await fetch(`http://localhost:5000/file/${result.files.text_file}`);
              if (textResponse.ok) {
                const text = await textResponse.text();
                setTextContent(text);
              } else {
                console.error("Failed to fetch the text file");
              }
            }
          } else if (result.status === "FAILED") {
            setBackendStatus(t("status_error"));
            clearInterval(interval);
          } else {
            setBackendStatus(t(result.status.toLowerCase()));
          }
        } catch (error) {
          console.error("Error fetching status:", error);
          setBackendStatus(t("status_error"));
          clearInterval(interval);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => clearInterval(interval);
  }, [taskId, t]);

  return (
    <div className="upload-container">
      {!isUploading && !backendStatus && !textContent && (
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
      )}

      {isUploading && (
        <div className="upload-status">
          <Lottie animationData={uploadingAnimation} style={{ height: 200, width: 200 }} />
          <p>{backendStatus || uploadStatus}</p>
        </div>
      )}

      {textContent && (
        <div className="text-content-container">
          <h3 className="text-content-title">{textFileName}</h3>
          <div className="text-content">
            <pre>{textContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;
