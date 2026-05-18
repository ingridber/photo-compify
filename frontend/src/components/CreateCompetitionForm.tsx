import { useState, useRef, type SubmitEvent } from 'react';
import styles from './createCompetitionForm.module.css';
import mixins from "../styles/mixins.module.css";
import { uploadImage } from "../services/imageApi";
import FileSizeValidation from "./images/FileSizeValidation";
import FileFormatValidation from "./images/FileFormatValidation";

const AVAILABLE_THEMES: string[] = [
    'Portrait',
    'Landscape',
    'Street',
    'Wildlife',
    'Macro',
    'Architecture',
    'Nature',
    'Travel',
    'Minimalist',
    'Black & White',
    'Long Exposure',
    'Abstract',
    'Aerial',
    'Night',
    'Astrophotography',
    'Documentary',
];

const TITLE_MAX = 50;
const DESC_MAX = 250;

type ApiError = { code: string; message: string };

type Props = {
    onSuccess?: () => void;
};

export default function CreateCompetitionForm({ onSuccess }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [themes, setThemes] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fileSizeRules = FileSizeValidation();
    const fileFormatRules = FileFormatValidation();

    const toggleTheme = (theme: string) => {
        setThemes((prev) =>
            prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);

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
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isValid =
        title.trim().length > 0 &&
        title.length <= TITLE_MAX &&
        description.trim().length > 0 &&
        description.length <= DESC_MAX &&
        themes.length > 0;

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValid || submitting) return;

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            let logoImageId: string | null = null;

            if (selectedFile) {
                const imgFormData = new FormData();
                imgFormData.append('image', selectedFile);

                const uploadRes = await uploadImage(imgFormData);
                const uploadData = await uploadRes.json();

                if (!uploadRes.ok) {
                    setError({
                        code: 'UPLOAD_FAILED',
                        message: uploadData.message || 'Image upload failed',
                    });
                    return;
                }

                logoImageId = uploadData.data._id;
            }

            const res = await fetch('http://localhost:3000/api/v1/competitions', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    themes,
                    ...(logoImageId && { logoBanner: logoImageId }),
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                if (data && typeof data.code === 'string' && typeof data.message === 'string') {
                    setError({ code: data.code, message: data.message });
                } else {
                    setError({ code: 'UNKNOWN', message: `Request failed (${res.status})` });
                }
                return;
            }

            setSuccess(true);
            setTitle('');
            setDescription('');
            setThemes([]);
            clearFile();
            onSuccess?.();
        } catch {
            setError({ code: 'NETWORK', message: 'Network error. Try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label>
                <span>Title</span>
                <div className={mixins.inputFieldContainer}>
                    <input
                        type="text"
                        value={title}
                        maxLength={TITLE_MAX}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className={mixins.inputField}
                        placeholder='Title'
                    />
                </div>
                <small className={styles.counter}>
                    {title.length}/{TITLE_MAX}
                </small>
            </label>

            <label>
                <span>Description</span>
                <div className={mixins.inputFieldContainer}>
                    <textarea
                        value={description}
                        maxLength={DESC_MAX}
                        rows={4}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className={mixins.inputField}
                        placeholder='Description'
                    />
                </div>
                <small className={styles.counter}>
                    {description.length}/{DESC_MAX}
                </small>
            </label>

            <fieldset className={styles.fieldset}>
                <div className={styles.themesTitleContainer}>
                    <legend className={styles.themesTitle}>Themes</legend>
                    <small className={themes.length === 0 ? `${styles.counterTheme}` : `${styles.counterTheme} ${styles.counterThemeHide}`}>Pick at least one</small>
                </div>
                <div className={styles.themesGrid}>
                    {AVAILABLE_THEMES.map((theme) => (
                        <label key={theme} className={styles.themeOption}>
                            <input
                                type="checkbox"
                                checked={themes.includes(theme)}
                                onChange={() => toggleTheme(theme)}
                            />
                            <span>{theme}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <label>
                <div className={styles.logoTitleContainer}>
                    <span className={styles.logoTitle}>Logo / Banner (optional)</span>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                />
                <small className={styles.counter}>PNG, JPEG, or WebP. Max 1MB.</small>
                {fileError && (
                    <div className={styles.error} role="alert">
                        {fileError}
                    </div>
                )}
                {previewUrl && (
                    <div className={styles.preview}>
                        <img src={previewUrl} alt="Preview" />
                        <button type="button" onClick={clearFile} className={styles.clearBtn}>
                            ✕
                        </button>
                    </div>
                )}
            </label>

            {error && (
                <div className={styles.error} role="alert">
                    <strong>{error.code}:</strong> {error.message}
                </div>
            )}

            {success && (
                <div className={styles.success} role="status">
                    Competition created.
                </div>
            )}

            <button type="submit" className={`${mixins.submitBtn} ${styles.submit}`} disabled={!isValid || submitting}>
                {submitting ? 'Creating...' : 'Create'}
            </button>
        </form>
    );
}
