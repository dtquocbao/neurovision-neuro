"""Smoke test for post-MVP API endpoints."""
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1] / "platform" / "backend"
sys.path.insert(0, str(BACKEND))

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402

client = TestClient(app)

r = client.get("/api/health")
print("health", r.status_code, r.json())

r = client.get("/api/disease-reference")
print("disease-ref", r.status_code, list(r.json().keys()) if r.ok else r.text)

csv = "cell_id,AD_support_score,disease,Braak stage,ADNC\n"
csv += "c1,0.35,normal,Braak 0,Not AD\n"
csv += "c2,0.20,dementia,Braak V,High\n"
csv += "c3,0.28,normal,Braak II,Low\n"
r = client.post("/api/disease-compare", files={"file": ("test.csv", csv.encode(), "text/csv")})
print("disease-compare", r.status_code)
if r.ok:
    d = r.json()
    print("  n_cells", d["n_cells"], "columns", d["columns_used"])
else:
    print(r.text[:500])

r = client.post("/api/classify", files={"file": ("test.csv", b"cell_id,APOE\na,1.0", "text/csv")})
print("classify", r.status_code, (r.json().get("detail") or "")[:100] if not r.ok else "unexpected ok")
