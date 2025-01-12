import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaFileUpload } from "react-icons/fa";
import Lottie from "lottie-react";
import uploadingAnimation from "../assets/loading_lottie.json";
import "../styles/UploadSection.css";
import { buyMeaCoffee } from "../constants/SocialMedia";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constants/Url";

const acceptedFormats = [".pdf", ".docx", ".pptx", ".txt"];
const MAX_FILE_SIZE_MB = 20;

const UploadSection = ({ onWorkflowComplete }) => {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [backendStatus, setBackendStatus] = useState("");
  const [textContent, setTextContent] = useState(null);
  const [textFileName, setTextFileName] = useState("");
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileNameHelper = (filename) => {
    const UUID_LENGTH = 36;
    const name = filename.slice(UUID_LENGTH + 1);
    const nameWithExtension = name;

    return nameWithExtension;
};

  const handleFileInputChange = (e) => {
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

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleCreate = async () => {
    if (!selectedFile) return;
    
    setUploadedFile(selectedFile);
    setIsUploading(true);
    setUploadStatus(t("uploading_file"));

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
        mode: "cors",
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setTaskId(result.task_id);
      setUploadStatus(t("file_uploaded", { fileName: selectedFile.name }));
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus(t("upload_failed"));
      setIsUploading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (taskId) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/status/${taskId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
          });
          const result = await response.json();
          console.log(result);

          if (result.status === "COMPLETED") {
            setBackendStatus(t("processing_complete"));
            setIsUploading(false);
            clearInterval(interval);
            // Pass filenames to CreatePage
            if (result.files) {
              onWorkflowComplete(result.files.audio_file, result.files.subtitle_file);
            }
            console.log(result.files);
            if (result.files.text_file) {
              setTextFileName(result.files.text_file);
              const textResponse = await fetch(`${API_URL}/file/${result.files.text_file}`, {
                method: "GET",
                headers: {
                  "Content-Type": "text/plain",
                },
                credentials: 'include',
              });
              if (textResponse.ok) {
                const text = await textResponse.text();
                setTextContent(text);
              } else {
                console.error("Failed to fetch the text file");
              }
            }
          } else if (result.status === "FAILED") {
              setError(result.error);
              setBackendStatus(t("status_error"));
              setIsUploading(false); // Stop showing loading
              clearInterval(interval); // Stop polling
          } else if (result.status === "PENDING") {
              setBackendStatus(t("pending_status"));
          } else if (result.status === "UNKNOWN") {
              setError("Unknown status");
              setBackendStatus(t("unknown_status"));
              setIsUploading(false);
              clearInterval(interval);
          } else {
              setBackendStatus(t(result.status.toLowerCase()));
          }
        } catch (error) {
            console.error("Error fetching status:", error);
            setError("Error fetching status");
            setBackendStatus(t("status_error"));
            setUploadStatus(t("upload_failed"));
            setIsUploading(false);
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
          <div className="upload-actions">
            <button
              className="upload-btn"
              onClick={() => document.getElementById("fileInput").click()}
            >
              {t("choose_file")}
            </button>
            {selectedFile && (
              <p className="selected-filename">
                {t('selected_filename', { filename: selectedFile.name })}
              </p>
            )}
            <button
              className={`create-btn ${!selectedFile ? 'disabled' : ''}`}
              onClick={handleCreate}
              disabled={!selectedFile}
            >
              {t("create")}
            </button>
          </div>
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

      {error && (
            <div className="error-container">
              <h3 className="error-title">{t("error_occurred", "An error occurred")}</h3>
              <p className="error-message">{error}</p>
              <button
                className="retry-button"
                onClick={() => {
                  window.location.reload();
                }}
              >
                {t("retry", "Retry")}
              </button>
            </div>
          )}

      {textContent && (
        <div className="text-content-container">

          {/* Text Content */}
          <h3 className="text-content-title">{fileNameHelper(textFileName)}</h3>
          <div className="text-content">
            <pre>{textContent}</pre>
          </div>
        </div>
      )}

      {textContent && (
      <button
        className="create-new-button"
        onClick={() => window.location.reload()}
      >
        {t("create_new")}
      </button>
      )}
    </div>
  );
};

export default UploadSection;
