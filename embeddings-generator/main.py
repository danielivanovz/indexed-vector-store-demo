import os
import random
import json
from dotenv import load_dotenv
from langchain.embeddings import HuggingFaceEmbeddings
from sentence_transformers import SentenceTransformer

def create_dataset():
    subjects = [
        "I", "You", "He", "She", "We", "They", "People", "Kids", "Adults", "Teenagers", 
        "Parents", "Teachers", "Doctors", "Engineers", "Artists", "Scientists", "Athletes", "Celebrities"
    ]

    actions = [
        "like to", "prefer to", "hate to", "love to", "tend to", "often", "rarely", 
        "always", "sometimes", "occasionally", "seldom", "usually", "enjoy to", "fail to",
        "struggle to", "manage to", "attempt to", "choose to"
    ]

    objects = [
        "eat apples", "drink water", "read books", "watch movies", "play games", "drive cars", 
        "sing songs", "dance", "jog in the park", "write essays", "buy groceries", "listen to music",
        "cook meals", "attend classes", "study hard", "take breaks", "do yoga", "swim in the pool",
        "travel abroad", "attend concerts", "take photos", "use computers", "garden", "paint",
        "climb mountains", "cycle", "go fishing", "browse the internet", "chat with friends", "do crafts",
        "watch TV", "sleep late", "wake up early", "shop online", "eat out", "work out", "go to parties",
        "hike", "camp outdoors", "play instruments", "draw sketches", "study languages", "bake cakes",
        "solve puzzles", "do DIY projects"
    ]

    combinations = [(subject, action, obj) for subject in subjects for action in actions for obj in objects]
    random.shuffle(combinations)
    dataset = [" ".join(combination) + "." for combination in combinations]
    return dataset

def get_embeddings(text_chunks):
    embeddings = []
    model_name = os.getenv('MODEL_NAME')

    if not model_name:
        raise ValueError('MODEL_NAME environment variable is not set.')
    
    encode_kwargs = {'normalize_embeddings': True}
    embedder = HuggingFaceEmbeddings(
        model_name=model_name,
        encode_kwargs=encode_kwargs
    )
      
    for chunk in text_chunks:
        embedding = embedder.embed_query(chunk)
        if isinstance(embedding, (list, tuple)):
            embeddings.append(embedding)
        else: 
            embeddings.append(embedding.tolist())
        print('processing chunk number', len(embeddings), end='\r')
    return embeddings


def save_embeddings(embeddings, filename):
    with open(filename, 'w') as file:
        json.dump(embeddings, file)

def chunk_list(input_list, chunk_size):
    for i in range(0, len(input_list), chunk_size):
        yield input_list[i:i + chunk_size]

def main():
    load_dotenv()

    text_chunks = create_dataset()
    embeddings_raw = get_embeddings(text_chunks)    
    
    embeddings = [
        {
            "text": text_chunks[index],
            "vector": embedding
        } 
        for index, embedding in enumerate(embeddings_raw)
    ]
    
    chunked_embeddings = list(chunk_list(embeddings, len(embeddings)//5))

    output_dir = os.getenv('OUTPUT_DIR')
    if not output_dir: 
        raise ValueError('OUTPUT_DIR environment variable is not set.')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    for index, chunk in enumerate(chunked_embeddings):
        save_embeddings(chunk, os.path.join(output_dir, f'embeddings_{index+1}.json'))


if __name__ == "__main__":
    main()