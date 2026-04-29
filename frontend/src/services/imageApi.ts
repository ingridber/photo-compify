export async function uploadImage(formData: FormData) {
  return fetch("http://localhost:3000/api/v1/images", {
    method: "POST",
    body: formData,
    credentials: "include"
  });
}
