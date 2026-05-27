import { useState } from "react";
import { updateUserDetails } from "../../services/api";
import profileStyle from "./profile.module.css";
import Select from "react-select";
import type { MultiValue } from "react-select";
import { useUser } from "../../hooks/useUser";
import type { ThemeOption } from "../../types/competitions";
import AVAILABLE_THEMES from "../../constants/availableThemes";

type EditProps = {
    handleSave: () => void;
};

const AVAILABLE_THEMES_OBJ = AVAILABLE_THEMES.map((theme) => ({
    value: theme,
    label: theme,
}));

export default function ProfileEditDetails({ handleSave }: EditProps) {
    const [message, setMessage] = useState("");
    const { user, setUser } = useUser();
    const [camera, setCamera] = useState(user?.camera || "");
    const [selectedThemes, setSelectedThemes] = useState<ThemeOption[]>(
        AVAILABLE_THEMES_OBJ.filter((theme) => user?.themes?.includes(theme.value))
    );

    const handleUpdateProfileDetails = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const themes = selectedThemes.map((theme) => theme.value);
            const data = await updateUserDetails(camera, themes);
            setUser((prev) =>
                prev ? { ...prev, camera: data.user.camera, themes: data.user.themes } : null
            );
            handleSave();
        } catch (err) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Something went wrong");
            }
        }
    };

    const handleSelectThemes = (selected: MultiValue<ThemeOption>) => {
        if (selected.length <= 3) {
            setSelectedThemes([...selected]);
        }
    };

    return (
        <form onSubmit={handleUpdateProfileDetails} className={profileStyle.editForm}>
            {/* CAMERA FIELD */}
            <div className={profileStyle.editField}>
                <label className={profileStyle.editLabel}>Camera</label>
                <input
                    type="text"
                    className={profileStyle.editInput}
                    placeholder="Which camera are you shooting with?"
                    maxLength={50}
                    value={camera}
                    onChange={(e) => setCamera(e.target.value)}
                />
            </div>

            {/* THEMES FIELD */}
            <div className={profileStyle.editField}>
                <label className={profileStyle.editLabel}>
                    Themes <span className={profileStyle.editLabelMuted}>— select up to 3</span>
                </label>
                <div className={profileStyle.selectWrapper}>
                    <Select
                        classNamePrefix="cinema-select"
                        options={AVAILABLE_THEMES_OBJ}
                        value={selectedThemes}
                        onChange={handleSelectThemes}
                        isMulti
                        placeholder="Select themes…"
                        closeMenuOnSelect={false}
                        isOptionDisabled={() => selectedThemes.length >= 3}
                        menuPortalTarget={document.body}
                    />
                </div>
            </div>

            {/* ACTIONS */}
            <div className={profileStyle.editActions}>
                {message && <p className={profileStyle.editError}>{message}</p>}
                <button type="submit" className={profileStyle.saveBtn}>
                    Save Changes
                </button>
            </div>
        </form>
    );
}
