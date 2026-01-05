from sentence_transformers import SentenceTransformer
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"

model = SentenceTransformer(
    "intfloat/multilingual-e5-base",
    device=device
)

# Service descriptions (database side)
services = [
    "passage: नागरिकता प्रमाणपत्र जारी गर्ने सेवा",
    "passage: राहदानी (पासपोर्ट) बनाउने सरकारी सेवा",
    "passage: स्थायी लेखा नम्बर (PAN) दर्ता सेवा"
]

service_embeddings = model.encode(
    services,
    normalize_embeddings=True
)

# User query
query = "query: नागरिकता बनाउन के चाहिन्छ"
query_embedding = model.encode(
    query,
    normalize_embeddings=True
)

# Cosine similarity = dot product (because normalized)
import numpy as np

scores = np.dot(service_embeddings, query_embedding)

best_idx = scores.argmax()
print("Best match:", services[best_idx])
print("Score:", scores[best_idx])
