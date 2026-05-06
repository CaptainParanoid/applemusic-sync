import os
import time
from dotenv import load_dotenv
import jwt

# Load the credentials 
load_dotenv()
key_id = os.getenv("KEY_ID")
team_id = os.getenv("TEAM_ID")
private_key = os.getenv("PRIVATE_KEY")

with open(private_key, "r") as file:
    private_key = file.read()

# Generate the token
headers = {
    "alg": "ES256",
    "kid": key_id
}

payload = {
    "iss": team_id,
    "iat": int(time.time()),
    "exp": int(time.time()) + 15777000 # Expires after 6 months
}

token = jwt.encode(payload, private_key, algorithm="ES256", headers=headers)

# Write the token to the .env file 
with open(".env", "r") as file: 
    env_content = file.read()

if "DEVELOPER_TOKEN" in env_content:
    # Update existing line
    lines = env_content.splitlines()
    lines = [f"DEVELOPER_TOKEN={token}" if l.startswith("DEVELOPER_TOKEN") else l for l in lines]
    new_content = "\n".join(lines)
    
else:
    # Add it for the first time
    new_content = env_content + f"\nDEVELOPER_TOKEN='{token}'"

with open(".env", "w") as f:
    f.write(new_content)

print("Token written to .env successfully!")