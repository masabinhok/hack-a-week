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
        "service_name": "वंशज नागरिकता प्रमाणपत्र",
        "service_description": "बाबु वा आमाको नागरिकताको आधारमा वंशजको रूपमा नेपाली नागरिकता प्रमाणपत्र प्राप्त गर्ने सेवा।"
    },
    {
        "service_name": "वैवाहिक अंगीकृत नागरिकता प्रमाणपत्र",
        "service_description": "नेपाली नागरिकसँग विवाह गरेका विदेशी महिलाले वैवाहिक आधारमा नेपाली नागरिकता प्राप्त गर्ने सेवा।"
    },
    {
        "service_name": "नागरिकता प्रमाणपत्रको प्रतिलिपि",
        "service_description": "हराएको, बिग्रिएको वा विवरण सच्याउनुपर्ने नागरिकता प्रमाणपत्रको प्रतिलिपि निकाल्ने सेवा।"
    },
    {
        "service_name": "गैर-आवासीय नेपाली नागरिकता प्रमाणपत्र",
        "service_description": "विदेशमा बसोबास गर्ने नेपाली मूलका व्यक्तिका लागि गैर-आवासीय नेपाली नागरिकता प्राप्त गर्ने सेवा।"
    },
    {
        "service_name": "नयाँ विद्युतीय राहदानी",
        "service_description": "पहिलो पटक नेपाली विद्युतीय राहदानी (पासपोर्ट) जारी गराउने सेवा।"
    },
    {
        "service_name": "राहदानी नवीकरण",
        "service_description": "म्याद सकिएको, हराएको वा विवरण सच्याउनुपर्ने नेपाली राहदानी नवीकरण गर्ने सेवा।"
    },
    {
        "service_name": "गुनासो वा ठाडो उजुरी",
        "service_description": "सरकारी सेवा वा निर्णय सम्बन्धी गुनासो वा उजुरी दर्ता गरी छानबिन गराउने सेवा।"
    },
    {
        "service_name": "संस्था दर्ता",
        "service_description": "गैर-सरकारी संस्था, समिति वा संघ दर्ता गरी कानुनी मान्यता प्राप्त गर्ने सेवा।"
    },
    {
        "service_name": "संस्था नवीकरण",
        "service_description": "दर्ता भइसकेको संस्थाको नवीकरण गरी वैधता कायम गर्ने सेवा।"
    },
    {
        "service_name": "दैवी प्रकोप राहत रकम",
        "service_description": "बाढी, पहिरो, आगलागी जस्ता दैवी प्रकोपबाट पीडितले राहत रकम प्राप्त गर्ने सेवा।"
    }
]

passages = [
    f"passage: {s['service_description']}"
    for s in services
]


service_embeddings = model.encode(
    passages,
    normalize_embeddings=True
)



query = "query: marriage nagarikta certificate "

query_embedding = model.encode(
    query,
    normalize_embeddings=True
)

scores = np.dot(service_embeddings, query_embedding)

top_k = 4 # or we can write threshold 
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
