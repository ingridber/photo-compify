import styles from "./report-form.module.css";
import { useRef, useState, useEffect } from "react";
import { uploadImage } from "../../services/imageApi";
import FileFormatValidation from "../../utils/FileFormatValidation";
import FileSizeValidation from "../../utils/FileSizeValidation";
import { createReport, checkNoPreviousReport } from "../../services/reportApi";
import { useUser } from "../../hooks/useUser";
import type { UserRef } from "../../types/competitions";
import { removeSpaces } from "../../utils/filenameSpaceRemove";

const DESC_MAX = 250;
const SITE_KEY = "6Lfr5dgsAAAAAAh2wY2jQK-Pb4QalmOyznzsEA7j";

interface ReportFormProps {
    submissionId: string;
    competitionId: string;
    reportedUserId: string | UserRef;
}

interface FormErrors {
    confirmEmail?: string;
    confirmation?: string;
}

interface apiErrors {
    message: string;
    reportId?: string;
}

declare global {
    interface Window {
        grecaptcha: {
            ready: (cb: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

export default function ReportForm({submissionId, competitionId, reportedUserId,}: ReportFormProps) {
    const {user} = useUser();
    const [name, setName] = useState(user?.username ?? "");
    const [email, setEmail] = useState<string>(user?.email ?? "");
    const [description, setDescription] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [showResult, setshowResult] = useState(false);
    const [apiResponse, setApiResponse] = useState('');
    const [reportId, setReportId] = useState('');
    const fileSizeRules = FileSizeValidation();
    const fileFormatRules = FileFormatValidation();

    useEffect(() => {
            if (!document.querySelector(`script[src*="recaptcha/api.js"]`)) {
                const script = document.createElement("script");
                script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
                script.async = true;
                document.body.appendChild(script);
                return () => {
                    const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
                    if (existingScript) document.body.removeChild(existingScript);
                };
            }
        }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
        }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);

        if (previewUrl) {URL.revokeObjectURL(previewUrl);}

        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        const formatError = fileFormatRules.validateFileFormat(file);
        if (formatError) {
            setFileError(formatError);
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        const sizeError = fileSizeRules.validateFileSize(file);
        if (sizeError) {
            setFileError(sizeError);
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearFile = () => {
        if (previewUrl) {URL.revokeObjectURL(previewUrl);}

        setSelectedFile(null);
        setPreviewUrl(null);
        setFileError(null);

        if (fileInputRef.current) {fileInputRef.current.value = "";}
    };

    const isValid = 
        email.trim().length > 0 &&
        description.trim().length > 0 &&
        confirmed;

    // ---------- HANDLE SUBMIT ----------
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setshowResult(false);
        const newErrors: FormErrors = {};

        if (!confirmed) {newErrors.confirmation = "You must confirm this report before submitting.";}
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const reportData = {
            submissionId,
            competitionId,
            reportedUserId,
            name: name.trim() || "Not provided",
            email,
            description,
        };
        let evidenceImageId: string | null = null;

        try {

            if (!window.grecaptcha) {
                throw new Error("reCAPTCHA script not loaded. Check your internet connection or AdBlocker.");
            }

            // Hämta token från Google
            const token = await new Promise<string>((resolve, reject) => {
                window.grecaptcha.ready(() => {
                    window.grecaptcha
                        .execute(SITE_KEY, { action: "create_account" })
                        .then(resolve)
                        .catch(reject);
                });
            });

            const checkOK = await checkNoPreviousReport({submissionId: reportData.submissionId, email: reportData.email, token})

            if (!checkOK.success) {
                throw {
                    message: checkOK.message,
                    reportId: checkOK.reportId,
                };
            }

            if (selectedFile) {
                const noSpaceFile = removeSpaces(selectedFile);
                const imgFormData = new FormData();
                imgFormData.append("image", noSpaceFile);
                const uploadRes = await uploadImage(imgFormData);
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    throw new Error( uploadData.message || "Image upload failed");
                }
                evidenceImageId = uploadData.data._id;
            }

            const res = await createReport({
                ...reportData,
                evidenceImg: evidenceImageId,
            })

            setApiResponse(res.message);
            setReportId(res.reportId);
            setshowResult(true);
            setName("");
            setEmail("");
            setDescription("");
            setConfirmed(false);
            clearFile();
            setErrors({});

            } catch (error: unknown) {
                const apiError = error as apiErrors;
                setApiResponse(apiError.message)

                if (apiError.reportId) {
                    setReportId(apiError.reportId);
                }

                setshowResult(true);
            }
        };

    return (
    <>
    { showResult ? (
        <div className={styles.responseContainer}>
            <p className={styles.response}> {apiResponse} </p>
            { reportId && (<p>Report ID: <span>{reportId}</span></p>)}
        </div>
    ) : (
        <form onSubmit={handleSubmit}>
            {/* NAME */}
            <div className={styles.field}>
                <label className={styles.label}> Name (optional)</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            {/* EMAIL */}
            <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                    className={styles.input}
                    required
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            {/* DESCRIPTION */}
            <div className={styles.field}>
                <label className={styles.label} htmlFor="report-description">Description of the issue</label>
                <textarea
                    id="report-description"
                    value={description}
                    maxLength={DESC_MAX}
                    rows={5}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain why the image is being reported"
                    className={styles.input}
                    required
                />
                <small className={styles.counter}>{description.length}/{DESC_MAX}</small>
            </div>
            {/* FILE */}
            <div className={styles.field}>
                <label className={styles.label}>Supporting image (optional)</label>
                <div
                    className={styles.imgContainer}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <img
                            className={styles.image}
                            src={previewUrl}
                            alt="Preview"
                        />
                    ) : (
                        <p>Click to upload image</p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() =>fileInputRef.current?.click()}
                >
                    {previewUrl
                        ? "Change Image"
                        : "Upload Image"}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                {fileError && (<p className={styles.error}>{fileError}</p>)}

                {previewUrl && (
                    <div className={styles.previewRow}>
                        <small className={styles.previewHint}>PNG, JPEG or WebP · max 1 MB</small>
                        <button type="button" onClick={clearFile}>Remove Image</button>
                    </div>
                )}
            </div>
            {/* CONFIRMATION */}
            <div className={styles.field}>
                <label className={styles.label}>Confirmation</label>
                {errors.confirmation && (<p className={styles.error}>{errors.confirmation}</p>)}
                <div>
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    <span>I confirm that the information provided is accurate and submitted in good faith</span>
                </div>
            </div>

            <button
                type="submit"
                className={styles.submitBtn}
                disabled={!isValid}
            >
                Submit Report
            </button>
            <p style={{textAlign: "center", fontSize: ".7rem", opacity: ".5", marginTop: ".5rem"}}>protected by reCAPTCHA</p>
        </form>
    )}
    </>
    );
}
