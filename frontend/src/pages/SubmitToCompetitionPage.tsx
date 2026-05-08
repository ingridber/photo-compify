import { useParams } from "react-router";
import ImageUploadForm from "../components/images/ImageUploadForm";

export default function SubmitToCompetition() {
  const { id } = useParams<{ id: string }>();

  return (
    <ImageUploadForm
      pictureType="submission"
      competitionId={id}
    />
  );
}
