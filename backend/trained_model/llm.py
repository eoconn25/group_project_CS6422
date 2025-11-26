import requests
from typing import List, Dict
import os
import subprocess
import json

# DEPRECATED run "lms server start" in powershell - this will start an lmstudio process on port 1234

class SmartAss:
    def __init__(self, 
                 base_url=None, 
                 model='llama2:7b'):
        # perhaps implement threading to call CNN as well; threads = []; t1 = threading.Thread(target=self._llm)
        # initialize llm model -- local version
        #self.base_url = base_url
        #self.model = model

        # ollama backend within container
        self.base_url = base_url or os.getenv("OLLAMA_URL", "http://ollama:11434")
        self.model = model

        # we will want a conversation history to provide context for LLM, save previous chats, etc
        # defines it as alist of dictionaries, mapping strings to string
        self.conversation: List[Dict[str,str]] = []
        
        # path to json db
        self.data_path = ""


    def reset(self):
        # just clears the conversation history
        self.conversation = []


    def add_message(self, role:str, content:str):
        # add a message/exchange to our conversation history
        self.conversation.append({'role': role, 'content': content})
    
    # function to actually send a prompt to model and return response
    def prompt(self, prompt:str, temperature:float=0.7, max_tokens:int=512, 
               image=False, species:str=None, color:str=None) -> str:

        # call prompt engineering function
        if image:
            prompt = ("Please respond to the following prompt:" \
                      f"You have received an image of a {color} {species}" \
                      "Using the context provided, please discuss the symbolism and uses of this flower in a bouquet" \
                      "Your response should follow the following format:\n"
                      "*You have uploaded a picture of a (color) (species)\n"
                      "*Symbolism*: discuss flower symbolism\n"
                      "*Facts*: discuss flower growing region and traditional uses\n"
                      "*Care*: discuss the water and sunlight required for proper care\n"
                      "*Allergies*: discuss\n"
                      "After this, please conclude with a relevant haiku about the flower, following the proper guidelines for haiku writing."
                      "Here is an example of proper output, included in parenthesis below:"
                      "(You have uploaded a picture of a red rose." \
                      "*Symbolism*: The red rose is a romantic flower symbolizing feelings of love and passion." \
                      "*Facts*: The red rose is native to Asia and Europe, and has traditionally been used to make perfume and tea blends, in addition to serving as a romantic gift." \
                      "*Care*: Red roses should be exposed to full sun, receive moderate watering, and grow in well-drained, fertile soil." \
                      "*Allergies*: The thorns of the red rose can cause moderate irritation, so be careful when handling them. Roses are generally safe for pets, but can injure gums or stomachs if eaten." \
                      "Enjoy your red rose!  Here is a relevant haiku:"
                      "Scarlet petals blush\nsoft fire in twilight air,\nlove’s breath trembling there.)" \
                      "Do not deviate from this format, and do not invent additional symbolism beyond the context provided."
            )        
            self.add_message('user', prompt)
            # prompt db for flower symbols
            context = self.query_db(species, color)
            messages = self.prompt_engineer(prompt, context)

        else:
            self.add_message('user', prompt)
            messages = self.prompt_engineer(prompt)

        url = f'{self.base_url}/api/chat'  #generate maybe switch to chat

        # this delivers the prompt to the llm with full context
        turn = {
            'model': self.model,  # defines model
            'messages': messages,  # context/conversation history
            "stream": False
            #"temperature": temperature, # model params
            #"num_predict": max_tokens
        }

        # try to send this turn to the llm; report errors if failure
        try:
            response = requests.post(url, json=turn, timeout=180)
            response.raise_for_status()
            data = response.json()
            print(f'\n\nHERE {data}\n\n', flush=True)

            # extract llm response and add to conversation history
            message = data.get("message", {}).get("content", "").strip()
            self.add_message('assistant', message)
            return message
        
        except Exception as e:
            print(f'error: {e}')
            return 'oh no, didnt work'
        

    def prompt_engineer(self, prompt:str, context:str=None) -> List[Dict[str,str]]:
        personality = (
            "You are an expert in flower symbolism and bouquet design. "
            "Be precise, concise, and end each message with a relevant haiku on a newline."
        )
        
        # tell LLM who he is
        messages = [{"role": "system",
                     "content": personality}]
        
        # add in RAG context
        if context:
            messages.append({
                "role": "system",
                "content": f"Additional context you must use:\n{context}"
            })

        # append to convesation history for persistence
        messages.extend(self.conversation)

        return messages

        messages = self.conversation + [
            {'role': 'system', 'content': 'You are an expert in flower symbolism and bouquet design'},
            {'role': 'user', 'content': prompt}
        ]
        return messages
        # retrieve context from db
        context = self.query_db(prompt)
        
        # prompt engineer, return updated prompt
        eng_prompt = f'{context}\n\nUser: Based on the above context, please answer the following. {prompt}'
        return [
            [{'role': 'system', 'content': 'You are an expert in flower symbolism and bouquet design'}]
            + self.conversation
            + [{'role': 'user', 'content': eng_prompt}]
        ]
    
    def query_db(self, species:str, color:str):
        # open dataset
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            return f"(Database error: {e})"

        species = species.lower().strip()
        color = color.lower().strip()

        # grab that from the db
        for entry in data:
            if entry["species"].lower() == species:

                # ---- Search variants by color ----
                for variant in entry.get("variants", []):
                    if variant["color"].lower() == color:

                        # ---- Build context block ----
                        context_parts = []

                        context_parts.append(f"Species: {entry['species']}")
                        context_parts.append(f"Color Variant: {variant['color']}")
                        context_parts.append(
                            f"Symbolism: {', '.join(variant.get('symbolism', []))}"
                        )

                        context_parts.append(
                            f"Blooming Season: {', '.join(variant.get('blooming_season', []))}"
                        )

                        context_parts.append(
                            f"Native Regions: {', '.join(variant.get('native_regions', []))}"
                        )

                        care = variant.get("care", {})
                        context_parts.append(
                            f"Care Requirements — Light: {care.get('light')}, "
                            f"Water: {care.get('water')}, Soil: {care.get('soil')}"
                        )

                        # Petal count info
                        petals = variant.get("petal_count", {})
                        context_parts.append(
                            f"Petal Count: typically {petals.get('typical')} "
                            f"(range {petals.get('min')}–{petals.get('max')})"
                        )

                        # Fragrance note
                        fragrance = variant.get("fragrance", {})
                        context_parts.append(
                            f"Fragrance: {fragrance.get('description')} "
                            f"(intensity {fragrance.get('intensity')})"
                        )

                        # Traditional uses
                        uses = variant.get("traditional_uses", [])
                        context_parts.append(
                            f"Traditional Uses: {', '.join(uses)}"
                        )

                        # Allergies
                        allergies = variant.get("allergies", {})
                        context_parts.append("Allergy Concerns:")
                        for k, v in allergies.items():
                            context_parts.append(f"  {k.capitalize()}: {v}")

                        return "\n".join(context_parts)

                # If species matched but color did not
                return f"(No variant found for species '{species}' with color '{color}'.)"

        # If species not found
        return f"(Species '{species}' not found in dataset.)"

        # query sql db here for flower symbolism context
        return ""


# test the class with a prompt!!
if __name__ == "__main__":
    smart_ass = SmartAss()  # instance of class

    # test prompt
    user_prompt = "Hello, can you tell me about roses and their symbolism?"
    response = smart_ass.prompt(user_prompt)

    # print response
    print("LLM response:")
    print(response)

    # test prompt
    user_prompt = "Can you elaborate on the pro ti pyou previously mentioned?"
    response = smart_ass.prompt(user_prompt)

    # print response
    print("LLM response:")
    print(response)

    

'''
# stuff for frontend - double check
# this is in the backend
from flask import Flask, request, jsonify
from llm_handler import LLMHandler

app = Flask(__name__)
llm = SmartAss()

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()  # get json from frontend
    prompt = data.get("prompt", "")
    reply = llm.prompt(prompt)  # prompt llm
    return jsonify({"response": reply})  # return json response to frontend

# this in the frontend js
fetch("/ask", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({prompt: "Explain rose symbolism"})
})'''