import { useState } from "react";
import { updateUserDetails } from "../../services/api";
import styles from "./profile.module.css";
import Select from "react-select";
import type { MultiValue } from "react-select";
import { useUser } from "../../hooks/useUser";
// import { AVAILABLE_THEMES_OBJ } from "../../constants/availableThemes";
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
  const [camera, setCamera] = useState(
  user?.camera || ""
);

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
      setMessage("Profile updated!");
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
    <form
      className={styles.detailsContainer}
      onSubmit={handleUpdateProfileDetails}
    >
      <div>
        <img
          src="/camera-detail.svg"
          alt="camera icon"
        />

        <input
          type="text"
          placeholder="Which camera are you using?"
          maxLength={50}
          value={camera}
          onChange={(e) =>
            setCamera(e.target.value)
          }
        />

        <p>
          Enter the camera you use, max 50
          characters
        </p>
      </div>

      <div>
        <img
          src="/theme-detail.svg"
          alt="picture icon"
        />

        <Select
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

      <button type="submit">
        Save profile
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}