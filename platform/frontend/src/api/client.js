import axios from "axios";

/** Same-origin /api — proxied to the backend by Vite (dev) or Vercel (prod). */
const client = axios.create({
  baseURL: "",
  timeout: 120000,
});

function formatApiError(err) {
  if (err.response?.data?.detail) {
    const d = err.response.data.detail;
    return typeof d === "string" ? d : JSON.stringify(d);
  }
  if (err.code === "ERR_NETWORK") {
    return "Cannot reach the API. If this is a Vercel deploy, set VITE_API_URL to your HF Space URL and redeploy.";
  }
  if (typeof err.response?.data === "string" && err.response.data.includes("<!DOCTYPE")) {
    return "API returned HTML instead of JSON — Vercel is not proxying /api to the backend. Set VITE_API_URL and redeploy.";
  }
  return err.message || "API request failed";
}

client.interceptors.response.use(
  (res) => {
    const data = res.data;
    if (typeof data === "string" && data.trimStart().startsWith("<!")) {
      throw new Error(
        "API returned HTML instead of JSON — configure VITE_API_URL on Vercel and redeploy."
      );
    }
    return res;
  },
  (err) => Promise.reject(new Error(formatApiError(err)))
);

export async function fetchHealth() {
  const { data } = await client.get("/api/health");
  return data;
}

export async function fetchAtlas(params = {}) {
  const { data } = await client.get("/api/atlas", { params });
  if (!Array.isArray(data?.cells)) {
    throw new Error("Invalid atlas response — backend may be unreachable.");
  }
  return data;
}

export async function fetchLRInteractions(params = {}) {
  const { data } = await client.get("/api/lr-interactions", { params });
  return data;
}

export async function uploadScore(file, cellIdColumn, cellTypeColumn) {
  const form = new FormData();
  form.append("file", file);
  form.append("cell_id_column", cellIdColumn);
  form.append("cell_type_column", cellTypeColumn);
  const { data } = await client.post("/api/score", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function uploadClassify(file, cellIdColumn, cellTypeColumn) {
  const form = new FormData();
  form.append("file", file);
  form.append("cell_id_column", cellIdColumn);
  form.append("cell_type_column", cellTypeColumn);
  const { data } = await client.post("/api/classify", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 300000,
  });
  return data;
}

export async function uploadDiseaseCompare(file, options = {}) {
  const form = new FormData();
  form.append("file", file);
  const defaults = {
    cell_id_column: "cell_id",
    score_column: "AD_support_score",
    disease_column: "disease",
    braak_column: "Braak stage",
    adnc_column: "ADNC",
    apoe4_column: "APOE4 status",
    cps_column: "Continuous Pseudo-progression Score",
  };
  Object.entries({ ...defaults, ...options }).forEach(([k, v]) => form.append(k, v));
  const { data } = await client.post("/api/disease-compare", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchDiseaseReference() {
  const { data } = await client.get("/api/disease-reference");
  return data;
}

export default client;
