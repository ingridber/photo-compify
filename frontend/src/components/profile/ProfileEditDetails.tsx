import { useState } from "react";
import { updateUserDetails } from "../../services/api";
import styles from "./profile.module.css";
import Select from "react-select";
import type { MultiValue } from "react-select";
import { useUser } from "../../hooks/useUser";

type EditProps = {
  handleSave: ()=>void;
}

type ThemeOption = {
  value: string;
  label: string;
};

const AVAILABLE_THEMES: ThemeOption[] = [
  { value: "Portrait", label: "Portrait" },
  { value: "Landscape", label: "Landscape" },
  { value: "Street", label: "Street" },
  { value: "Wildlife", label: "Wildlife" },
  { value: "Macro", label: "Macro" },
  { value: "Architecture", label: "Architecture" },
  { value: "Nature", label: "Nature" },
  { value: "Travel", label: "Travel" },
  { value: "Minimalist", label: "Minimalist" },
  { value: "Black & White", label: "Black & White" },
  { value: "Long Exposure", label: "Long Exposure" },
  { value: "Abstract", label: "Abstract" },
  { value: "Aerial", label: "Aerial" },
  { value: "Night", label: "Night" },
  { value: "Astrophotography", label: "Astrophotography" },
  { value: "Documentary", label: "Documentary" },
];

export default function ProfileEditDetails({handleSave}: EditProps) {
  // const [camera, setCamera] = useState("");
  // const [selectedThemes, setSelectedThemes] = useState<ThemeOption[]>([]);
    const [message, setMessage] = useState("");
  const {user, setUser} = useUser();
  const [camera, setCamera] = useState(
  user?.camera || ""
);

const [selectedThemes, setSelectedThemes] =
  useState<ThemeOption[]>(
    AVAILABLE_THEMES.filter((theme) =>
      user?.themes?.includes(theme.value)
    )
  );


  const handleUpdateProfileDetails = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const themes = selectedThemes.map(
        (theme) => theme.value
      );

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
          options={AVAILABLE_THEMES}
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