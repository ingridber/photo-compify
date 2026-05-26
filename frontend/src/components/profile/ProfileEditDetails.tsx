import { useState } from "react";
import { updateUserDetails } from "../../services/api";
import profileStyle from "./profile.module.css";
import Select from "react-select";
import type { MultiValue } from "react-select";
import { useUser } from "../../hooks/useUser";
import type { ThemeOption } from "../../types/competitions";
import AVAILABLE_THEMES from "../../constants/availableThemes";

type EditProps = {
  handleSave: ()=>void;
}

const AVAILABLE_THEMES_OBJ = AVAILABLE_THEMES.map((theme) => ({
  value: theme,
  label: theme,
}));

export default function ProfileEditDetails({handleSave}: EditProps) {
  const [message, setMessage] = useState("");
  const {user, setUser} = useUser();
  const [camera, setCamera] = useState(user?.camera || "");
const [selectedThemes, setSelectedThemes] =
  useState<ThemeOption[]>(
    AVAILABLE_THEMES_OBJ.filter((theme) =>
      user?.themes?.includes(theme.value)
    )
  );

  const handleUpdateProfileDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const themes = selectedThemes.map((theme) => theme.value);
      const data = await updateUserDetails(
        camera,
        themes
      );

      setUser((prev) =>
        prev
          ? {
              ...prev,
              camera: data.user.camera,
              themes: data.user.themes,
            }
          : null
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

  const handleSelectThemes = (
    selected: MultiValue<ThemeOption>
  ) => {
    if (selected.length <= 3) {
      setSelectedThemes([...selected]);
    }
  };

  return (
    <form onSubmit={handleUpdateProfileDetails}>
      <div className={profileStyle.detailsContainer}>
        <img src="/camera-detail.svg" alt="camera icon" className={profileStyle.detailsIcon}/>

        <input
          type="text"
          className={profileStyle.detailsInput}
          placeholder="Which camera are you using?"
          maxLength={50}
          value={camera}
          onChange={(e) =>
            setCamera(e.target.value)
          }
        />
      </div>

      <div className={profileStyle.detailsContainer}>
        <img src="/theme-detail.svg" alt="picture icon" className={profileStyle.detailsIcon}/>
        <div className={profileStyle.themeSelectWrapper}>
          <Select
            classNamePrefix="react-select"
            options={AVAILABLE_THEMES_OBJ}
            value={selectedThemes}
            onChange={handleSelectThemes}
            isMulti
            placeholder="Select max 3 themes"
            closeMenuOnSelect={false}
            isOptionDisabled={() =>
              selectedThemes.length >= 3
            }
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
          className={profileStyle.submitBtn}
          type="submit">
              <img src="/check.svg" alt="icon of arrow pointing left" className={profileStyle.submitBtnIcon} />
      </button>

      {message && 
        <p>{message}</p>
      }
    </form>
  );
}