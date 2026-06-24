import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 120000,
});

export async function fetchHealth() {
  const { data } = await client.get("/api/health");
  return data;
}

export async function fetchAtlas(params = {}) {
  const { data } = await client.get("/api/atlas", { params });
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
