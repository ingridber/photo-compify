import { apiCall } from "../utils/apiCall";

export async function uploadImage(formData: FormData) {
  return apiCall("/images", "POST", formData );
}

export async function deleteImage(id: string) {

  const res =  await apiCall(`/images/${id}`, "DELETE")

  if(!res.ok) {return false};
  return true;
}
