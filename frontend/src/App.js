import React, { useState } from "react";
import axios from "axios";
import { Button, TextField, LinearProgress } from "@mui/material";

function App() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("");
    const [progress, setProgress] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setProgress(true);
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setStatus(`Upload successful! Task ID: ${response.data.task_id}`);
        } catch (error) {
            setStatus("Upload failed. Please try again.");
        } finally {
            setProgress(false);
        }
    };

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Brain Rot </h1>
            <TextField type="file" onChange={handleFileChange} />
            <br />
            <Button variant="contained" color="primary" onClick={handleUpload} style={{ margin: "1rem" }}>
                Upload
            </Button>
            {progress && <LinearProgress />}
            <p>{status}</p>
        </div>
    );
}

export default App;
