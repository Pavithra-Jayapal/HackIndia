import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
client = genai.Client(api_key=api_key)

models_to_test = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"]

for model_name in models_to_test:
    print(f"\nTesting model: {model_name}...")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="Say 'hello world'"
        )
        print(f"✅ Success with {model_name}! Response: {response.text.strip()}")
    except Exception as e:
        print(f"❌ Failed with {model_name}: {e}")
