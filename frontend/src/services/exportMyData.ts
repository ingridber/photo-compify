export async function exportMyData() {
  const res = await fetch("http://localhost:3000/api/v1/user/export-my-data", {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Could not export user data");
  }

  const data = await res.json();

  // Create a Blob (binary large object) from the JSON data
  // This turns the JavaScript object into a downloadable file in memory
  const blob = new Blob(
    [JSON.stringify(data, null, 2)], 
    { type: "application/json" }
  );

  // Create a temporary URL pointing to the Blob file
  const url = window.URL.createObjectURL(blob);

  // Create a temporary <a> element used to trigger the download
  // Set the download URL to the Blob URL
  // Set the filename for the downloaded file
  // Add the element to the DOM (required for click to work in some browsers)
   // Click the link to start the download
  const a = document.createElement("a");
  a.href = url;
  a.download = "user-data.json";
  document.body.appendChild(a);
  a.click();

  // Remove the temporary element from the DOM
  // Free up memory by revoking the temporary Blob URL
  a.remove();
  window.URL.revokeObjectURL(url);
}