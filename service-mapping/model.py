from sentence_transformers import SentenceTransformer
import torch
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"

model = SentenceTransformer(
    "intfloat/multilingual-e5-base",
    device=device
)

# Service descriptions (database side)



services = [
    {
        "service_name": "Citizenship Certificate by Descent",
        "service_description": "Service to obtain a Nepali citizenship certificate as a descendant based on the citizenship of the father or mother."
    },
    {
        "service_name": "Marital-Based Citizenship Certificate",
        "service_description": "Service for foreign women married to Nepali citizens to obtain Nepali citizenship on a marital basis."
    },
    {
        "service_name": "Duplicate Citizenship Certificate",
        "service_description": "Service to issue a duplicate of a lost, damaged, or incorrect Nepali citizenship certificate."
    },
    {
        "service_name": "Non-Resident Nepali Citizenship Certificate",
        "service_description": "Service for individuals of Nepali origin living abroad to obtain non-resident Nepali citizenship."
    },
    {
        "service_name": "New Electronic Passport",
        "service_description": "Service to issue a Nepali electronic passport for the first time."
    },
    {
        "service_name": "Passport Renewal",
        "service_description": "Service to renew an existing Nepali passport that is expired or about to expire."

    },
    {
        "service_name": "Complaint or Grievance Registration",
        "service_description": "Service to register complaints or grievances regarding government services or decisions and have them investigated."
    },
    {
        "service_name": "Organization Registration",
        "service_description": "Service to register NGOs, committees, or associations to obtain legal recognition."
    },
    {
        "service_name": "Organization Renewal",
        "service_description": "Service to renew a registered organization to maintain its legal validity."
    },
    {
        "service_name": "Disaster Relief Fund",
        "service_description": "Service for victims of natural disasters such as floods, landslides, or fires to receive relief funds."
    }
]

passages = [
    f"passage: {s['service_name']}"
    for s in services
]


service_embeddings = model.encode(
    passages,
    normalize_embeddings=True
)



query = "query:  passport "

query_embedding = model.encode(
    query,
    normalize_embeddings=True
)

scores = np.dot(service_embeddings, query_embedding)

top_k = 8 # or we can write threshold 
top_indices = scores.argsort()[::-1][:top_k]

print("Top 4 matched services:")
for idx in top_indices:
    print(f"{services[idx]['service_name']} - Score: {float(scores[idx]):.4f}")
          




# services = [
#     "passage: नागरिकता प्रमाणपत्र जारी गर्ने सेवा",
#     "passage: राहदानी (पासपोर्ट) बनाउने सरकारी सेवा",
#     "passage: स्थायी लेखा नम्बर (PAN) दर्ता सेवा"
# ]

# service_embeddings = model.encode(
#     services,
#     normalize_embeddings=True
# )


# # User query
# query = "query: नागरिकता बनाउन के चाहिन्छ"
# query_embedding = model.encode(
#     query,
#     normalize_embeddings=True
# )

# # Cosine similarity = dot product (because normalized)
# import numpy as np

# scores = np.dot(service_embeddings, query_embedding)

# best_idx = scores.argmax()
# print("Best match:", services[best_idx])
# print("Score:", scores[best_idx])
