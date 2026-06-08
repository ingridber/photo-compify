import { apiCall } from "../utils/apiCall";

export async function uploadImage(formData: FormData) {
    return apiCall("/images", "POST", { formData })
};
