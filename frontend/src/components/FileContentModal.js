import React, { useEffect, useState } from "react";
import "../styles/FileContentModal.css";
import { API_URL } from "../constants/Url";

const FileContentModal = ({ filename, show, onClose }) => {
    const [fileContent, setFileContent] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && filename) {
            const fetchFileContent = async () => {
                setLoading(true);
                setFileContent(null);

                try {
                    const response = await fetch(`${API_URL}/file/${filename}.txt`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "text/plain",
                            },
                            credentials: 'include',
                        }

                    );
                    if (!response.ok) {
                        throw new Error("Failed to fetch file content");
                    }
                    const content = await response.text();
                    setFileContent(content);
                } catch (error) {
                    setFileContent(`Error: ${error.message}`);
                } finally {
                    setLoading(false);
                }
            };

            fetchFileContent();
        }
    }, [show, filename]);

    const fileNameHelper = (filename) => {
        const UUID_LENGTH = 36;
        const name = filename.slice(UUID_LENGTH + 1);
        const nameWithExtension = name + ".txt";

        return nameWithExtension;
    };

    if (!show) {
        return null;
    }

    return (
        <div className="file-modal-overlay" onClick={onClose}>
            <div className="file-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="file-modal-header">
                    <h2>{fileNameHelper(filename)}</h2>
                    <button className="file-modal-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="file-modal-body">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <pre>{fileContent}</pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileContentModal;
