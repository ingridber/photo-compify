import { useState, useRef } from 'react';
import styles from './createCompetitionForm.module.css';
import formStyles from '../styles/form.module.css';
import { uploadImage } from "../services/imageApi";
import FileSizeValidation from "../utils/FileSizeValidation";
import FileFormatValidation from "../utils/FileFormatValidation";
import { useNavigate } from 'react-router';
import AVAILABLE_THEMES from '../constants/availableThemes';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import type { ThemeOption } from '../types/competitions';
import { apiCall } from '../utils/apiCall';

const TITLE_MAX = 50;
const DESC_MAX = 250;

type ApiError = { code: string; message: string };

type Props = {
    onSuccess?: () => void;
};

const AVAILABLE_THEMES_OBJ = AVAILABLE_THEMES.map((theme) => ({
    value: theme,
    label: theme,
}));

export default function CreateCompetitionForm({ onSuccess }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [themes, setThemes] = useState<ThemeOption[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const fileSizeRules = FileSizeValidation();
    const fileFormatRules = FileFormatValidation();

    const handleSelectThemes = (selected: MultiValue<ThemeOption>) => {
        if (selected.length <= 5) {
            setThemes([...selected]);
        }
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

            const res = await apiCall('/competitions', "POST", {
                title,
                description,
                themes: themes.map((theme) => theme.value),
                ...(logoImageId && { logoBanner: logoImageId }),
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

            const competitionId = data?._id;
            if (!competitionId) {
                setError({ code: "NO_ID", message: "Competition created but no id returned" });
                return;
            }
            navigate(`/competitions/${competitionId}`);

        } catch {
            setError({ code: 'NETWORK', message: 'Network error. Try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.pageContent}>
            <header className={styles.header}>
                <div className={styles.hero}>

                    {/* Logo */}
                    <div className={styles.logo}>
                        <div className={styles.logoContainer}
                            onClick={() => fileInputRef.current?.click()}>
                            {previewUrl ? (
                                <img className={styles.logoPic} src={previewUrl} alt="Logo preview" />
                            ) : (
                                <img className={styles.noLogo} src="/icons/competitions.svg" alt="Competition icon" />
                            )}
                        </div>
                        <button
                            type="button"
                            className={styles.uploadLogoBtn}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {previewUrl ? 'Change Logo' : 'Upload Logo'}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Title + themes */}
                    <div className={styles.heroMeta}>
                        <input
                            type="text"
                            value={title}
                            maxLength={TITLE_MAX}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title"
                            className={styles.titleInput}
                            required
                        />

                        <small className={styles.counterSmall}>
                            {title.length}/{TITLE_MAX}
                        </small>

                        <div className={formStyles.field}>
                        <span className={styles.label}>
                            Themes
                                <span className={styles.counterTheme}
                                    style={{visibility: themes.length === 0 ? "visible" : "hidden"}}> — pick at least one</span>
           
                        </span>
                    
                        <Select
                            inputId="cc-themes"
                            options={AVAILABLE_THEMES_OBJ}
                            value={themes}
                            onChange={handleSelectThemes}
                            isMulti
                            placeholder="Select up to 5 themes"
                            closeMenuOnSelect={false}
                            isOptionDisabled={() => themes.length >= 5}
                            classNamePrefix="ccSelect"
                            styles={{
                                   option: (base, state) => ({
                                        ...base,
                                        color: state.isDisabled ? "#999" : "black"
                                    }),}}
                        />
                    </div>
                    </div>
                </div>
            </header>

            {/* ── FORM SECTION ── */}
            <div className={styles.formSection}>
                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                    noValidate
                >
                    
                    {/* Description */}
                    <div className={formStyles.field}>
                        <label className={styles.label} htmlFor="cc-description">
                            Description
                        </label>
                        <textarea
                            id="cc-description"
                            value={description}
                            maxLength={DESC_MAX}
                            rows={4}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this competition about?"
                            className={styles.input}
                            required
                        />
                        <small className={styles.counter}>
                            {description.length}/{DESC_MAX}
                        </small>
                    </div>

                    {/* Logo errors / helpers */}
                    {fileError && (
                        <p className={formStyles.error} role="alert">{fileError}</p>
                    )}
                    {previewUrl && (
                        <div className={styles.previewRow}>
                            <small className={styles.previewHint}>
                                PNG, JPEG or WebP · max 1 MB
                            </small>
                            <button
                                type="button"
                                onClick={clearFile}
                                className={formStyles.cancelBtn}
                            >
                                Remove logo
                            </button>
                        </div>
                    )}

                    {/* API errors / success */}
                    {error && (
                        <p className={formStyles.error} role="alert">
                            <strong>{error.code}:</strong> {error.message}
                        </p>
                    )}
                    {success && (
                        <p className={formStyles.success} role="status">
                            Competition created.
                        </p>
                    )}

                    <div className={formStyles.actions}>
                        <button
                            type="submit"
                            className={formStyles.saveBtn}
                            disabled={!isValid || submitting}
                        >
                            {submitting ? 'Creating…' : 'Create competition'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
