export async function validateImage(imageFile: Express.Multer.File) {
  const formData = new FormData();

  formData.append(
    "media",
    new Blob(
      [new Uint8Array(imageFile.buffer)],
      { type: imageFile.mimetype }
    ),
    imageFile.originalname
  );

  formData.append(
    "models",
    "nudity-2.1,weapon,recreational_drug"
  );

  formData.append(
    "api_user",
    process.env.SIGHTENGINE_USER || ""
  );

  formData.append(
    "api_secret",
    process.env.SIGHTENGINE_SECRET || ""
  );

  const response = await fetch(
    "https://api.sightengine.com/1.0/check.json",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  const sexualActivity = data.nudity?.sexual_activity || 0;
  const sexualDisplay = data.nudity?.sexual_display || 0;
  const erotica = data.nudity?.erotica || 0;

  const firearm = data.weapon?.classes?.firearm || 0;
  const knife = data.weapon?.classes?.knife || 0;

  const recreationalDrug = data.recreational_drug?.prob || 0;

  if (
    sexualActivity > 0.7 ||
    sexualDisplay > 0.7 ||
    erotica > 0.7
  ) {
    return {
      approved: false,
      reason: "nudity",
      data,
    };
  }

  if (
    firearm > 0.7 ||
    knife > 0.7
  ) {
    return {
      approved: false,
      reason: "weapon",
      data,
    };
  }

  if (recreationalDrug > 0.7) {
    return {
      approved: false,
      reason: "recreational_drug",
      data,
    };
  }

  return {
    approved: true,
    data,
  };
}