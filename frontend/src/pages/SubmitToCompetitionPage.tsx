import { useNavigate, useParams } from "react-router";
import ImageUploadForm from "../components/images/ImageUploadForm";
import mixins from "../styles/mixins.module.css";

export default function SubmitToCompetition() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className={mixins.modalOverlay}>
      <div 
      className={mixins.modalContent} 
      onClick={(e) => e.stopPropagation()}>
          <button 
              className={mixins.closeBtn}
              onClick={() => navigate(-1)}>
                  ✕
          </button>

          <ImageUploadForm 
            pictureType="submission"
            competitionId={id}/>
      </div>
    </div>
  );
}
