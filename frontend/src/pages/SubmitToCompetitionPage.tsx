import { useNavigate, useParams } from "react-router";
import ImageUploadForm from "../components/images/ImageUploadForm";
import modalStyles from "../styles/upload-overlay.module.css";

export default function SubmitToCompetition() {
  const { id, submissionId } = useParams<{ id: string, submissionId: string }>();
  const navigate = useNavigate();

  return (
    <div className={modalStyles.modalOverlay}>
      <div 
      className={modalStyles.modalContent} 
      onClick={(e) => e.stopPropagation()}>
          <button 
              className={modalStyles.closeBtn}
              onClick={() => navigate(-1)}>
                  ✕
          </button>

          <ImageUploadForm 
            pictureType="submission"
            competitionId={id}
            submissionId={submissionId ?? ""}
            />
      </div>
    </div>
  );
}
